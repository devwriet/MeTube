import { icon } from './icons.js';

export function installFeedback(ctx) {
  const { player } = ctx;
  const bezel = document.createElement('div');
  bezel.className = 'player-bezel';
  bezel.hidden = true;
  bezel.setAttribute('aria-hidden', 'true');
  player.append(bezel);

  const badge = document.createElement('div');
  badge.className = 'player-badge';
  badge.hidden = true;
  badge.setAttribute('aria-hidden', 'true');
  player.append(badge);

  const live = document.createElement('div');
  live.className = 'player-feedback-sr';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  player.append(live);

  const tip = document.createElement('div');
  tip.className = 'player-tip';
  tip.hidden = true;
  tip.setAttribute('aria-hidden', 'true');
  const tipLabel = document.createElement('span');
  const tipKey = document.createElement('kbd');
  tipKey.className = 'player-tip-key';
  tip.append(tipLabel, tipKey);
  player.append(tip);

  let bezelAnimation;
  let bezelTimer = 0;
  let badgeTimer = 0;
  let badgeFadeTimer = 0;
  const tooltipBindings = new WeakMap();

  function showBezel(iconName) {
    clearTimeout(bezelTimer);
    bezelAnimation?.cancel();
    bezelAnimation = null;
    bezel.replaceChildren(icon(iconName));
    bezel.hidden = false;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bezelTimer = setTimeout(() => {
        bezelAnimation?.cancel();
        bezelAnimation = null;
        bezel.hidden = true;
      }, 500);
      return;
    }

    bezelAnimation = bezel.animate(
      [
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' },
      ],
      { duration: 1000, easing: 'cubic-bezier(0.05, 0, 0, 1)', fill: 'forwards' },
    );
    bezelAnimation.onfinish = () => {
      bezel.hidden = true;
      bezelAnimation?.cancel();
      bezelAnimation = null;
    };
  }

  function showText(message) {
    clearTimeout(badgeTimer);
    clearTimeout(badgeFadeTimer);
    badge.classList.remove('player-badge-fading');
    badge.textContent = message;
    live.textContent = '';
    badge.hidden = false;
    live.textContent = message;
    badgeTimer = setTimeout(() => {
      badge.classList.add('player-badge-fading');
      badgeFadeTimer = setTimeout(() => {
        badge.hidden = true;
        badge.classList.remove('player-badge-fading');
      }, 250);
    }, 700);
  }

  function hideTip() {
    tip.hidden = true;
  }

  function positionTip(button) {
    const playerRect = player.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const halfWidth = tip.offsetWidth / 2;
    const padding = 8;
    const center = buttonRect.left + buttonRect.width / 2 - playerRect.left;
    const clamped = Math.max(padding + halfWidth, Math.min(player.clientWidth - padding - halfWidth, center));
    tip.style.setProperty('--tip-x', `${clamped}px`);
    tip.style.setProperty('--tip-bottom', `${playerRect.bottom - buttonRect.top + 8}px`);
  }

  function showTip(button, key) {
    if (player.classList.contains('player-idle') || !button.isConnected) return;
    tipLabel.textContent = button.getAttribute('aria-label') || '';
    tipKey.textContent = key ? key.toUpperCase() : '';
    tipKey.hidden = !key;
    tip.hidden = false;
    positionTip(button);
  }

  function tooltip(button, key) {
    const existing = tooltipBindings.get(button);
    if (existing) {
      existing.key = key;
      return;
    }

    const binding = { key };
    tooltipBindings.set(button, binding);
    button.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') showTip(button, binding.key);
    });
    button.addEventListener('pointerleave', hideTip);
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) showTip(button, binding.key);
    });
    button.addEventListener('blur', hideTip);
    button.addEventListener('pointerdown', hideTip);
    button.addEventListener('click', hideTip);
  }

  const idleObserver = new MutationObserver(() => {
    if (player.classList.contains('player-idle')) hideTip();
  });
  idleObserver.observe(player, { attributes: true, attributeFilter: ['class'] });

  return { bezel: showBezel, text: showText, tooltip };
}
