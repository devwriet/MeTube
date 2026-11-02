import { el } from './render.js';
import { icon } from './icons.js';
import { soon } from './card-menu.js';

const PRESETS = [1, 1.25, 1.5, 1.75, 2];
const MIN_RATE = 0.25;
const MAX_RATE = 2;
const roundRate = (rate) => Math.round(rate * 100) / 100;
const rateText = (rate) => `${roundRate(rate).toFixed(2)}x`;

export function installSettings(ctx) {
  const wrap = el('div', 'player-settings-wrap');
  const button = el('button', 'player-button');
  button.type = 'button';
  button.setAttribute('aria-label', '설정');
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.append(icon('settings'));
  wrap.append(button);
  ctx.right.insertBefore(wrap, ctx.fullscreenButton);

  const menu = el('div', 'player-menu player-popup');
  menu.hidden = true;
  menu.setAttribute('role', 'menu');
  ctx.player.append(menu);
  ctx.feedback.tooltip(button);

  const mainPanel = el('div', 'player-settings-panel');
  const speedRow = el('button', 'player-settings-row');
  speedRow.type = 'button';
  speedRow.setAttribute('role', 'menuitem');
  const speedLabel = el('span', 'player-settings-label', '재생 속도');
  const speedValue = el('span', 'player-settings-value');
  const speedArrow = icon('chevron_right');
  speedArrow.classList.add('player-settings-chevron');
  speedRow.append(speedLabel, speedValue, speedArrow);

  const qualityRow = el('button', 'player-settings-row');
  qualityRow.type = 'button';
  qualityRow.setAttribute('role', 'menuitem');
  qualityRow.append(
    el('span', 'player-settings-label', '화질'),
    el('span', 'player-settings-value', '자동 (720p)'),
    icon('chevron_right'),
  );
  mainPanel.append(speedRow, qualityRow);

  const speedPanel = el('div', 'player-settings-panel player-settings-speed');
  const backButton = el('button', 'player-settings-back');
  backButton.type = 'button';
  backButton.setAttribute('role', 'menuitem');
  backButton.setAttribute('aria-label', '이전 메뉴로 돌아가기');
  backButton.append(icon('chevron_left'), el('span', '', '재생 속도'));
  const currentRate = el('div', 'player-settings-current');
  currentRate.setAttribute('aria-live', 'off');
  const stepRow = el('div', 'player-settings-steps');
  const slower = el('button', 'player-settings-step');
  slower.type = 'button';
  slower.setAttribute('role', 'menuitem');
  slower.setAttribute('aria-label', '0.05배 느리게');
  slower.append(icon('remove'));
  const faster = el('button', 'player-settings-step');
  faster.type = 'button';
  faster.setAttribute('role', 'menuitem');
  faster.setAttribute('aria-label', '0.05배 빠르게');
  faster.append(icon('add'));
  stepRow.append(slower, faster);
  const presets = el('div', 'player-settings-presets');
  const presetButtons = PRESETS.map((rate) => {
    const chip = el('button', 'player-settings-preset');
    chip.type = 'button';
    chip.setAttribute('role', 'menuitemradio');
    chip.dataset.rate = String(rate);
    chip.append(el('span', '', rate === 1 || rate === 2 ? rate.toFixed(1) : String(rate)));
    if (rate === 1) chip.append(el('span', 'player-settings-normal', '보통'));
    presets.append(chip);
    return chip;
  });
  speedPanel.append(backButton, currentRate, stepRow, presets);

  let submenuOpen = false;
  let changingPanel = false;
  let playerPointerDown = false;

  function syncRate() {
    const rate = roundRate(Number.isFinite(ctx.media.playbackRate) ? ctx.media.playbackRate : 1);
    speedValue.textContent = rate === 1 ? '보통' : `${rate}x`;
    currentRate.textContent = rateText(rate);
    slower.disabled = rate <= MIN_RATE;
    faster.disabled = rate >= MAX_RATE;
    for (const chip of presetButtons) {
      const selected = Number(chip.dataset.rate) === rate;
      chip.setAttribute('aria-checked', String(selected));
    }
  }

  function activePanel() {
    return submenuOpen ? speedPanel : mainPanel;
  }

  function focusables() {
    return [...activePanel().querySelectorAll('button:not(:disabled)')];
  }

  function focusFirst() {
    focusables()[0]?.focus();
  }

  function openSpeed() {
    submenuOpen = true;
    changingPanel = true;
    menu.replaceChildren(speedPanel);
    syncRate();
    backButton.focus();
    changingPanel = false;
  }

  function returnToMain() {
    submenuOpen = false;
    changingPanel = true;
    menu.replaceChildren(mainPanel);
    syncRate();
    speedRow.focus();
    changingPanel = false;
  }

  function close(returnFocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    submenuOpen = false;
    menu.replaceChildren(mainPanel);
    button.setAttribute('aria-expanded', 'false');
    ctx.keepVisible(false);
    if (returnFocus) button.focus();
  }

  function open(byKeyboard) {
    ctx.player.dispatchEvent(new CustomEvent('player-popup-open', { detail: menu }));
    submenuOpen = false;
    menu.replaceChildren(mainPanel);
    syncRate();
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    ctx.keepVisible(true);
    ctx.activity();
    if (byKeyboard) focusFirst();
  }

  button.addEventListener('click', (event) => {
    if (menu.hidden) open(event.detail === 0);
    else close();
  });
  // A mouse-opened menu keeps focus on the gear or wherever the viewer clicked next (clicks inside the
  // player keep it open), so Escape is caught page-wide; keys inside the menu use the handler below.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menu.hidden || menu.contains(event.target)) return;
    event.preventDefault();
    close(true);
  });
  speedRow.addEventListener('click', openSpeed);
  backButton.addEventListener('click', returnToMain);
  qualityRow.addEventListener('click', () => soon());
  slower.addEventListener('click', () => {
    ctx.media.playbackRate = Math.max(MIN_RATE, roundRate(roundRate(ctx.media.playbackRate) - 0.05));
    syncRate();
  });
  faster.addEventListener('click', () => {
    ctx.media.playbackRate = Math.min(MAX_RATE, roundRate(roundRate(ctx.media.playbackRate) + 0.05));
    syncRate();
  });
  for (const chip of presetButtons) {
    chip.addEventListener('click', () => {
      ctx.media.playbackRate = Number(chip.dataset.rate);
      syncRate();
    });
  }

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (submenuOpen) returnToMain();
      else close(true);
      return;
    }
    if (submenuOpen && event.key === 'ArrowLeft') {
      event.preventDefault();
      returnToMain();
      return;
    }
    if (!submenuOpen && event.key === 'ArrowRight' && event.target.closest('button') === speedRow) {
      event.preventDefault();
      openSpeed();
      return;
    }
    const items = focusables();
    const index = items.indexOf(document.activeElement);
    if (!items.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      items[(index + step + items.length) % items.length].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1].focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!ctx.player.contains(event.target)) close();
  });
  ctx.player.addEventListener('pointerdown', () => {
    playerPointerDown = true;
    setTimeout(() => { playerPointerDown = false; }, 0);
  }, true);
  menu.addEventListener('focusout', (event) => {
    if (changingPanel) return;
    if (playerPointerDown) return;
    if (!menu.contains(event.relatedTarget) && event.relatedTarget !== button) close();
  });
  ctx.player.addEventListener('focusout', (event) => {
    if (changingPanel) return;
    if (playerPointerDown) return;
    if (!menu.hidden && (menu.contains(event.target) || event.target === button)
      && !menu.contains(event.relatedTarget) && event.relatedTarget !== button) close();
  });
  ctx.player.addEventListener('player-popup-open', (event) => {
    if (event.detail !== menu) close();
  });
  ctx.media.addEventListener('ratechange', syncRate);
  syncRate();

  return { isOpen: () => !menu.hidden, close: () => close() };
}
