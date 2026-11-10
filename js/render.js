// innerHTML 쓰면 XSS 열림. 데이터는 textContent랑 attribute로만 (markup 넣지 마셈)
import { icon } from './icons.js';
import { formatViews, timeAgo, formatDuration, koCount } from './format.js';
import { cardMenu } from './card-menu.js';
import { isSubscribed, toggleSubscription, isCommentLiked, toggleCommentLike } from './store.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export const watchUrl = (id) => `watch.html?v=${encodeURIComponent(id)}`;
export const shortsUrl = (id) => `shorts.html?v=${encodeURIComponent(id)}`;
export const channelUrl = (id) => `profile.html?c=${encodeURIComponent(id)}`;
export const videoStats = (video) => `${formatViews(video.views)} · ${timeAgo(video.publishedAt)}`;

// 임시 색 (hue 0-359 → base.css data-tone 0-5 중 하나)
export function setTone(node, hue) {
  node.dataset.tone = String(Math.floor((((hue % 360) + 360) % 360) / 60));
  return node;
}

export function addThumbImage(box, video) {
  if (typeof video.thumb !== 'string' || !video.thumb) return box;
  const image = el('img', 'thumb-img');
  image.alt = '';
  image.loading = 'lazy';
  image.src = video.thumb;
  box.append(image);
  return box;
}

export function thumb(className, video) {
  const box = addThumbImage(setTone(el('div', className), video.hue), video);
  box.append(el('span', 'card-duration', formatDuration(video.durationSeconds)));
  return box;
}

// 사진은 글자 위에 얹는 장식 (이름은 옆에 항상 뜸)
// 파일 없거나 깨지면 글자만 남음 (error에서 img 제거)
export function avatar(letter, size, extraClass, src) {
  const node = el('span', `avatar avatar-${size}${extraClass ? ' ' + extraClass : ''}`, letter);
  node.setAttribute('aria-hidden', 'true');
  if (src) {
    const image = el('img', 'avatar-img');
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => image.remove());
    image.src = src;
    node.append(image);
  }
  return node;
}

export const channelAvatar = (channel, size, extraClass) => avatar(channel.avatarLetter, size, extraClass, channel.avatar);

export function videoCard(video, channel) {
  const card = el('div', 'card');
  card.dataset.video = video.id;
  card.dataset.channel = channel.id;
  const link = el('a', 'card-link');
  link.href = watchUrl(video.id);
  link.tabIndex = -1;
  link.setAttribute('aria-hidden', 'true');
  link.append(thumb('card-thumb', video));

  const channelLink = el('a');
  channelLink.href = channelUrl(channel.id);
  channelLink.tabIndex = -1;
  channelLink.setAttribute('aria-hidden', 'true');
  channelLink.append(channelAvatar(channel, 'md', 'card-avatar'));

  const titleLink = el('a', '', video.title);
  titleLink.href = watchUrl(video.id);
  titleLink.append(el('span', 'sr-only', ` · ${formatDuration(video.durationSeconds)}`));
  const nameLink = el('a', '', channel.name);
  nameLink.href = channelUrl(channel.id);
  const text = el('div');
  const title = el('h2', 'card-title');
  title.append(titleLink);
  const name = el('p', 'card-channel');
  name.append(nameLink);
  text.append(title, name, el('p', 'card-stats', videoStats(video)));
  const body = el('div', 'card-body');
  body.append(channelLink, text, cardMenu(video));
  card.append(link, body);
  return card;
}

export function shortCard(video) {
  const card = el('div', 'card short-tile');
  card.dataset.video = video.id;
  card.dataset.channel = video.channelId;
  const link = el('a', 'card-link');
  link.href = shortsUrl(video.id);
  link.tabIndex = -1;
  link.setAttribute('aria-hidden', 'true');
  link.append(thumb('card-thumb', video));

  const titleLink = el('a', '', video.title);
  titleLink.href = shortsUrl(video.id);
  titleLink.append(el('span', 'sr-only', ` · ${formatDuration(video.durationSeconds)}`));
  const title = el('h3', 'card-title');
  title.append(titleLink);
  const text = el('div');
  text.append(title, el('p', 'card-stats', formatViews(video.views)));
  const body = el('div', 'card-body');
  body.append(text, cardMenu(video));
  card.append(link, body);
  return card;
}

