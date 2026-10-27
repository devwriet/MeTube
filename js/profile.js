// Channel page: profile.html?c=<channelId>. Default is the guest's own channel (ch-woopi).
import { renderLayout } from './layout.js';
import { loadData } from './data.js';
import { el, avatar, setTone, thumb, watchUrl, videoStats, subscribeButton } from './render.js';
import { cardMenu, soon } from './card-menu.js';
import { formatSubscribers, formatViews, formatDuration, koCount } from './format.js';
import { icon } from './icons.js';

const OWN_CHANNEL = 'ch-woopi';
const id = new URLSearchParams(location.search).get('c') ?? OWN_CHANNEL;
renderLayout(id === OWN_CHANNEL ? 'profile' : null);
const page = document.querySelector('.page');
const message = document.querySelector('.page-message');

const SORTS = [
  ['latest', '최신순', (a, b) => b.publishedAt.localeCompare(a.publishedAt)],
  ['popular', '인기순', (a, b) => b.views - a.views],
  ['oldest', '오래된순', (a, b) => a.publishedAt.localeCompare(b.publishedAt)],
];
const byDate = SORTS[0][2];
const byViews = SORTS[1][2];

function profileCard(video) {
  const isShort = video.type === 'short';
  const card = el('div', isShort ? 'card short-tile' : 'card');
  card.dataset.video = video.id;
  card.dataset.channel = video.channelId;
  const link = el('a', 'card-link');
  link.href = watchUrl(video.id);
  link.tabIndex = -1;
  link.setAttribute('aria-hidden', 'true');
  link.append(isShort ? setTone(el('div', 'card-thumb'), video.hue) : thumb('card-thumb', video));

  const titleLink = el('a', '', video.title);
  titleLink.href = watchUrl(video.id);
  titleLink.append(el('span', 'sr-only', ` · ${formatDuration(video.durationSeconds)}`));
  const title = el('div', 'card-title');
  title.append(titleLink);
  const text = el('div');
  text.append(title, el('div', 'card-stats', isShort ? formatViews(video.views) : videoStats(video)));
  const body = el('div', 'card-body');
  body.append(text, cardMenu(video));
  card.append(link, body);
  return card;
}

// One playlist per category of the channel's videos (Home lists only videos); it opens Home filtered to that category.
function playlistCard(category, videos) {
  const card = el('a', 'card playlist-card');
  card.href = `home.html?category=${encodeURIComponent(category)}`;
  const cover = setTone(el('div', 'card-thumb'), videos[0].hue);
  cover.append(el('span', 'card-duration', `동영상 ${videos.length}개`));
  const text = el('div');
  text.append(el('div', 'card-title', `${category} 모음`), el('div', 'card-channel', '재생목록'), el('div', 'card-stats', '전체 재생목록 보기'));
  const body = el('div', 'card-body');
  body.append(text);
  card.append(cover, body);
  return card;
}

const row = (className, nodes) => {
  const node = el('div', className);
  node.append(...nodes);
  return node;
};
const empty = (text) => el('p', 'page-message', text);

// Sort chips plus a grid that is rebuilt on every click.
function sortedPanel(panel, videos, build, gridClass, emptyText) {
  if (!videos.length) { panel.append(empty(emptyText)); return; }
  const chips = el('div', 'chips');
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', '정렬');
  const grid = el('div', gridClass);
  const paint = (key) => {
    const compare = SORTS.find(([k]) => k === key)[2];
    grid.replaceChildren(...[...videos].sort(compare).map(build));
    chips.querySelectorAll('.chip').forEach((chip) => {
      const on = chip.dataset.sort === key;
      chip.className = on ? 'chip chip-active' : 'chip';
      chip.setAttribute('aria-pressed', String(on));
    });
  };
  for (const [key, label] of SORTS) {
    const chip = el('button', 'chip', label);
    chip.type = 'button';
    chip.dataset.sort = key;
    chip.addEventListener('click', () => paint(key));
    chips.append(chip);
  }
  panel.append(chips, grid);
  paint('latest');
}

function showMessage(text, notFound) {
  page.prepend(el('h1', 'page-title', notFound ? '채널을 찾을 수 없음' : '오류'));
  message.hidden = false;
  message.textContent = text;
  if (notFound) {
    const home = el('a', '', '홈으로 돌아가기');
    home.href = 'home.html';
    message.append(home);
    document.title = '채널을 찾을 수 없음 - MeTube';
  }
}

