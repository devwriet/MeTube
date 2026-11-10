import { el, watchUrl, shortsUrl } from './render.js';
import { icon } from './icons.js';
import { isSaved, toggleSaved, isHiddenVideo, setHiddenVideo, isHiddenChannel, setHiddenChannel } from './store.js';

// ⋮ 메뉴, 토스트는 페이지에 1개만
// 카드마다 만들면 숨은 메뉴가 카드 수만큼 생김
let menu;
let toastNode;
let toastTimer;
let toastDeadline = 0;
let toastRemaining = 0;
let toastPaused = false;
let toastUndoButton;
let activeButton;

// 숙제처럼 막판에 만듦 (처음 쓸 때)
function ensureMenu() {
  // 이미 있음, 또 만들면 주금 ㅋ
  if (menu) return menu;
  menu = el('div', 'menu');
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  menu.addEventListener('keydown', onMenuKeydown);
  document.body.append(menu);
  return menu;
}

function ensureToast() {
  if (toastNode) return toastNode;
  toastNode = el('div', 'toast');
  toastNode.setAttribute('role', 'status');
  toastNode.hidden = true;
  toastNode.addEventListener('pointerenter', pauseToast);
  toastNode.addEventListener('pointerleave', resumeToast);
  toastNode.addEventListener('focusin', pauseToast);
  // 눈치 없는 브라우저가 밖으로 나간 걸로 침
  // (포커스 이동 끝난 뒤에 확인하려고 한 틱 미룸)
  toastNode.addEventListener('focusout', (event) => {
    if (!toastNode.contains(event.relatedTarget)) queueMicrotask(resumeToast);
  });
  document.body.append(toastNode);
  return toastNode;
}

function closeMenu(returnFocus = false) {
  // 안 열려 있으면 퇴근
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  if (activeButton) activeButton.setAttribute('aria-expanded', 'false');
  const button = activeButton;
  activeButton = null;
  if (returnFocus) button?.focus();
}

// hover나 focus 하면 멈춤 (느린 독자, 키보드 유저도 실행취소 누르게)
// 남은 시간 저장했다가 거기서 이어 감
function pauseToast() {
  if (!toastNode || toastNode.hidden || toastPaused) return;
  toastPaused = true;
  toastRemaining = Math.max(0, toastDeadline - Date.now());
  clearTimeout(toastTimer);
}

function resumeToast() {
  if (!toastNode || toastNode.hidden || !toastPaused) return;
  if (toastNode.matches(':hover') || toastNode.contains(document.activeElement)) return;
  toastPaused = false;
  startToastTimer(toastRemaining);
}

function startToastTimer(duration) {
  clearTimeout(toastTimer);
  toastRemaining = duration;
  toastDeadline = Date.now() + duration;
  toastTimer = setTimeout(() => { toastNode.hidden = true; }, duration);
}

export function toast(message, actionLabel, action, afterAction) {
  const node = ensureToast();
  clearTimeout(toastTimer);
  toastPaused = false;
  toastUndoButton = null;
  node.replaceChildren(el('span', '', message));
  if (actionLabel && action) {
    const button = el('button', 'toast-action', actionLabel);
    button.type = 'button';
    // 지금은 라벨 글자로 매칭함. 실행취소 글자 바꾸면 아래 focus fallback 깨짐
    // 둘 다 같이 바꿔라 쓰바 (호출부 문자열 + 여기 비교)
    if (actionLabel === '실행취소') toastUndoButton = button;
    button.addEventListener('click', () => {
      action();
      node.hidden = true;
      clearTimeout(toastTimer);
      // 실행취소하면 metube:change로 그리드 다시 그림
      // 카드는 다음 프레임에나 생김 (rAF로 기다림)
      if (afterAction) requestAnimationFrame(() => {
        const target = afterAction();
        if (target?.isConnected && target.getClientRects().length > 0) target.focus();
        else focusFallback();
      });
    }, { once: true });
    node.append(button);
  }
  node.hidden = false;
  // 8초: 읽기엔 충분하고 후회하긴 짧음
  startToastTimer(8000);
  // 뜰 때 이미 hover나 포커스면 바로 멈춤
  if (node.matches(':hover') || node.contains(document.activeElement)) pauseToast();
}

// 숨은 카드는 투명카드 취급 (getClientRects()가 display:none이면 빔)
function firstVisible(selector) {
  return [...document.querySelectorAll(selector)]
    .find((element) => element.isConnected && element.getClientRects().length > 0);
}

// body에 포커스 두면 안 됨 ;>(키보드 유저 위치 잃음)
// 1번 카드 제목 > 페이지 메시지/제목 순
function focusFallback() {
  const title = firstVisible('.card-title a, .related-title a');
  if (title) {
    title.focus();
    return;
  }
  const destination = firstVisible('.page-message:not([hidden])') || firstVisible('.page-title');
  if (!destination) return;
  // 제목은 링크 아님. tabindex=-1이라 스크립트로만 포커스됨
  if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
  destination.focus();
}

// 포커스 순서: ⋮ 버튼 > 실행취소 > focusFallback
// 동작이 카드를 다시 그렸을 수 있어서 microtask + 프레임 한 번 기다림
function restoreActionFocus(button) {
  queueMicrotask(() => requestAnimationFrame(() => {
    if (button?.isConnected) {
      button.focus();
      return;
    }
    if (toastUndoButton?.isConnected && !toastNode.hidden) {
      toastUndoButton.focus();
      return;
    }
    focusFallback();
  }));
}

function restoredVideoFocus(id) {
  return () => firstVisible(`[data-video="${CSS.escape(id)}"] .card-menu`);
}

