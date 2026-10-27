// Shared header and sidebar, rendered into the page's empty <header class="header"> and <nav class="guide">.
import { icon } from './icons.js';
import { el } from './render.js';

// [key, label, href, icon]; null draws a divider. guide-mini shows only the items before the first divider.
const NAV = [
  ['home', '홈', 'home.html', 'home'],
  ['shorts', 'Shorts', 'shorts.html', 'smart_display'],
  ['subscriptions', '구독', 'home.html?feed=subscriptions', 'subscriptions'],
  ['profile', '나', 'from-team/profile.html', 'account_circle'],
  null,
  ['history', '시청 기록', 'home.html?feed=history', 'history'],
  ['later', '나중에 볼 동영상', 'home.html?feed=later', 'schedule'],
  null,
  ['music', '음악', 'home.html?category=' + encodeURIComponent('음악'), 'music_note'],
  ['games', '게임', 'home.html?category=' + encodeURIComponent('게임'), 'sports_esports'],
];

function iconButton(tag, label, iconName) {
  const node = el(tag, 'icon-button');
  if (tag === 'button') node.type = 'button';
  node.setAttribute('aria-label', label);
  node.append(icon(iconName));
  return node;
}

function header(nav, query) {
  const menu = iconButton('button', '메뉴', 'menu');
  // Collapses the wide sidebar to the mini one (only visible from 1313px; narrower widths set the mode in CSS,
  // so there is no aria-expanded: the button cannot know what CSS shows).
  menu.addEventListener('click', () => nav.classList.toggle('guide-mini'));

  const logo = el('a', 'logo');
  logo.href = 'home.html';
  logo.setAttribute('aria-label', 'MeTube 홈');
  logo.append(el('i', '', 'Me'), 'Tube');

  const left = el('div', 'header-left');
  left.append(menu, logo);

  const search = el('form', 'search');
  search.setAttribute('role', 'search');
  search.action = 'home.html';
  search.method = 'get';
  const input = el('input', 'search-input');
  Object.assign(input, { type: 'search', name: 'q', placeholder: '검색', value: query });
  input.setAttribute('aria-label', '검색어');
  const go = iconButton('button', '검색', 'search');
  go.className = 'search-button';
  go.type = 'submit';
  search.append(input, go);

  const right = el('div', 'header-right');
  const profile = iconButton('a', '내 채널', 'account_circle');
  profile.href = 'from-team/profile.html';
  right.append(iconButton('button', '만들기', 'add'), iconButton('button', '알림', 'notifications'), profile);

  return [left, search, right];
}

function sidebar(active) {
  return NAV.map((item) => {
    if (!item) return el('hr');
    const [key, label, href, iconName] = item;
    const link = el('a', key === active ? 'guide-item guide-item-active' : 'guide-item');
    link.href = href;
    if (key === active) link.setAttribute('aria-current', 'page');
    link.append(icon(iconName), el('span', '', label));
    return link;
  });
}

// active: a NAV key ('home', 'subscriptions', ...) or null.
export function renderLayout(active) {
  const nav = document.querySelector('.guide');
  const query = new URLSearchParams(location.search).get('q') ?? '';
  document.querySelector('.header').replaceChildren(...header(nav, query));
  nav.replaceChildren(...sidebar(active));
}
