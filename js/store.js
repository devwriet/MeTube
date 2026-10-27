// Guest state in localStorage under "metube:*". Read fresh on every call so other tabs stay in sync.
// If storage throws (private mode, blocked, full), values live in memory for this page view only.
const PREFIX = 'metube:';
const memory = {};
const HISTORY_MAX = 50;

export const GUEST_NAME = '나';

function read(key, fallback) {
  if (key in memory) return memory[key];
  let value = fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) value = JSON.parse(raw);
  } catch { /* blocked storage or bad JSON: use fallback */ }
  // Edited or corrupt value of the wrong shape: start over.
  if (value === null || typeof value !== 'object' || Array.isArray(value) !== Array.isArray(fallback)) value = fallback;
  return value;
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    delete memory[key];
  } catch {
    memory[key] = value; // storage unusable: keep it for this page view
  }
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('metube:change', { detail: { key } }));
  }
}

// Arrays of ids used as sets. Returns the new "on" state.
function toggleIn(key, id) {
  const list = read(key, []);
  const on = !list.includes(id);
  write(key, on ? [...list, id] : list.filter((x) => x !== id));
  return on;
}
const listOf = (key) => [...read(key, [])];

export const subscriptions = () => listOf('subscriptions');
export const isSubscribed = (channelId) => read('subscriptions', []).includes(channelId);
export const toggleSubscription = (channelId) => toggleIn('subscriptions', channelId);

export const watchLater = () => listOf('watch-later');
export const isSaved = (videoId) => read('watch-later', []).includes(videoId);
export const toggleSaved = (videoId) => toggleIn('watch-later', videoId);

export const hiddenVideos = () => listOf('hidden-videos');
export const isHiddenVideo = (videoId) => read('hidden-videos', []).includes(videoId);
export function setHiddenVideo(videoId, on) {
  const list = read('hidden-videos', []);
  write('hidden-videos', on
    ? (list.includes(videoId) ? list : [...list, videoId])
    : list.filter((id) => id !== videoId));
}
export const hiddenChannels = () => listOf('hidden-channels');
export const isHiddenChannel = (channelId) => read('hidden-channels', []).includes(channelId);
export function setHiddenChannel(channelId, on) {
  const list = read('hidden-channels', []);
  write('hidden-channels', on
    ? (list.includes(channelId) ? list : [...list, channelId])
    : list.filter((id) => id !== channelId));
}

// Reaction per video: 'like' | 'dislike' | null. Clicking the current one clears it.
export const reaction = (videoId) => read('reactions', {})[videoId] ?? null;
export const liked = () => Object.entries(read('reactions', {})).filter(([, kind]) => kind === 'like').map(([id]) => id);
export function toggleReaction(videoId, kind) {
  const all = { ...read('reactions', {}) };
  const next = all[videoId] === kind ? null : kind;
  if (next) all[videoId] = next; else delete all[videoId];
  write('reactions', all);
  return next;
}

// Most recent first, no duplicates.
export const history = () => listOf('history');
export function addHistory(videoId) {
  write('history', [videoId, ...read('history', []).filter((x) => x !== videoId)].slice(0, HISTORY_MAX));
}

// Guest comments per video: [{ id, author, text, time }], newest first, at most GUEST_COMMENTS_MAX kept.
const GUEST_COMMENTS_MAX = 100;
// Malformed stored entries are dropped.
export function comments(videoId) {
  const list = read('comments', {})[videoId];
  return Array.isArray(list)
    ? list.filter((c) => c && ['id', 'author', 'text', 'time'].every((k) => typeof c[k] === 'string') && !Number.isNaN(Date.parse(c.time)))
    : [];
}
export function addComment(videoId, text) {
  const comment = { id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, author: GUEST_NAME, text, time: new Date().toISOString() };
  const all = { ...read('comments', {}) };
  all[videoId] = [comment, ...comments(videoId)].slice(0, GUEST_COMMENTS_MAX);
  write('comments', all);
  return comment;
}

// Comment ids are unique across all videos (seed "c-N", guest "u-<time>-<random>").
export const isCommentLiked = (commentId) => read('comment-likes', []).includes(commentId);
export const toggleCommentLike = (commentId) => toggleIn('comment-likes', commentId);
