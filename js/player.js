import { el } from './render.js';
import { icon } from './icons.js';
import { formatDuration } from './format.js';
import { playerPrefs, setPlayerPrefs } from './store.js';
import { installFeedback } from './player-feedback.js';
import { installSettings } from './player-settings.js';
import { installExtras } from './player-extras.js';

const isFiniteDuration = (media) => Number.isFinite(media.duration) && media.duration > 0;
const secondsText = (seconds) => formatDuration(Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0)));

export function attachControls(player, media, video) {
  if (player.classList.contains('player-custom')) return; // 한 플레이어에 한 번만 붙음 (두 번 붙으면 리스너 중복)
  player.setAttribute('role', 'group');
  player.setAttribute('tabindex', '0');
  player.setAttribute('aria-label', video.title);
  player.classList.add('player-custom');
  media.removeAttribute('controls');

  const big = el('button', 'player-big');
  big.type = 'button';
  const loading = el('div', 'player-loading', '불러오는 중');
  loading.hidden = true;
  loading.setAttribute('role', 'status');
  const controls = el('div', 'player-controls');
  const progressRow = el('div', 'player-progress-row');
  const progress = el('div', 'player-progress');
  progress.tabIndex = 0;
  progress.setAttribute('role', 'slider');
  progress.setAttribute('aria-label', '재생 위치');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '0');
  progress.setAttribute('aria-valuenow', '0');
  const buffered = el('span', 'player-buffered');
  const fill = el('span', 'player-progress-fill');
  const thumb = el('span', 'player-progress-thumb');
  const tooltip = el('span', 'player-tooltip');
  // 시간 툴팁 위 프레임 미리보기. youtube.com 베낌
  // 소리 없는 video 복사본은 hover 처음 할 때 만듦 (showHover)
  const preview = el('div', 'player-preview');
  preview.hidden = true;
  progress.append(buffered, fill, thumb, preview, tooltip);
  const row = el('div', 'player-button-row');
  const left = el('div', 'player-control-group player-left');
  const right = el('div', 'player-control-group player-right');
  const play = el('button', 'player-button');
  play.type = 'button';
  const time = el('span', 'player-time', '0:00 / 0:00');
  time.setAttribute('aria-live', 'off');

  const volumeGroup = el('div', 'player-volume-group');
  const mute = el('button', 'player-button');
  mute.type = 'button';
  const volume = el('div', 'player-volume');
  volume.tabIndex = 0;
  volume.setAttribute('role', 'slider');
  volume.setAttribute('aria-label', '볼륨');
  volume.setAttribute('aria-valuemin', '0');
  volume.setAttribute('aria-valuemax', '100');
  volume.setAttribute('aria-valuenow', '100');
  volumeGroup.append(mute, volume);

  const fullscreen = el('button', 'player-button');
  fullscreen.type = 'button';
  left.append(play, volumeGroup, time);
  right.append(fullscreen);
  row.append(left, right);
  progressRow.append(progress);
  controls.append(progressRow, row);
  player.append(big, loading, controls);

  const prefs = playerPrefs();
  media.volume = prefs.volume;
  media.muted = prefs.muted;
  // src 늦게 넣으면 rate 리셋됨 ;; defaultPlaybackRate도 같이 넣음
  media.defaultPlaybackRate = media.playbackRate = prefs.rate;
  let dragging = false;
  let volumeDragging = false;
  let pointerType = '';
  let usedKeyboard = false;
  let hideTimer = 0;
  let controlsHeld = false;

  function duration() { return isFiniteDuration(media) ? media.duration : 0; }
  function current() { return dragging ? Number(progress.dataset.preview || 0) : (Number.isFinite(media.currentTime) ? media.currentTime : 0); }
  function updateTime() {
    const d = duration();
    const now = Math.min(current(), d || current());
    const text = `${secondsText(now)} / ${secondsText(d)}`;
    time.textContent = text;
    progress.setAttribute('aria-valuemax', String(Math.floor(d)));
    progress.setAttribute('aria-valuenow', String(Math.floor(now)));
    progress.setAttribute('aria-valuetext', text);
    const pct = d > 0 ? Math.max(0, Math.min(100, now / d * 100)) : 0;
    progress.style.setProperty('--progress', `${pct}%`);
    thumb.style.setProperty('--position', `${pct}%`);
  }
  function updateBuffered() {
    const d = duration();
    let end = 0;
    if (d > 0) {
      for (let i = 0; i < media.buffered.length; i += 1) end = Math.max(end, media.buffered.end(i));
    }
    buffered.style.setProperty('--buffered', `${d > 0 ? Math.max(0, Math.min(100, end / d * 100)) : 0}%`);
  }
  function updateVolume() {
    const value = Math.round(media.volume * 100);
    const iconName = media.muted || media.volume === 0 ? 'volume_off' : (media.volume < 0.5 ? 'volume_down' : 'volume_up');
    mute.replaceChildren(icon(iconName));
    mute.setAttribute('aria-label', media.muted || media.volume === 0 ? '음소거 해제' : '음소거');
    volume.setAttribute('aria-valuenow', String(media.muted ? 0 : value));
    volume.setAttribute('aria-valuetext', `${media.muted ? 0 : value}%`);
    volume.style.setProperty('--volume', `${media.muted ? 0 : value}%`);
  }
  function updatePlay() {
    const ended = media.ended;
    const name = ended ? 'replay' : (media.paused ? 'play_arrow' : 'pause');
    const label = ended ? '다시 재생' : (media.paused ? '재생' : '일시정지');
    play.replaceChildren(icon(name));
    play.setAttribute('aria-label', label);
    big.replaceChildren(icon(name));
    big.setAttribute('aria-label', label);
    player.classList.toggle('player-paused', media.paused || ended);
  }
  function clearHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = 0;
  }
  function scheduleHide() {
    clearHideTimer();
    const focused = document.activeElement;
    // 마우스 클릭 포커스는 무시함. 키보드 포커스일 때만 컨트롤 유지
    // (마우스 클릭은 포커스가 남아도 숨겨져야 함)
    const keyboardFocus = player.contains(focused) && focused !== player && focused.matches(':focus-visible');
    if (media.paused || media.ended || settings?.isOpen() || controlsHeld || dragging || keyboardFocus) return;
    hideTimer = setTimeout(() => player.classList.add('player-idle'), 3000);
  }
  function activity() {
    player.classList.remove('player-idle');
    scheduleHide();
  }
  function keepVisible(on) {
    controlsHeld = on;
    if (controlsHeld) { clearHideTimer(); player.classList.remove('player-idle'); }
    else scheduleHide();
  }
  function canHandleKey(event) {
    const target = event.target;
    // 단축키 검문소 (입력창, dialog, 팝업이면 컷)
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    if (target instanceof Element && target.matches('input, textarea, select, [contenteditable], [contenteditable="true"]')) return false;
    if (document.querySelector('dialog[open], .menu:not([hidden])')) return false;
    if (player.querySelector('.player-popup:not([hidden])')) return false;
    return true;
  }
  async function togglePlayback() {
    if (media.ended) media.currentTime = 0;
    if (media.paused) {
      try { await media.play(); } catch { /* 재생 실패하면 그냥 paused로 남음 (media 사용 불가) */ }
    } else media.pause();
    updatePlay();
  }
  function seekTo(value) {
    const d = duration();
    if (!d) return;
    media.currentTime = Math.max(0, Math.min(d, value));
    updateTime();
  }
  function eventValue(event, element, max) {
    const rect = element.getBoundingClientRect();
    // 너비 0이면 나눗셈 터짐 ;>(NaN 나옴)
    if (rect.width <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return ratio * max;
  }
  function updatePreview(event) {
    const d = duration();
    if (!d) return;
    const value = eventValue(event, progress, d);
    progress.dataset.preview = String(value);
    progress.style.setProperty('--progress', `${value / d * 100}%`);
    thumb.style.setProperty('--position', `${value / d * 100}%`);
    showHover(value);
    updateTime();
  }
  let previewVideo = null;
  function showHover(value) {
    const d = duration();
    if (!d) return;
    const position = `${value / d * 100}%`;
    tooltip.textContent = secondsText(value);
    tooltip.style.setProperty('--hover-position', position);
    preview.style.setProperty('--hover-position', position);
    if (!media.currentSrc) return; // 클립 아직 로딩 중 (currentSrc 없음). 곧 옴
    if (!previewVideo) {
      previewVideo = el('video', 'player-preview-video');
      previewVideo.muted = true;
      previewVideo.preload = 'auto';
      previewVideo.setAttribute('playsinline', '');
      previewVideo.src = media.currentSrc;
      preview.append(previewVideo);
    }
    previewVideo.currentTime = value;
    preview.hidden = false;
  }
  function hideHover() {
    tooltip.textContent = '';
    preview.hidden = true;
  }
  function setVolume(value) {
    media.volume = Math.max(0, Math.min(1, value));
    if (media.volume > 0 && media.muted) media.muted = false;
    updateVolume();
  }
  function toggleMute() {
    if (!media.muted && media.volume > 0) { media.muted = true; return; }
    if (media.volume === 0) media.volume = 0.5; // 볼륨 0에서 음소거 풀면 소리 안 남. 그래서 0.5로 올림
    media.muted = false;
  }
  function onDocumentKey(event) {
    if (!canHandleKey(event)) return;
    const key = event.key.toLowerCase();
    const slider = event.target.closest?.('[role="slider"]');
    // Space는 버튼, 슬라이더, 메뉴, 스위치에선 제 기능이 있음 (그쪽이 우선)
    // 그 밖엔 링크 포함 전부 재생/정지. 안 그러면 페이지가 스크롤됨
    if (key === ' ' && event.target.closest?.('button, [role="button"], [role="slider"], [role^="menuitem"], [role="switch"], [role="tab"]')) return;
    if (['k', ' '].includes(key)) { event.preventDefault(); togglePlaybackWithFeedback(); return; }
    if (key === 'j' || key === 'l') { event.preventDefault(); seekTo(media.currentTime + (key === 'j' ? -10 : 10)); ctx.feedback.text(`${key === 'j' ? '-10' : '+10'}초`); return; }
    const inside = player.contains(event.target);
    if (inside && !slider && (key === 'arrowleft' || key === 'arrowright')) { event.preventDefault(); seekTo(media.currentTime + (key === 'arrowleft' ? -5 : 5)); ctx.feedback.text(`${key === 'arrowleft' ? '-5' : '+5'}초`); return; }
    if (inside && !slider && (key === 'arrowup' || key === 'arrowdown')) { event.preventDefault(); setVolume(media.volume + (key === 'arrowup' ? 0.05 : -0.05)); ctx.feedback.text(`볼륨 ${Math.round(media.volume * 100)}%`); return; }
    if (key === 'm') { event.preventDefault(); toggleMuteWithFeedback(); return; }
    if (key === 'f') { event.preventDefault(); void toggleFullscreen(); return; }
    if (/^[0-9]$/.test(key)) { event.preventDefault(); const d = duration(); if (d) seekTo(d * Number(key) / 10); ctx.feedback.text(`${Number(key) * 10}%`); }
  }
  function togglePlaybackWithFeedback() {
    const wasPaused = media.paused || media.ended;
    void togglePlayback();
    ctx.feedback.bezel(wasPaused ? 'play_arrow' : 'pause');
  }
  function toggleMuteWithFeedback() {
    toggleMute();
    const muted = media.muted || media.volume === 0;
    const name = muted ? 'volume_off' : (media.volume < 0.5 ? 'volume_down' : 'volume_up');
    ctx.feedback.bezel(name);
    ctx.feedback.text(muted ? '음소거' : '음소거 해제');
  }
  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;
    try {
      if (document.fullscreenElement === player) await document.exitFullscreen();
      else await player.requestFullscreen();
    } catch { /* 브라우저가 전체 화면을 막을 수도 있음 */ }
  }
  function onError() {
    clearHideTimer();
    player.classList.remove('player-idle');
    controls.hidden = true;
    big.hidden = true;
    loading.hidden = true;
    const message = el('p', 'player-error', '영상을 불러오지 못했습니다.');
    message.setAttribute('role', 'alert');
    player.append(message);
  }
  const ctx = {
    player,
    media,
    video,
    controls,
    left,
    right,
    fullscreenButton: fullscreen,
    activity,
    keepVisible,
    canHandleKey,
    feedback: null,
  };
  // 순서 바꾸면 터짐 ;>(settings, extras가 ctx.feedback 부름)
  ctx.feedback = installFeedback(ctx);
  const settings = installSettings(ctx);
  installExtras(ctx);
  ctx.feedback.tooltip(play, 'k');
  ctx.feedback.tooltip(mute, 'm');
  ctx.feedback.tooltip(fullscreen, 'f');

  function onFullscreenChange() {
    const active = document.fullscreenElement === player;
    fullscreen.replaceChildren(icon(active ? 'fullscreen_exit' : 'fullscreen'));
    fullscreen.setAttribute('aria-label', active ? '전체 화면 종료' : '전체 화면');
    // 크롬 쓰바, 전체 화면 들어가면 창 포커스가 돌아오며 누른 버튼에 :focus-visible을 다시 붙임
    // 그래서 컨트롤이 영원히 떠 있음. 마우스면 포커스 버리고, 키보드는 유지
    const focused = document.activeElement;
    if (!usedKeyboard && player.contains(focused) && focused !== player) focused.blur();
    activity();
  }
  function onPointerDown(event) {
    pointerType = event.pointerType;
    usedKeyboard = false;
  }
  function onPlayerClick(event) {
    if (event.target.closest('.player-controls, .player-big')) return;
    togglePlaybackWithFeedback();
  }

  play.addEventListener('click', togglePlaybackWithFeedback);
  big.addEventListener('click', togglePlaybackWithFeedback);
  fullscreen.addEventListener('click', () => { void toggleFullscreen(); });
  media.addEventListener('click', onPlayerClick);
  player.addEventListener('dblclick', (event) => { if (event.target === media && pointerType !== 'touch') void toggleFullscreen(); });
  mute.addEventListener('click', toggleMuteWithFeedback);
  volume.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    volumeDragging = true;
    volume.setPointerCapture(event.pointerId);
    setVolume(eventValue(event, volume, 1));
  });
  volume.addEventListener('pointermove', (event) => { if (volumeDragging) setVolume(eventValue(event, volume, 1)); });
  const endVolumeDrag = () => { volumeDragging = false; };
  volume.addEventListener('pointerup', endVolumeDrag);
  volume.addEventListener('pointercancel', endVolumeDrag);
  volume.addEventListener('lostpointercapture', endVolumeDrag);
  volume.addEventListener('keydown', (event) => {
    if (!canHandleKey(event)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault(); setVolume(media.volume + (event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -0.05 : 0.05));
    } else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); setVolume(event.key === 'Home' ? 0 : 1); }
  });
  progress.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (!duration()) return;
    dragging = true;
    player.classList.add('player-scrubbing');
    clearHideTimer();
    progress.setPointerCapture(event.pointerId);
    updatePreview(event);
  });
  progress.addEventListener('pointermove', (event) => {
    if (dragging) updatePreview(event);
    else if (duration()) showHover(eventValue(event, progress, duration()));
  });
  // pointerup이면 seek, cancel이나 lost capture면 seek 없이 끝냄
  // (미리보기가 안 얼어붙게)
  function endScrub(commit) {
    if (!dragging) return;
    if (commit) media.currentTime = Number(progress.dataset.preview || 0);
    dragging = false;
    delete progress.dataset.preview;
    player.classList.remove('player-scrubbing');
    if (!progress.matches(':hover')) hideHover();
    updateTime();
    scheduleHide();
  }
  progress.addEventListener('pointerup', () => endScrub(true));
  progress.addEventListener('pointercancel', () => endScrub(false));
  progress.addEventListener('lostpointercapture', () => endScrub(false));
  progress.addEventListener('pointerleave', () => { if (!dragging) hideHover(); });
  progress.addEventListener('keydown', (event) => {
    if (!canHandleKey(event)) return;
    const d = duration();
    if (!d) return;
    const delta = event.key === 'ArrowLeft' ? -5 : event.key === 'ArrowRight' ? 5 : event.key === 'PageDown' ? -10 : event.key === 'PageUp' ? 10 : 0;
    if (delta || event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); seekTo(event.key === 'Home' ? 0 : event.key === 'End' ? d : media.currentTime + delta);
    }
  });
  player.addEventListener('pointermove', activity);
  player.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch' || media.paused || media.ended || dragging || settings.isOpen() || controlsHeld) return;
    const focused = document.activeElement;
    if (player.contains(focused) && focused !== player && focused.matches(':focus-visible')) return;
    clearHideTimer();
    player.classList.add('player-idle');
  });
  player.addEventListener('pointerdown', onPointerDown);
  player.addEventListener('keydown', () => { usedKeyboard = true; activity(); });
  player.addEventListener('focusin', () => { clearHideTimer(); player.classList.remove('player-idle'); });
  // focusout 중엔 새 포커스 대상이 아직 안 정해짐. 그래서 tick 뒤에 확인
  player.addEventListener('focusout', () => setTimeout(() => { if (!player.contains(document.activeElement)) scheduleHide(); }, 0));
  document.addEventListener('keydown', onDocumentKey);
  media.addEventListener('timeupdate', () => { updateTime(); updateBuffered(); });
  media.addEventListener('loadedmetadata', () => { updateTime(); updateBuffered(); });
  media.addEventListener('durationchange', updateTime);
  media.addEventListener('progress', updateBuffered);
  media.addEventListener('play', () => { updatePlay(); scheduleHide(); });
  // youtube.com처럼 가운데 큰 버튼은 첫 재생 전에만 있음
  media.addEventListener('play', () => player.classList.add('player-started'), { once: true });
  // canplay 1초 뒤 자동재생. 자동재생 스위치가 꺼졌거나 이미 재생/정지 누른 경우엔 안 함
  // 소리 자동재생은 아무도 안 누른 페이지에서 브라우저가 막음 ㅠㅠ -> 큰 재생 버튼에서 멈춤
  media.addEventListener('canplay', () => {
    setTimeout(() => {
      if (playerPrefs().autoplay && !player.classList.contains('player-started') && media.paused) media.play().catch(() => { });
    }, 1000);
  }, { once: true });
  media.addEventListener('pause', () => { clearHideTimer(); player.classList.remove('player-idle'); updatePlay(); });
  media.addEventListener('ended', () => { clearHideTimer(); player.classList.remove('player-idle'); updatePlay(); });
  media.addEventListener('waiting', () => { loading.hidden = false; clearHideTimer(); player.classList.remove('player-idle'); });
  // 클립 다운로드 중(src 아직 없음)에 재생 누름. 'waiting'은 안 뜨니까 여기서 로딩 띄움
  media.addEventListener('play', () => { if (!media.currentSrc) loading.hidden = false; });
  media.addEventListener('canplay', () => { loading.hidden = true; });
  media.addEventListener('playing', () => { loading.hidden = true; scheduleHide(); });
  media.addEventListener('volumechange', () => { updateVolume(); setPlayerPrefs({ volume: media.volume, muted: media.muted }); });
  media.addEventListener('ratechange', () => setPlayerPrefs({ rate: media.playbackRate }));
  // 에러 처리는 이 줄 하나로 끝. 그냥 박고 봐, 안되면 나중에 고쳐 제길
  media.addEventListener('error', onError);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  fullscreen.replaceChildren(icon('fullscreen'));
  fullscreen.setAttribute('aria-label', '전체 화면');
  fullscreen.hidden = !document.fullscreenEnabled;
  updateTime(); updateBuffered(); updateVolume(); updatePlay();

}