function restoredChannelFocus(id) {
  return () => firstVisible(`[data-channel="${CSS.escape(id)}"] .card-menu`);
}

function item(menuNode, label, iconName, action) {
  const button = el('button', 'menu-item');
  button.type = 'button';
  button.setAttribute('role', 'menuitem');
  button.append(icon(iconName), el('span', '', label));
  button.addEventListener('click', () => {
    const trigger = activeButton;
    closeMenu();
    action();
    restoreActionFocus(trigger);
  });
  menuNode.append(button);
}

function fillMenu(video) {
  const node = ensureMenu();
  const saved = isSaved(video.id);
  node.replaceChildren();
  item(node, '현재 재생목록에 추가', 'playlist_play', soon);
  item(node, saved ? '나중에 볼 동영상에서 삭제' : '나중에 볼 동영상에 저장', 'schedule', () => {
    const nowSaved = toggleSaved(video.id);
    toast(nowSaved ? '나중에 볼 동영상에 저장했습니다.' : '나중에 볼 동영상에서 삭제했습니다.');
  });
  item(node, '재생목록에 저장', 'bookmark', soon);
  item(node, '오프라인 저장', 'download', soon);
  item(node, '공유', 'share', () => {
    // navigator.clipboard는 https나 localhost에서만 있음
    // 교실 IP로 http 데모하면 아래 catch로 떨어짐
    // 어떻게 아냐고? 아직 ㅁㄹ. 이대로 안 걸렸으면 좋겠음
    try {
      const link = new URL(video.type === 'short' ? shortsUrl(video.id) : watchUrl(video.id), location.href).href;
      Promise.resolve(navigator.clipboard.writeText(link))
        .then(() => toast('링크를 복사했습니다.'))
        .catch(() => toast('링크를 복사하지 못했습니다.'));
    } catch {
      toast('링크를 복사하지 못했습니다.');
    }
  });
  item(node, '관심 없음', 'block', () => {
    // 실행취소는 이전 값으로 (그냥 false 아님)
    // 원래 숨겨져 있던 거면 그대로 둬야 함
    const previous = isHiddenVideo(video.id);
    setHiddenVideo(video.id, true);
    toast('동영상을 숨겼습니다.', '실행취소', () => setHiddenVideo(video.id, previous), restoredVideoFocus(video.id));
  });
  item(node, '채널 추천 안함', 'do_not_disturb_on', () => {
    const previous = isHiddenChannel(video.channelId);
    setHiddenChannel(video.channelId, true);
    toast('이 채널의 동영상을 추천하지 않습니다.', '실행취소', () => setHiddenChannel(video.channelId, previous), restoredChannelFocus(video.channelId));
  });
  item(node, '신고', 'flag', soon);
  return node;
}

// style.* 직접 쓰는 유일한 곳 (규칙 예외, 쩔 수 없음)
function positionMenu(button, node) {
  // 폰은 CSS 바텀시트라 inline 값 비움
  if (matchMedia('(max-width: 650px)').matches) {
    node.style.left = '';
    node.style.top = '';
    node.style.maxHeight = '';
    return;
  }
  node.style.maxHeight = `${window.innerHeight - 16}px`;
  const buttonRect = button.getBoundingClientRect();
  const menuRect = node.getBoundingClientRect();
  const left = Math.max(8, buttonRect.right - menuRect.width);
  let top = buttonRect.bottom + 4;
  if (top + menuRect.height > window.innerHeight) top = buttonRect.top - menuRect.height - 4;
  node.style.left = `${left}px`;
  node.style.top = `${Math.max(8, top)}px`;
}

function openMenu(button, video) {
  const node = fillMenu(video);
  if (activeButton && activeButton !== button) activeButton.setAttribute('aria-expanded', 'false');
  activeButton = button;
  button.setAttribute('aria-expanded', 'true');
  node.hidden = false;
  positionMenu(button, node);
  node.querySelector('[role="menuitem"]')?.focus();
}

function onMenuKeydown(event) {
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const index = items.indexOf(document.activeElement);
  let next = -1;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu(true);
  } else if (event.key === 'Tab') {
    event.preventDefault();
    // 메뉴가 body 맨 끝이라 Tab으로 못 넘어감, 그래서 닫고 ⋮로 복귀
    const button = activeButton;
    closeMenu();
    button?.focus();
  } else if (event.key === 'ArrowDown') {
    next = (index + 1) % items.length;
  } else if (event.key === 'ArrowUp') {
    next = (index - 1 + items.length) % items.length;
  } else if (event.key === 'Home') {
    next = 0;
  } else if (event.key === 'End') {
    next = items.length - 1;
  }
  if (next >= 0) {
    event.preventDefault();
    items[next]?.focus();
  }
}

document.addEventListener('pointerdown', (event) => {
  if (!menu || menu.hidden) return;
  if (menu.contains(event.target) || activeButton?.contains(event.target)) return;
  closeMenu();
});

window.addEventListener('resize', () => closeMenu());

export function cardMenu(video) {
  const button = el('button', 'card-menu');
  button.type = 'button';
  // 스크린리더는 aria-label로 전체 제목 읽음
  button.setAttribute('aria-label', `작업 메뉴: ${video.title}`);
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.append(icon('more_vert'));
  button.addEventListener('click', () => {
    if (activeButton === button && menu && !menu.hidden) closeMenu();
    else {
      if (activeButton !== button) closeMenu();
      openMenu(button, video);
    }
  });
  // 버튼 찍어냈음, 카드 퇴근  ㄱㄱ
  return button;
}

// 미구현 메뉴는 다 이걸로 때움 (준비 중 토스트)
export function soon() {
  toast('준비 중인 기능입니다.');
}
