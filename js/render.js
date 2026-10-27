// DOM builders. Data only ever goes in through textContent and attributes, never as markup.
import { icon } from './icons.js';
import { formatViews, timeAgo, formatDuration, koCount } from './format.js';
import { cardMenu } from './card-menu.js';
import { isSubscribed, toggleSubscription } from './store.js';

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

// Placeholder colour: hue 0-359 picks one of 6 token gradients in base.css ([data-tone]).
export function setTone(node, hue) {
  node.dataset.tone = String(Math.floor((((hue % 360) + 360) % 360) / 60));
  return node;
}

export function thumb(className, video) {
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
  channelLink.append(avatar(channel.avatarLetter, 'md', 'card-avatar'));

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
  document.addEventListener('metube:change', (event) => {
    if (event.detail?.key === 'subscriptions' && button.isConnected) paint();
  });
  return button;
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
