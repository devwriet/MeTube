import { el } from './render.js';
import { icon } from './icons.js';
import { toast } from './card-menu.js';
import { playerPrefs, setPlayerPrefs, history } from './store.js';

const isNarrow = () => matchMedia('(max-width: 999px)').matches;
const trimmedRate = (rate) => `${Number(rate.toFixed(2))}x`;

export function installExtras(ctx) {
  const { player, media, right, fullscreenButton, feedback } = ctx;
  // 로드 자동재생(player.js)이랑 아래 다음 동영상 카운트다운이 같이 씀
  let autoplay = playerPrefs().autoplay;
  let countdownTimer = 0;
  let touchPointerAt = 0;
  let touchPointerType = '';
  let keyboardOpened = false;
  let keyboardReturnFocus = null;

  const autoplayButton = el('button', 'player-button player-autoplay');
  autoplayButton.type = 'button';
  autoplayButton.setAttribute('role', 'switch');
  autoplayButton.setAttribute('aria-label', '자동재생');
  const track = el('span', 'player-autoplay-track');
  const knob = el('span', 'player-autoplay-knob');
  track.append(knob);
  autoplayButton.append(track);
  right.prepend(autoplayButton);

  function paintAutoplay() {
    autoplayButton.setAttribute('aria-checked', String(autoplay));
    autoplayButton.classList.toggle('is-on', autoplay);
    knob.replaceChildren(icon(autoplay ? 'play_arrow' : 'pause'));
  }
  paintAutoplay();
  autoplayButton.addEventListener('click', () => {
    autoplay = !autoplay;
    setPlayerPrefs({ autoplay });
    paintAutoplay();
    if (!autoplay) { hideNext(); showEnd(); }
  });
  feedback.tooltip(autoplayButton);

  const theaterButton = el('button', 'player-button player-theater');
  theaterButton.type = 'button';
  theaterButton.setAttribute('aria-pressed', 'false');
  // watch.js가 .watch-layout에 넣는 건 플레이어 만든 뒤라 함수로 찾음
  const layout = () => player.closest('.watch-layout');
  function paintTheater(on) {
    layout()?.classList.toggle('watch-theater', on);
    theaterButton.setAttribute('aria-pressed', String(on));
    theaterButton.setAttribute('aria-label', on ? '기본 보기' : '극장 모드');
    theaterButton.replaceChildren(icon(on ? 'width_normal' : 'width_wide'));
  }
  paintTheater(false);
  theaterButton.addEventListener('click', () => {
    if (!isNarrow()) paintTheater(!layout()?.classList.contains('watch-theater'));
  });
  fullscreenButton.before(theaterButton);
  feedback.tooltip(theaterButton, 'T');
  theaterButton.hidden = isNarrow();
  const theaterQuery = matchMedia('(max-width: 999px)');
  theaterQuery.addEventListener('change', () => {
    theaterButton.hidden = theaterQuery.matches;
    if (theaterQuery.matches) paintTheater(false);
  });

  const nextOverlay = el('div', 'player-autoplay-next');
  nextOverlay.hidden = true;
  nextOverlay.setAttribute('role', 'group');
  nextOverlay.setAttribute('aria-label', '다음 동영상');
  const nextHeading = el('div', 'player-autoplay-heading', '다음 동영상');
  const nextTitle = el('div', 'player-autoplay-title');
  const progress = el('div', 'player-autoplay-progress');
  progress.setAttribute('aria-hidden', 'true');
  const actions = el('div', 'player-autoplay-actions');
  const cancelButton = el('button', 'player-autoplay-action', '취소');
  cancelButton.type = 'button';
  const playNowButton = el('button', 'player-autoplay-action player-autoplay-now', '지금 재생');
  playNowButton.type = 'button';
  actions.append(cancelButton, playNowButton);
  nextOverlay.append(nextHeading, nextTitle, progress, actions);
  player.append(nextOverlay);

  let nextHref = '';
  let focusWasInPlayer = false;
  function hideNext() {
    clearInterval(countdownTimer);
    countdownTimer = 0;
    if (!nextOverlay.hidden && nextOverlay.contains(document.activeElement)) player.focus();
    nextOverlay.hidden = true;
    nextHref = '';
  }
  function navigateNext() {
    if (!nextHref) return;
    // 다음 영상으로 납치 ㄱㄱ
    location.href = nextHref;
  }
  // youtube 참고. 마지막 프레임을 backdrop-filter로 흐리게 깔고 띄움
  const endScreen = el('div', 'player-end');
  endScreen.hidden = true;
  endScreen.setAttribute('role', 'group');
  endScreen.setAttribute('aria-label', '추천 동영상');
  player.append(endScreen);
  function hideEnd() {
    endScreen.hidden = true;
    endScreen.replaceChildren();
  }
  function showEnd() {
    // 사이드바 카드에서 읽음. 필터, 순서가 목록이랑 똑같아야 해서
    const cards = [...document.querySelectorAll('.watch-secondary .related-card')].slice(0, 3);
    if (!media.ended || !cards.length) return;
    endScreen.replaceChildren(...cards.map((card) => {
      const source = card.querySelector('.related-title a');
      const title = el('h3', 'player-end-title');
      const link = el('a', '', source.childNodes[0].textContent);
      link.href = source.href;
      title.append(link);
      const thumbSource = card.querySelector('.related-thumb');
      const thumbBox = el('div', 'related-thumb');
      thumbBox.dataset.tone = thumbSource.dataset.tone;
      const sourceImage = thumbSource.querySelector('.thumb-img');
      if (sourceImage) {
        const image = el('img', 'thumb-img');
        image.alt = '';
        image.src = sourceImage.src;
        thumbBox.append(image);
      }
      thumbBox.append(el('span', 'card-duration', thumbSource.textContent));
      const thumbLink = el('a', 'card-link');
      thumbLink.href = source.href;
      thumbLink.tabIndex = -1;
      thumbLink.setAttribute('aria-hidden', 'true');
      thumbLink.append(thumbBox);
      const item = el('div', 'player-end-card');
      item.append(
        thumbLink,
        title,
        el('div', 'player-end-meta', card.querySelector('.related-channel').textContent),
        el('div', 'player-end-meta', card.querySelector('.related-stats').textContent),
      );
      return item;
    }));
    endScreen.hidden = false;
  }
  cancelButton.addEventListener('click', () => { hideNext(); showEnd(); });
  playNowButton.addEventListener('click', navigateNext);
  function showNext() {
    // 본 영상 건너뛰기ㄱㄱ (둘이 서로 첫 추천이면 무한 핑퐁 터짐 = 망)
    const watched = new Set(history());
    const link = [...document.querySelectorAll('.watch-secondary a[href*="watch.html"]')]
      .find((a) => !watched.has(new URL(a.href).searchParams.get('v')));
    if (!autoplay || !link) return;
    hideNext();
    nextHref = link.href;
    const titleLink = link.closest('.related-card')?.querySelector('.related-title a');
    nextTitle.textContent = titleLink ? titleLink.childNodes[0].textContent : link.textContent.trim();
    focusWasInPlayer = player.contains(document.activeElement);
    nextOverlay.style.setProperty('--progress', '100%');
    nextOverlay.hidden = false;
    if (focusWasInPlayer) cancelButton.focus();
    const started = performance.now();
    countdownTimer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const remaining = Math.max(0, 5000 - elapsed);
      nextOverlay.style.setProperty('--progress', `${remaining / 50}%`);
      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = 0;
        navigateNext();
      }
    }, 50);
  }
  media.addEventListener('ended', () => { showNext(); if (nextOverlay.hidden) showEnd(); });
  // 카운트다운 중 나가면 bfcache에 얼어붙음
  // 얼린 타이머가 뒤로가기 때 터짐. 그래서 pagehide에서 끔
  window.addEventListener('pagehide', hideNext);
  media.addEventListener('seeking', () => { hideNext(); hideEnd(); });
  media.addEventListener('play', () => { hideNext(); hideEnd(); });

  const contextMenu = el('div', 'player-context player-popup');
  contextMenu.hidden = true;
  contextMenu.setAttribute('role', 'menu');
  contextMenu.style.setProperty('--x', '0px');
  contextMenu.style.setProperty('--y', '0px');
  // 메뉴 항목 만들기 복붙 시리즈 욜라 귀차늠
  const loopItem = el('button', 'player-context-item');
  loopItem.type = 'button';
  loopItem.setAttribute('role', 'menuitemcheckbox');
  loopItem.append(icon('repeat'), el('span', '', '반복 재생'));
  const loopCheck = icon('check');
  loopCheck.classList.add('player-context-check');
  loopItem.append(loopCheck);
  const copyItem = el('button', 'player-context-item');
  copyItem.type = 'button';
  copyItem.setAttribute('role', 'menuitem');
  copyItem.append(icon('link'), el('span', '', '동영상 URL 복사'));
  const copyTimeItem = el('button', 'player-context-item');
  copyTimeItem.type = 'button';
  copyTimeItem.setAttribute('role', 'menuitem');
  copyTimeItem.append(icon('schedule'), el('span', '', '현재 시간에 동영상 URL 복사'));
  contextMenu.append(loopItem, copyItem, copyTimeItem);
  player.append(contextMenu);

  function paintLoop() {
    loopItem.setAttribute('aria-checked', String(media.loop));
    loopCheck.toggleAttribute('hidden', !media.loop);
  }
  paintLoop();
  loopItem.addEventListener('click', () => {
    media.loop = !media.loop;
    paintLoop();
  });
  function videoUrl(withTime = false) {
    const url = new URL('watch.html', location.href);
    url.searchParams.set('v', ctx.video.id);
    if (withTime) url.searchParams.set('t', String(Math.floor(media.currentTime)));
    return url.href;
  }
  async function copyLink(withTime) {
    try {
      await navigator.clipboard.writeText(videoUrl(withTime));
      toast('링크를 복사했습니다.');
    } catch {
      toast('링크를 복사하지 못했습니다.');
    }
    closeContext(false);
  }
  copyItem.addEventListener('click', () => { void copyLink(false); });
  copyTimeItem.addEventListener('click', () => { void copyLink(true); });

  function closeContext(restoreFocus = false) {
    if (contextMenu.hidden) return;
    contextMenu.hidden = true;
    ctx.keepVisible(false);
    if (restoreFocus && keyboardOpened && keyboardReturnFocus?.isConnected) keyboardReturnFocus.focus();
    keyboardOpened = false;
    keyboardReturnFocus = null;
  }
  function openContext(clientX, clientY, keyboard = false) {
    player.dispatchEvent(new CustomEvent('player-popup-open', { detail: contextMenu }));
    contextMenu.hidden = false;
    ctx.keepVisible(true);
    keyboardOpened = keyboard;
    keyboardReturnFocus = keyboard ? document.activeElement : null;
    const bounds = player.getBoundingClientRect();
    const menuBounds = contextMenu.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width - menuBounds.width, clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height - menuBounds.height, clientY - bounds.top));
    contextMenu.style.setProperty('--x', `${x}px`);
    contextMenu.style.setProperty('--y', `${y}px`);
    paintLoop();
    contextMenu.querySelector('[role^="menuitem"]')?.focus();
  }
  player.addEventListener('player-popup-open', (event) => {
    if (event.detail !== contextMenu) closeContext(false);
  });
  player.addEventListener('pointerdown', (event) => {
    touchPointerType = event.pointerType;
    touchPointerAt = Date.now();
  });
  player.addEventListener('contextmenu', (event) => {
    if (event.target.closest('.player-popup')) return;
    // 터치 길게 누르면 contextmenu도 쏨. 브라우저 쪽으로 넘김
    if (touchPointerType === 'touch' && Date.now() - touchPointerAt < 3000) return;
    if (event.pointerType === 'touch' || event.sourceCapabilities?.firesTouchEvents) return;
    event.preventDefault();
    openContext(event.clientX, event.clientY);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!contextMenu.hidden && !contextMenu.contains(event.target)) closeContext(false);
  });
  contextMenu.addEventListener('focusout', (event) => {
    if (!contextMenu.contains(event.relatedTarget)) queueMicrotask(() => {
      if (!contextMenu.contains(document.activeElement)) closeContext(false);
    });
  });
  contextMenu.addEventListener('keydown', (event) => {
    const items = [...contextMenu.querySelectorAll('[role^="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      closeContext(true);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      items[(index + direction + items.length) % items.length]?.focus();
    }
  });

  function onDocumentKey(event) {
    if (contextMenu.hidden && (event.key === 'F10' && event.shiftKey || event.key === 'ContextMenu') && player.contains(event.target)) {
      event.preventDefault();
      const rect = player.getBoundingClientRect();
      openContext(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
      return;
    }
    if (!ctx.canHandleKey(event)) return;
    if (event.key === 't' || event.key === 'T') {
      if (isNarrow()) return;
      event.preventDefault();
      paintTheater(!layout()?.classList.contains('watch-theater'));
      return;
    }
    if (event.key === '<' || event.key === '>') {
      event.preventDefault();
      const delta = event.key === '<' ? -0.25 : 0.25;
      const rate = Math.min(2, Math.max(0.25, Math.round((media.playbackRate + delta) * 100) / 100));
      media.playbackRate = rate;
      feedback.text(trimmedRate(rate));
      return;
    }
    if (event.key === ',' || event.key === '.') {
      if (!media.paused) return;
      event.preventDefault();
      // 30fps라고 우김 (실제 프레임레이트 안 읽음 | 개발 시간 부족)
      const delta = event.key === ',' ? -1 / 30 : 1 / 30;
      media.currentTime = Math.max(0, Math.min(Number.isFinite(media.duration) ? media.duration : Infinity, media.currentTime + delta));
      feedback.text(event.key === ',' ? '-1프레임' : '+1프레임');
    }
  }
  document.addEventListener('keydown', onDocumentKey);

  const startTime = new URLSearchParams(location.search).get('t');
  if (startTime !== null && /^\d+$/.test(startTime)) {
    const target = Number(startTime);
    if (Number.isInteger(target) && Number.isFinite(target)) {
      const goal = () => Math.max(0, Number.isFinite(media.duration) ? Math.min(target, Math.max(0, media.duration - 0.01)) : target);
      const seekable = () => media.seekable.length > 0 && media.seekable.end(media.seekable.length - 1) >= goal();
      // range 요청 안 되는 서버는 데이터 다 받아야 seek 됨
      const applyStartTime = () => {
        if (!seekable()) return;
        media.currentTime = goal();
        media.removeEventListener('progress', applyStartTime);
        media.removeEventListener('canplaythrough', applyStartTime);
      };
      media.addEventListener('progress', applyStartTime);
      media.addEventListener('canplaythrough', applyStartTime);
      if (media.readyState >= 1) applyStartTime();
      else media.addEventListener('loadedmetadata', applyStartTime, { once: true });
    }
  }
}