try {
  const data = await loadData();
  const channel = data.channel(id);
  if (!channel) {
    showMessage('채널을 찾을 수 없습니다. ', true);
  } else {
    document.title = `${channel.name} - MeTube`;
    const own = data.videos.filter((video) => video.channelId === channel.id);
    const videos = own.filter((video) => video.type === 'video');
    const shorts = own.filter((video) => video.type === 'short');

    const wrap = el('div', 'profile-wrap');
    const banner = setTone(el('div', 'banner'), data.channels.indexOf(channel) * 60);

    const info = el('div', 'profile-info');
    const meta = el('div', 'profile-meta');
    meta.append(el('span', 'profile-handle', channel.handle), el('span', 'profile-stats', `${formatSubscribers(channel.subscribers)} · 동영상 ${own.length}개`));
    const community = el('button', 'button button-secondary', 'Community');
    community.type = 'button';
    community.addEventListener('click', soon);
    info.append(el('h1', 'profile-name', channel.name), meta, el('p', 'profile-bio', channel.bio), row('profile-actions', [subscribeButton(channel.id), community]));
    const profileHeader = el('section', 'profile-header');
    profileHeader.append(avatar(channel.avatarLetter, 'lg', 'profile-avatar'), info);
    wrap.append(banner, profileHeader);

    const panels = [
      ['home', '홈', (panel) => {
        const sections = [
          ['추천', 'shelf shelf-wide', [...videos].sort(byDate).slice(0, 6).map(profileCard)],
          ['Shorts', 'shelf', [...shorts].sort(byDate).slice(0, 6).map(profileCard)],
          ['인기 영상', 'shelf', [...videos].sort(byViews).slice(0, 6).map(profileCard)],
        ];
        for (const [title, className, cards] of sections) {
          if (cards.length) panel.append(el('h2', 'section-heading', title), row(className, cards));
        }
        if (!panel.children.length) panel.append(empty('아직 올린 동영상이 없습니다.'));
      }],
      ['videos', '동영상', (panel) => sortedPanel(panel, videos, profileCard, 'video-grid', '올린 동영상이 없습니다.')],
      ['shorts', 'Shorts', (panel) => sortedPanel(panel, shorts, profileCard, 'video-grid short-grid', '올린 Shorts가 없습니다.')],
      ['playlists', '재생목록', (panel) => {
        const byCategory = new Map();
        for (const video of videos) byCategory.set(video.category, [...(byCategory.get(video.category) ?? []), video]);
        if (!byCategory.size) { panel.append(empty('만든 재생목록이 없습니다.')); return; }
        panel.append(row('video-grid playlist-grid', [...byCategory].map(([category, list]) => playlistCard(category, list))));
      }],
      ['about', '정보', (panel) => {
        const about = el('div', 'about');
        const totalViews = own.reduce((sum, video) => sum + video.views, 0);
        about.append(
          el('h2', 'section-heading', '설명'), el('p', 'profile-bio', channel.bio),
          el('h2', 'section-heading', '채널 정보'),
          el('p', 'card-stats', formatSubscribers(channel.subscribers)),
          el('p', 'card-stats', `동영상 ${own.length}개`),
          el('p', 'card-stats', `조회수 총 ${koCount(totalViews)}회`),
        );
        panel.append(about);
      }],
    ];

    const tablist = el('div', 'tablist');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', '채널 탭');
    const search = el('button', 'icon-button');
    search.type = 'button';
    search.setAttribute('aria-label', '채널 검색');
    search.addEventListener('click', soon);
    search.append(icon('search'));
    const tabs = el('div', 'profile-wrap tabs');
    tabs.append(tablist, search);
    const bar = el('div', 'tabs-bar');
    bar.append(tabs);

    const content = el('div', 'profile-wrap');
    panels.forEach(([key, label, fill], i) => {
      const tab = el('button', i === 0 ? 'tab tab-active' : 'tab', label);
      Object.assign(tab, { id: `tab-${key}`, type: 'button', tabIndex: i === 0 ? 0 : -1 });
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(i === 0));
      tab.setAttribute('aria-controls', `panel-${key}`);
      tablist.append(tab);
      const panel = el('section', 'tab-panel');
      Object.assign(panel, { id: `panel-${key}`, hidden: i !== 0 });
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      fill(panel);
      if (!panel.querySelector('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) panel.tabIndex = 0;
      content.append(panel);
    });

    page.append(wrap, bar, content);
    await import('./profile-tabs.js'); // wires the tabs now that they exist
  }
} catch {
  page.querySelectorAll('.profile-wrap, .tabs-bar').forEach((node) => node.remove());
  showMessage('채널을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
}
