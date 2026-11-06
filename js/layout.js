// Shared header and sidebar, rendered into the page's empty <header class="header"> and <nav class="guide">.
import { icon } from './icons.js';
import { el, channelAvatar } from './render.js';
import { loadData } from './data.js';
import { subscriptions } from './store.js';
import { soon } from './card-menu.js';
import { startNavProgress } from './nav-progress.js';

function iconButton(tag, label, iconName) {
  const node = el(tag, 'icon-button');
  if (tag === 'button') node.type = 'button';
  node.setAttribute('aria-label', label);
  node.append(icon(iconName));
  return node;
}

function header(nav, query) {
  const menu = iconButton('button', '메뉴', 'menu');
  nav.id = 'guide';
  menu.setAttribute('aria-controls', 'guide');
  const drawerQuery = matchMedia('(max-width: 1312px)');
  const drawerMode = () => nav.classList.contains('guide-drawer') || drawerQuery.matches;
  if (drawerMode()) menu.setAttribute('aria-expanded', 'false');
  let scrim = null;
  let page = null;
  let search = null;
  let right = null;

  const close = (restoreFocus = true) => {
    if (!nav.classList.contains('guide-open')) return;
    nav.classList.remove('guide-open');
    scrim?.remove();
    scrim = null;
    if (page) page.inert = false;
    if (search) search.inert = false;
    if (right) right.inert = false;
    if (drawerMode()) menu.setAttribute('aria-expanded', 'false');
    else menu.removeAttribute('aria-expanded');
    if (restoreFocus) menu.focus();
  };
  const open = () => {
    page = document.querySelector('.page');
    search = document.querySelector('.header .search');
    right = document.querySelector('.header-right');
    if (page) page.inert = true;
    if (search) search.inert = true;
    if (right) right.inert = true;
    nav.classList.add('guide-open');
    menu.setAttribute('aria-expanded', 'true');
    scrim = el('div', 'guide-scrim');
    scrim.addEventListener('click', () => close());
    document.body.append(scrim);
    nav.querySelector('a')?.focus();
  };
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  nav.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    const link = event.target.closest('a[href]');
    if (link && nav.contains(link)) close(false);
  });
  drawerQuery.addEventListener('change', () => {
    close();
    if (drawerMode()) menu.setAttribute('aria-expanded', 'false');
    else menu.removeAttribute('aria-expanded');
  });

  // Drawer mode uses an overlay through tablet widths; desktop keeps mini-sidebar toggling.
  menu.addEventListener('click', () => {
    if (drawerMode()) {
      if (nav.classList.contains('guide-open')) close();
      else open();
    } else {
      menu.removeAttribute('aria-expanded');
      nav.classList.toggle('guide-mini');
    }
  });

  const logo = el('a', 'logo');
  logo.href = 'home.html';
  logo.setAttribute('aria-label', 'MeTube 홈');
  logo.append(el('i', '', 'Me'), 'Tube');

  const left = el('div', 'header-left');
  left.append(menu, logo);

  search = el('form', 'search');
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

  right = el('div', 'header-right');
  const profile = iconButton('a', '내 채널', 'account_circle');
  profile.href = 'profile.html';
  const create = iconButton('button', '만들기', 'add');
  const notifications = iconButton('button', '알림', 'notifications');
  // upload + notifs: the 2 btns most likely to get clicked
  // in the demo. naturally neither works
  create.addEventListener('click', soon);
  notifications.addEventListener('click', soon);
  right.append(create, notifications, profile);

  return [left, search, right];
}

// One sidebar link. lead is an icon name or a node; no href = a placeholder that goes nowhere (pages we do not build).
function item(label, lead, href, active, className = '') {
  const link = el('a', ['guide-item', active && 'guide-item-active', className].filter(Boolean).join(' '));
  link.href = href ?? '#';
  if (!href) link.addEventListener('click', (event) => { event.preventDefault(); soon(); });
  if (active) link.setAttribute('aria-current', 'page');
  link.append(typeof lead === 'string' ? icon(lead) : lead, el('span', '', label));
  return link;
}

// Section title; with an href it is a link followed by a chevron.
function heading(label, href) {
  if (!href) return el('h2', 'guide-heading', label);
  const link = el('a', 'guide-heading', label);
  link.href = href;
  link.append(icon('chevron_right'));
  return link;
}

