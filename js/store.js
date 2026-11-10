// 게스트 상태는 localStorage "metube:*" 아래 저장. 매번 새로 읽음 (다른 탭이랑 싱크 맞추려고)
// storage가 throw하면 (시크릿 모드, 차단, 꽉 참) 값은 이 페이지 보는 동안만 메모리에 있음
const PREFIX = 'metube:';
// 비상용 창고 (storage 죽었을 때만 씀)
const memory = {};
// 쓸 만큼만 기억, 민망할 정도로는 X
const HISTORY_MAX = 50;

// 유일한 사용자 (이름은 '나'). 로그아웃 기능 없음(쓰바 만들기 귀찮음)
export const GUEST_NAME = '나';

const PLAYER_DEFAULTS = { volume: 1, muted: false, rate: 1, autoplay: true };

// 필드 하나씩 기본값으로 (전부 날리진 않음)
const cleanPlayerPrefs = (v) => ({
  volume: typeof v.volume === 'number' && v.volume >= 0 && v.volume <= 1 ? v.volume : PLAYER_DEFAULTS.volume,
  muted: typeof v.muted === 'boolean' ? v.muted : PLAYER_DEFAULTS.muted,
  autoplay: typeof v.autoplay === 'boolean' ? v.autoplay : PLAYER_DEFAULTS.autoplay,
  // ㅙ 한 줄에 다 넣었냐... (0.05 단위가 아니면 기본값, 1e-6 오차 봐줌)
  rate: typeof v.rate === 'number' && 0.25 <= v.rate && v.rate <= 2 && Math.abs(v.rate * 20 - Math.round(v.rate * 20)) < 1e-6 ? Math.round(v.rate * 20) / 20 : PLAYER_DEFAULTS.rate,
});
export const playerPrefs = () => cleanPlayerPrefs(read('player', PLAYER_DEFAULTS));
export function setPlayerPrefs(patch) {
  write('player', cleanPlayerPrefs({ ...playerPrefs(), ...patch }));
}

function read(key, fallback) {
  if (key in memory) return memory[key];
  let value = fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) value = JSON.parse(raw);
  } catch { /* 차단된 storage나 깨진 JSON이면 fallback */ }
  // 모양 틀리면 (타입, 배열 여부) fallback
  if (value === null || typeof value !== 'object' || Array.isArray(value) !== Array.isArray(fallback)) value = fallback;
  return value;
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    // storage 다시 됨 -> 낡은 메모리 값 버림 (read()는 memory를 먼저 봄)
    delete memory[key];
  } catch {
    memory[key] = value;
  }
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('metube:change', { detail: { key } }));
  }
}

// id 배열을 set처럼 씀, 새 on 상태 반환
function toggleIn(key, id) {
  const list = read(key, []);
  const on = !list.includes(id);
  write(key, on ? [...list, id] : list.filter((x) => x !== id));
  return on;
}
// read()가 memory 안 배열을 그대로 줄 때가 있어서 복사본 줌
const listOf = (key) => [...read(key, [])];

export const subscriptions = () => listOf('subscriptions');
export const isSubscribed = (channelId) => read('subscriptions', []).includes(channelId);
export const toggleSubscription = (channelId) => toggleIn('subscriptions', channelId);

// 나중에 볼 거 = 안 볼 거 리스트
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

// 영상별 반응: 'like' | 'dislike' | null. 같은 거 다시 누르면 취소됨
export const reaction = (videoId) => read('reactions', {})[videoId] ?? null;
export const liked = () => Object.entries(read('reactions', {})).filter(([, kind]) => kind === 'like').map(([id]) => id);
export function toggleReaction(videoId, kind) {
  const all = { ...read('reactions', {}) };
  const next = all[videoId] === kind ? null : kind;
  if (next) all[videoId] = next; else delete all[videoId];
  write('reactions', all);
  return next;
}

export const history = () => listOf('history');
export function addHistory(videoId) {
  write('history', [videoId, ...read('history', []).filter((x) => x !== videoId)].slice(0, HISTORY_MAX));
}

// 영상별 게스트 댓글: [{ id, author, text, time }], 최신순, GUEST_COMMENTS_MAX개까지 보관
// 영상당 100개. 데모용이라 이 정도면 ㄱㅊ
const GUEST_COMMENTS_MAX = 100;
// 깨진 저장 항목은 버림
export function comments(videoId) {
  const list = read('comments', {})[videoId];
  return Array.isArray(list)
    ? list.filter((c) => c && ['id', 'author', 'text', 'time'].every((k) => typeof c[k] === 'string') && !Number.isNaN(Date.parse(c.time)))
    : [];
}
export function addComment(videoId, text) {
  // 같은 ms에 두 번 찍는 상황이 있겠냐..?
  // 그래도 충돌 막으려고 랜덤 붙임
  const comment = { id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, author: GUEST_NAME, text, time: new Date().toISOString() };
  const all = { ...read('comments', {}) };
  all[videoId] = [comment, ...comments(videoId)].slice(0, GUEST_COMMENTS_MAX);
  write('comments', all);
  return comment;
}

// 댓글 id는 영상 전체에서 유일 (시드는 "c-N", 게스트는 "u-<time>-<random>")
export const isCommentLiked = (commentId) => read('comment-likes', []).includes(commentId);
export const toggleCommentLike = (commentId) => toggleIn('comment-likes', commentId);
