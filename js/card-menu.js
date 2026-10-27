import { el, watchUrl, shortsUrl } from './render.js';
import { icon } from './icons.js';
import { isSaved, toggleSaved, isHiddenVideo, setHiddenVideo, isHiddenChannel, setHiddenChannel } from './store.js';

let menu;
let toastNode;
let toastTimer;
let toastDeadline = 0;
let toastRemaining = 0;
let toastPaused = false;
let toastUndoButton;
let activeButton;

function ensureMenu() {
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
  toastNode.addEventListener('focusout', (event) => {
    if (!toastNode.contains(event.relatedTarget)) queueMicrotask(resumeToast);
  });
  document.body.append(toastNode);
  return toastNode;
}

function closeMenu(returnFocus = false) {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  if (activeButton) activeButton.setAttribute('aria-expanded', 'false');
  const button = activeButton;
  activeButton = null;
  if (returnFocus) button?.focus();
}

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
    if (actionLabel === '실행취소') toastUndoButton = button;
    button.addEventListener('click', () => {
      action();
      node.hidden = true;
      clearTimeout(toastTimer);
      if (afterAction) requestAnimationFrame(() => {
        const target = afterAction();
        if (target?.isConnected && target.getClientRects().length > 0) target.focus();
        else focusFallback();
      });
    }, { once: true });
    node.append(button);
  }
  node.hidden = false;
  startToastTimer(8000);
  if (node.matches(':hover') || node.contains(document.activeElement)) pauseToast();
}

function firstVisible(selector) {
  return [...document.querySelectorAll(selector)]
    .find((element) => element.isConnected && element.getClientRects().length > 0);
}

function focusFallback() {
  const title = firstVisible('.card-title a, .related-title a');
  if (title) {
    title.focus();
    return;
  }
  const destination = firstVisible('.page-message:not([hidden])') || firstVisible('.page-title');
  if (!destination) return;
  if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
  destination.focus();
}

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

function positionMenu(button, node) {
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
  return button;
}

export function soon() {
  toast('준비 중인 기능입니다.');
}
