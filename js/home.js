import { renderLayout } from './layout.js';
import { loadData, categories, matchesQuery } from './data.js';
import { videoCard, el } from './render.js';
import { subscriptions, history as watchHistory, watchLater } from './store.js';

const params = new URLSearchParams(location.search);
const q = params.get('q') ?? '';
const feed = ['subscriptions', 'history', 'later'].includes(params.get('feed')) ? params.get('feed') : '';
renderLayout(feed || 'home');

const title = document.querySelector('.page-title');
const chips = document.querySelector('.chips');
const grid = document.querySelector('.video-grid');
const message = document.querySelector('.page-message');
let category = params.get('category') ?? '';
let data;

function render() {
  const all = data.videos.filter((video) => video.type === 'video');
  const byDate = (videos) => videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  let list = feed === 'subscriptions'
    ? byDate(all.filter((video) => subscriptions().includes(video.channelId)))
    : feed === 'history'
      ? watchHistory().map((id) => data.video(id)).filter((video) => video?.type === 'video')
      : feed === 'later'
        ? watchLater().map((id) => data.video(id)).filter((video) => video?.type === 'video')
        : byDate([...all]);
  list = list.filter((video) => matchesQuery(video, data.channel(video.channelId), q));
  if (category) list = list.filter((video) => video.category === category);
  grid.replaceChildren(...list.map((video) => videoCard(video, data.channel(video.channelId))));
  message.textContent = list.length ? '' : q ? `'${q}'에 대한 검색 결과가 없습니다.`
    : feed === 'subscriptions' ? '구독한 채널의 동영상이 없습니다. 동영상 페이지에서 구독해 보세요.'
      : feed === 'history' ? '시청 기록이 없습니다.'
        : feed === 'later' ? '나중에 볼 동영상이 없습니다.' : '이 카테고리에는 동영상이 없습니다.';
  message.hidden = list.length > 0;
}

try {
  data = await loadData();
  const labels = ['전체', ...categories(data.videos.filter((video) => video.type === 'video'))];
  if (category === '전체' || !labels.includes(category)) category = '';
  const heading = q ? `'${q}' 검색 결과` : ({ subscriptions: '구독', history: '시청 기록', later: '나중에 볼 동영상' }[feed] ?? '홈');
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
