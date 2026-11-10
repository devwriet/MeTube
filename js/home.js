import { renderLayout } from './layout.js';
import { loadData, categories, matchesQuery } from './data.js';
import { shuffle } from './format.js';
import { videoCard, shortCard, el } from './render.js';
import { icon } from './icons.js';
import { soon } from './card-menu.js';
import {
  subscriptions, history as watchHistory, watchLater, liked, hiddenVideos, hiddenChannels,
} from './store.js';

// 주소창 뜯어보기 ;>
const params = new URLSearchParams(location.search);
const q = params.get('q') ?? '';
const feed = ['subscriptions', 'history', 'later', 'liked'].includes(params.get('feed')) ? params.get('feed') : '';
renderLayout(feed || 'home');

const title = document.querySelector('.page-title');
const chips = document.querySelector('.chips');
const grid = document.querySelector('.video-grid');
const message = document.querySelector('.page-message');
// 로컬 서버 안내 숨김 (file://에선 스크립트가 안 돌아서 안내가 남음)
message.hidden = true;
let category = params.get('category') ?? '';
let data;
// 칩마다 섞으면 멀미 날 듯. 로드 때 한 번만 섞음 (render 다시 돌아도 순서 유지)
let shuffled;

function render() {
  const all = (q ? data.videos : shuffled).filter((video) => video.type === 'video');
  const byDate = (videos) => videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  // 삼항 5층 꼬라지... 일단 됨 (feed별 목록 고르는 거)
  let list = feed === 'subscriptions'
    ? byDate(all.filter((video) => subscriptions().includes(video.channelId)))
    : feed === 'history'
      ? watchHistory().map((id) => data.video(id)).filter((video) => video?.type === 'video')
      : feed === 'later'
        ? watchLater().map((id) => data.video(id)).filter((video) => video?.type === 'video')
        : feed === 'liked'
          ? liked().map((id) => data.video(id)).filter((video) => video?.type === 'video')
          : q ? byDate([...all]) : all;
  if (feed === '') {
    const hiddenVideoIds = new Set(hiddenVideos());
    const hiddenChannelIds = new Set(hiddenChannels());
    list = list.filter((video) => !hiddenVideoIds.has(video.id) && !hiddenChannelIds.has(video.channelId));
  }
  list = list.filter((video) => matchesQuery(video, data.channel(video.channelId), q));
  if (category) list = list.filter((video) => video.category === category);
  grid.replaceChildren(...list.map((video) => videoCard(video, data.channel(video.channelId))));
  if (feed === '' && q === '' && category === '') {
    const hiddenVideoIds = new Set(hiddenVideos());
    const hiddenChannelIds = new Set(hiddenChannels());
    const shorts = shuffled
      .filter((video) => video.type === 'short'
        && !hiddenVideoIds.has(video.id)
        && !hiddenChannelIds.has(video.channelId));
    if (shorts.length) {
      const shelf = el('section', 'shorts-shelf');
      shelf.setAttribute('aria-labelledby', 'shorts-shelf-title');
      const heading = el('h2', 'shorts-shelf-title');
      heading.id = 'shorts-shelf-title';
      heading.append(icon('smart_display'), document.createTextNode('Shorts'));
      const header = el('div', 'shorts-shelf-header');
      const menuButton = el('button', 'icon-button');
      menuButton.type = 'button';
      menuButton.setAttribute('aria-label', 'Shorts 메뉴');
      menuButton.append(icon('more_vert'));
      // 준비 중 토스트. 사실 준비 안 하는 중(ㅎ... 귀찮아요)
      menuButton.addEventListener('click', soon);
      header.append(heading, menuButton);
      const row = el('div', 'shorts-row');
      row.append(...shorts.map(shortCard));
      shelf.append(header, row);
      // 카드 6개 뒤에 쇼츠 끼움. 6은 그냥 매직넘버임 (모자라면 맨 끝)
      grid.insertBefore(shelf, grid.children[6] ?? null);
    }
  }
  message.textContent = list.length ? '' : q ? `'${q}'에 대한 검색 결과가 없습니다.`
    : feed === 'subscriptions' ? '구독한 채널의 동영상이 없습니다. 동영상 페이지에서 구독해 보세요.'
      : feed === 'history' ? '시청 기록이 없습니다.'
        : feed === 'later' ? '나중에 볼 동영상이 없습니다.'
          : feed === 'liked' ? '좋아요 표시한 동영상이 없습니다.' : '이 카테고리에는 동영상이 없습니다.';
  message.hidden = list.length > 0;
}

document.addEventListener('metube:change', (event) => {
  const key = event.detail?.key;
  const shouldRender = (feed === '' && ['hidden-videos', 'hidden-channels'].includes(key))
    || (feed === 'later' && key === 'watch-later')
    || (feed === 'liked' && key === 'reactions')
    || (feed === 'subscriptions' && key === 'subscriptions');
  if (shouldRender && data) render();
});

try {
  data = await loadData();
  shuffled = shuffle(data.videos);
  const labels = ['전체', ...categories(data.videos.filter((video) => video.type === 'video'))];
  if (category === '전체' || !labels.includes(category)) category = '';
  const heading = q ? `'${q}' 검색 결과` : ({ subscriptions: '구독', history: '시청 기록', later: '나중에 볼 동영상', liked: '좋아요 표시한 동영상' }[feed] ?? '홈');
  title.textContent = heading;
  document.title = heading === '홈' ? 'MeTube' : `${heading} - MeTube`;
  chips.replaceChildren(...labels.map((label) => {
    const button = el('button', label === (category || '전체') ? 'chip chip-active' : 'chip', label);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(label === (category || '전체')));
    button.addEventListener('click', () => {
      category = label === '전체' ? '' : label;
      const url = new URL(location.href);
      if (category) url.searchParams.set('category', category);
      else url.searchParams.delete('category');
      window.history.replaceState(null, '', url);
      chips.querySelectorAll('.chip').forEach((chip) => {
        const active = chip.textContent === (category || '전체');
        chip.className = active ? 'chip chip-active' : 'chip';
        chip.setAttribute('aria-pressed', String(active));
      });
      render();
    });
    return button;
  }));
  render();
} catch {
  chips.hidden = true;
  grid.replaceChildren();
  message.textContent = '동영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  message.hidden = false;
}