// footer links to pages that dont exist. look important,
// go nowhere, like a meeting that couldve been an email.
// every click gets the 준비 중 toast instead of a 404
const placeholders = (labels) => labels.map((label) => {
  const link = el('a', 'guide-link', label);
  link.href = '#';
  link.addEventListener('click', (event) => { event.preventDefault(); soon(); });
  return link;
});

// Clicking the button swaps it for the extra items.
function showMore(extras) {
  const button = el('button', 'guide-item');
  button.type = 'button';
  button.append(icon('expand_more'), el('span', '', '더보기'));
  button.addEventListener('click', () => button.replaceWith(...extras));
  return button;
}

const category = (name) => 'home.html?category=' + encodeURIComponent(name);

// Home and Shorts, then the mini-only 구독 and 나 entries, then guide-more (wide sidebar only).
function sidebar(active, subs) {
  const more = el('div', 'guide-more');
  more.append(
    el('hr'), subs,
    heading('나', 'profile.html'),
    item('내 채널', 'account_box', 'profile.html', active === 'profile'),
    item('시청 기록', 'history', 'home.html?feed=history', active === 'history'),
    item('재생목록', 'playlist_play'),
    item('나중에 볼 동영상', 'schedule', 'home.html?feed=later', active === 'later'),
    item('좋아요 표시한 동영상', 'thumb_up', 'home.html?feed=liked', active === 'liked'),
    item('내 동영상', 'video_library'),
    item('다운로드', 'download'),
    el('hr'), heading('탐색'),
    item('음악', 'music_note', category('음악')),
    item('영화', 'movie'),
    item('라이브', 'sensors'),
    showMore([item('게임', 'sports_esports', category('게임')), item('예능', 'smart_display', category('예능'))]),
    el('hr'), heading('MeTube 더 보기'),
    item('MeTube Premium', 'smart_display'),
    item('MeTube Music', 'play_circle'),
    item('MeTube Kids', 'child_care'),
    el('hr'), item('신고 기록', 'flag'),
    el('hr'),
  );
  const links = el('div', 'guide-links');
  links.append(...placeholders(['소개', '보도자료', '저작권', '문의하기', '크리에이터', '광고', '개발자', '약관', '개인정보처리방침', '정책 및 안전', 'MeTube 작동의 원리', '새로운 기능 테스트']));
  more.append(links, el('p', 'guide-copy', '© 2026 MeTube, deepfake 팀. 학교 프로젝트이며 YouTube와 관계가 없습니다.'));
  return [
    item('홈', 'home', 'home.html', active === 'home'),
    item('Shorts', 'smart_display', 'shorts.html', active === 'shorts'),
    item('구독', 'subscriptions', 'home.html?feed=subscriptions', active === 'subscriptions', 'guide-mini-only'),
    item('나', 'account_circle', 'profile.html', active === 'profile', 'guide-mini-only'),
    more,
  ];
}

// active: 'home', 'shorts', 'profile', 'history', 'later', 'liked', 'subscriptions' or null.
export function renderLayout(active) {
  startNavProgress();
  let skipLink = document.querySelector('.skip-link');
  if (!skipLink) {
    skipLink = el('a', 'skip-link', '본문으로 건너뛰기');
    skipLink.setAttribute('href', '#content');
    document.body.prepend(skipLink);
  }
  const page = document.querySelector('main > .page');
  if (page) {
    page.setAttribute('id', 'content');
    page.tabIndex = -1;
  }
  const nav = document.querySelector('.guide');
  const query = new URLSearchParams(location.search).get('q') ?? '';
  const subs = el('div'); // filled once the channel names are loaded
  document.querySelector('.header').replaceChildren(...header(nav, query));
  nav.replaceChildren(...sidebar(active, subs));
  let data = null;
  const renderSubscriptions = () => {
    if (!data) return;
    const channels = subscriptions().map((id) => data.channel(id)).filter(Boolean);
    subs.replaceChildren();
    if (!channels.length) return;
    subs.append(
      heading('구독', 'home.html?feed=subscriptions'),
      ...channels.map((channel) => item(channel.name, channelAvatar(channel, 'xs'), `profile.html?c=${channel.id}`, false)),
      el('hr'),
    );
  };
  document.addEventListener('metube:change', (event) => {
    if (event.detail?.key === 'subscriptions') renderSubscriptions();
  });
  loadData().then((loaded) => {
    data = loaded;
    renderSubscriptions();
  }).catch(() => {}); // the sidebar works without the channel list
}