export function relatedCard(video, channel) {
  const card = el('div', 'related-card');
  card.dataset.video = video.id;
  card.dataset.channel = channel.id;
  const link = el('a', 'card-link');
  link.href = watchUrl(video.id);
  link.tabIndex = -1;
  link.setAttribute('aria-hidden', 'true');
  link.append(thumb('related-thumb', video));

  const titleLink = el('a', '', video.title);
  titleLink.href = watchUrl(video.id);
  titleLink.append(el('span', 'sr-only', ` · ${formatDuration(video.durationSeconds)}`));
  const nameLink = el('a', '', channel.name);
  nameLink.href = channelUrl(channel.id);
  const text = el('div');
  const title = el('h3', 'related-title');
  title.append(titleLink);
  const name = el('p', 'related-channel');
  name.append(nameLink);
  text.append(title, name, el('p', 'related-stats', videoStats(video)));
  card.append(link, text, cardMenu(video));
  return card;
}

export function subscribeButton(channelId) {
  const button = el('button');
  button.type = 'button';
  const paint = () => {
    const on = isSubscribed(channelId);
    button.className = `button ${on ? 'button-subscribed' : 'button-subscribe'}`;
    button.textContent = on ? '구독중' : '구독';
    button.setAttribute('aria-pressed', String(on));
  };
  paint();
  button.addEventListener('click', () => toggleSubscription(channelId));
  // 좀비 리스너. 버튼은 떠나도 document 리스너는 남음 (그래서 isConnected 확인)
  document.addEventListener('metube:change', (event) => {
    if (event.detail?.key === 'subscriptions' && button.isConnected) paint();
  });
  return button;
}

// 답글은 첫 클릭 때 만듦 (쓰레드 많고 대부분 안 열림)
function replyBlock(replies) {
  const toggle = el('button', 'comment-replies-toggle', `답글 ${koCount(replies.length)}개`);
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  const list = el('ul', 'comment-replies');
  list.hidden = true;
  toggle.addEventListener('click', () => {
    if (!list.children.length) {
      list.append(...replies.map((reply) => commentItem(reply, isCommentLiked(reply.id), () => toggleCommentLike(reply.id))));
    }
    list.hidden = !list.hidden;
    toggle.setAttribute('aria-expanded', String(!list.hidden));
  });
  return [toggle, list];
}

// 댓글 모양: { author, text, time, likes?, avatar?, replies? }
// onLike()는 store에서 토글하고 새 상태를 돌려줌
export function commentItem(comment, liked, onLike) {
  const item = el('li', 'comment');
  const body = el('div', 'comment-body');
  const head = el('p');
  head.append(el('span', 'comment-author', comment.author), el('span', 'comment-time', timeAgo(comment.time)));

  const like = el('button', 'comment-like');
  like.type = 'button';
  const count = el('span');
  const paint = (on) => {
    // on이면 일출, off면 영출 (1 or 0 출력)
    const n = (comment.likes ?? 0) + (on ? 1 : 0);
    like.setAttribute('aria-pressed', String(on));
    count.textContent = koCount(n);
    like.setAttribute('aria-label', `좋아요 ${count.textContent}개`);
  };
  like.append(icon('thumb_up'), count);
  like.addEventListener('click', () => paint(onLike()));
  paint(liked);

  body.append(head, el('p', 'comment-text', comment.text), like);
  if (comment.replies?.length) body.append(...replyBlock(comment.replies));
  // [0]은 이모지를 반쪽 냄 (spread면 code point 단위로 쪼갬)
  const letter = [...comment.author.replace(/^@/, '')][0] ?? '?';
  item.append(avatar(letter, 'md', 'comment-avatar', comment.avatar), body);
  return item;
}
