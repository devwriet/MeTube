// DOM builders. Data only ever goes in through textContent and attributes, never as markup.
import { icon } from './icons.js';
import { formatViews, timeAgo, formatDuration, koCount } from './format.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export const watchUrl = (id) => `watch.html?v=${encodeURIComponent(id)}`;
export const videoStats = (video) => `${formatViews(video.views)} · ${timeAgo(video.publishedAt)}`;

// Placeholder colour: hue 0-359 picks one of 6 token gradients in base.css ([data-tone]).
export function setTone(node, hue) {
  node.dataset.tone = String(Math.floor((((hue % 360) + 360) % 360) / 60));
  return node;
}

function thumb(className, video) {
  const box = setTone(el('div', className), video.hue);
  box.append(el('span', 'card-duration', formatDuration(video.durationSeconds)));
  return box;
}

// Letter avatar; decorative because the name is always shown next to it.
export function avatar(letter, size, extraClass) {
  const node = el('span', `avatar avatar-${size}${extraClass ? ' ' + extraClass : ''}`, letter);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

export function videoCard(video, channel) {
  const card = el('a', 'card');
  card.href = watchUrl(video.id);
  const text = el('div');
  text.append(el('h2', 'card-title', video.title), el('p', 'card-channel', channel.name), el('p', 'card-stats', videoStats(video)));
  const body = el('div', 'card-body');
  body.append(avatar(channel.avatarLetter, 'md', 'card-avatar'), text);
  card.append(thumb('card-thumb', video), body);
  return card;
}

export function relatedCard(video, channel) {
  const card = el('a', 'related-card');
  card.href = watchUrl(video.id);
  const text = el('div');
  text.append(el('h3', 'related-title', video.title), el('p', 'related-channel', channel.name), el('p', 'related-stats', videoStats(video)));
  card.append(thumb('related-thumb', video), text);
  return card;
}

// comment: { author, text, time, likes? }. onLike() toggles in the store and returns the new state.
export function commentItem(comment, liked, onLike) {
  const item = el('li', 'comment');
  const body = el('div', 'comment-body');
  const head = el('p');
  head.append(el('span', 'comment-author', comment.author), el('span', 'comment-time', timeAgo(comment.time)));

  const like = el('button', 'comment-like');
  like.type = 'button';
  const count = el('span');
  const paint = (on) => {
    const n = (comment.likes ?? 0) + (on ? 1 : 0);
    like.setAttribute('aria-pressed', String(on));
    count.textContent = koCount(n);
    like.setAttribute('aria-label', `좋아요 ${count.textContent}개`);
  };
  like.append(icon('thumb_up'), count);
  like.addEventListener('click', () => paint(onLike()));
  paint(liked);

  body.append(head, el('p', 'comment-text', comment.text), like);
  item.append(avatar([...comment.author][0] ?? '?', 'md', 'comment-avatar'), body);
  return item;
}
