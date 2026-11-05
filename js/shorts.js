import { renderLayout } from './layout.js';
import { loadData } from './data.js';
import { el, avatar, setTone, commentItem, subscribeButton, channelUrl, shortsUrl } from './render.js';
import { koCount } from './format.js';
import { cardMenu, toast } from './card-menu.js';
import {
  reaction, toggleReaction, comments, addComment, isCommentLiked,
  toggleCommentLike, addHistory, hiddenVideos, hiddenChannels, GUEST_NAME,
} from './store.js';
import { icon } from './icons.js';

renderLayout('shorts');

const page = document.querySelector('.shorts-page');
const message = document.querySelector('.page-message');
const requestedId = new URLSearchParams(location.search).get('v');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const commentsWide = matchMedia('(min-width: 1100px)');
let current = null;
let openComments = null;
let entries = [];
let navButtons;
// Browsers only autoplay muted video, so every Short starts muted. One flag for the whole feed:
// unmuting once (a click, which also counts as the user gesture) keeps the next Shorts unmuted.
let soundMuted = true;
const muteRepaints = new Set();

function setMuted(value) {
  soundMuted = value;
  for (const { media } of entries) if (media) media.muted = value;
  muteRepaints.forEach((repaint) => repaint());
}

function action(iconName, label, text) {
  const button = el('button', 'short-action');
  button.type = 'button';
  if (label) button.setAttribute('aria-label', label);
  const count = el('span', 'short-action-label', text);
  button.append(icon(iconName), count);
  return [button, count];
}

function visibleComments(video) {
  const guest = comments(video.id);
  const seeds = [...video.comments].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  return [...guest, ...seeds];
}

function paintCommentCounts(entry, count) {
  entry.commentCount.textContent = koCount(count);
  entry.commentButton.setAttribute('aria-label', `댓글 ${koCount(count)}개`);
  if (entry.dialogCount) entry.dialogCount.textContent = `${koCount(count)}개의 댓글`;
}

function closeComments(returnFocus = true) {
  if (!openComments) return;
  const { dialog, trigger } = openComments;
  openComments = null;
  if (dialog.open) dialog.close();
  dialog.remove();
  if (returnFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
}

commentsWide.addEventListener('change', () => {
  if (openComments) closeComments();
});

function makeComments(entry) {
  const { video, stage, commentButton } = entry;
  const dialog = el('dialog', 'shorts-comments');
  dialog.setAttribute('aria-labelledby', 'shorts-comments-title');
  const head = el('div', 'shorts-comments-head');
  const heading = el('h2', '', '댓글');
  heading.id = 'shorts-comments-title';
  const count = el('span', 'shorts-comments-count');
  const close = el('button', 'icon-button');
  close.type = 'button';
  close.setAttribute('aria-label', '댓글 닫기');
  close.append(icon('close'));
  head.append(heading, count, close);

  const list = el('ul', 'comment-list');
  const all = visibleComments(video);
  all.forEach((comment) => list.append(commentItem(comment, isCommentLiked(comment.id), () => toggleCommentLike(comment.id))));

  const form = el('form', 'comment-form');
  const input = el('input', 'comment-input');
  Object.assign(input, { type: 'text', name: 'comment', maxLength: 500, placeholder: '댓글 추가...', autocomplete: 'off', required: true });
  input.setAttribute('aria-label', '댓글 추가');
  const submit = el('button', 'button button-secondary', '댓글');
  submit.type = 'submit';
  submit.disabled = true;
  form.append(avatar([...GUEST_NAME][0], 'md'), input, submit);
  input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const comment = addComment(video.id, text);
    list.prepend(commentItem(comment, false, () => toggleCommentLike(comment.id)));
    paintCommentCounts(entry, list.children.length);
    input.value = '';
    submit.disabled = true;
    input.focus();
  });
  dialog.append(head, list, form);
  entry.dialogCount = count;
  paintCommentCounts(entry, all.length);
  close.addEventListener('click', () => closeComments());
  dialog.addEventListener('close', () => {
    if (openComments?.dialog !== dialog) return;
    openComments = null;
    dialog.remove();
    if (commentButton.isConnected) commentButton.focus({ preventScroll: true });
  });

  if (openComments) closeComments(false);
  stage.append(dialog);
  openComments = { dialog, trigger: commentButton };
  if (commentsWide.matches) dialog.show();
  else dialog.showModal();
  close.focus();
}

function makeEntry(video, channel) {
  const item = el('section', 'short-item');
  item.dataset.video = video.id;
  item.setAttribute('aria-label', video.title);
  const stage = el('div', 'short-stage');
  const player = setTone(el('div', 'short-player'), video.hue);
  let media = null;
  if (typeof video.src === 'string' && video.src.trim()) {
    media = el('video', 'short-video');
    media.setAttribute('src', video.src);
    media.setAttribute('loop', '');
    media.setAttribute('playsinline', '');
    media.setAttribute('muted', '');
    media.setAttribute('preload', 'metadata');
    media.muted = soundMuted;
    player.append(media);
    const playButton = el('button', 'short-play');
    playButton.type = 'button';
    const paintPlayback = () => {
      const playing = !media.paused;
      playButton.setAttribute('aria-label', playing ? '일시정지' : '재생');
      playButton.replaceChildren(icon(playing ? 'pause' : 'play_arrow'));
    };
    media.addEventListener('play', paintPlayback);
    media.addEventListener('pause', paintPlayback);
    playButton.addEventListener('click', (event) => {
      event.stopPropagation();
      togglePlayback();
    });
    player.append(playButton);
    paintPlayback();

    const muteButton = el('button', 'short-mute');
    muteButton.type = 'button';
    const paintMute = () => {
      muteButton.setAttribute('aria-label', soundMuted ? '소리 켜기' : '음소거');
      muteButton.replaceChildren(icon(soundMuted ? 'volume_off' : 'volume_up'));
    };
    muteRepaints.add(paintMute);
    muteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      setMuted(!soundMuted);
    });
    paintMute();

    // A real range input gives keyboard, touch and mouse seeking for free; CSS just thins it down.
    const progress = el('input', 'short-progress');
    progress.type = 'range';
    progress.min = '0';
    progress.max = '1000';
    progress.value = '0';
    progress.setAttribute('aria-label', '재생 위치');
    const paintProgress = () => {
      const ratio = media.duration > 0 ? media.currentTime / media.duration : 0;
      progress.value = String(Math.round(ratio * 1000));
      progress.style.setProperty('--progress', `${ratio * 100}%`);
    };
    media.addEventListener('timeupdate', paintProgress);
    media.addEventListener('loadedmetadata', paintProgress);
    progress.addEventListener('input', () => {
      if (media.duration > 0) media.currentTime = (Number(progress.value) / 1000) * media.duration;
      paintProgress();
    });
    player.append(muteButton, progress);

    // Missing or unplayable clip: same status as a Short without a clip, and no dead play button.
    media.addEventListener('error', () => {
      muteRepaints.delete(paintMute);
      muteButton.remove();
      progress.remove();
      playButton.remove();
      media.remove();
      media = null;
      entry.media = null;
      player.prepend(el('span', 'short-status', '영상을 불러오지 못했습니다'));
    });
  } else {
    player.append(el('span', 'short-status', '영상 준비 중'));
  }

  const overlay = el('div', 'short-overlay');
  const channelRow = el('div', 'short-channel');
  const channelLink = el('a');
  channelLink.href = channelUrl(channel.id);
  channelLink.append(avatar(channel.avatarLetter, 'sm'), el('span', 'short-channel-name', channel.name));
  channelRow.append(channelLink, subscribeButton(channel.id));
  overlay.append(channelRow, el('h2', 'short-title', video.title));
  player.append(overlay);

  const rail = el('div', 'short-actions');
  rail.setAttribute('aria-label', 'Shorts 작업');
  const [like, likeCount] = action('thumb_up', '', '');
  const [dislike, dislikeCount] = action('thumb_down', '', '싫어요');
  const [comment, commentCount] = action('comment', '', '');
  const [share] = action('share', '', '공유');
  const paintReaction = (value) => {
    const likes = video.likes + (value === 'like' ? 1 : 0);
    const dislikes = video.dislikes + (value === 'dislike' ? 1 : 0);
    likeCount.textContent = koCount(likes);
    dislikeCount.textContent = '싫어요';
    like.setAttribute('aria-label', `좋아요 ${koCount(likes)}개`);
    dislike.setAttribute('aria-label', `싫어요 ${koCount(dislikes)}개`);
    like.setAttribute('aria-pressed', String(value === 'like'));
    dislike.setAttribute('aria-pressed', String(value === 'dislike'));
  };
  paintReaction(reaction(video.id));
  like.addEventListener('click', () => paintReaction(toggleReaction(video.id, 'like')));
  dislike.addEventListener('click', () => paintReaction(toggleReaction(video.id, 'dislike')));
  comment.setAttribute('aria-label', `댓글 ${koCount(visibleComments(video).length)}개`);
  commentCount.textContent = koCount(visibleComments(video).length);
  comment.addEventListener('click', () => makeComments(entry));
  share.addEventListener('click', async () => {
    try {
      const url = new URL(shortsUrl(video.id), location.href).href;
      await navigator.clipboard.writeText(url);
      toast('링크를 복사했습니다.');
    } catch {
      toast('링크를 복사하지 못했습니다.');
    }
  });
  rail.append(like, dislike, comment, share, cardMenu(video));
  const thumbLink = el('a', 'short-channel-thumb');
  thumbLink.href = channelUrl(channel.id);
  thumbLink.setAttribute('aria-label', channel.name);
  thumbLink.append(avatar(channel.avatarLetter, 'md'));
  rail.append(thumbLink);
  stage.append(player, rail);
  player.addEventListener('click', (event) => {
    if (!media || event.target.closest('a, button, dialog, input')) return;
    togglePlayback();
  });
  item.append(stage);
  const entry = { item, stage, video, media, commentButton: comment, commentCount, dialogCount: null };
  function togglePlayback() {
    if (!media) return;
    if (media.paused) media.play().catch(() => {});
    else media.pause();
  }
  // Dialog handlers close over the completed entry object.
  return entry;
}

function updateNavigation(index) {
  navButtons[0].hidden = index <= 0;
  navButtons[1].hidden = index < 0 || index >= entries.length - 1;
}

function setCurrent(entry) {
  if (!entry || current === entry) return;
  if (openComments && openComments.trigger !== entry.commentButton) closeComments(false);
  current = entry;
  history.replaceState(null, '', shortsUrl(entry.video.id));
  document.title = `${entry.video.title} - MeTube`;
  addHistory(entry.video.id);
  entries.forEach(({ media }) => {
    if (!media) return;
    if (media === entry.media) media.play().catch(() => {});
    else media.pause();
  });
  updateNavigation(entries.indexOf(entry));
}

// Returns false at the first and last Short, where there is nothing to scroll to.
function navigate(direction) {
  const target = entries[entries.indexOf(current) + direction];
  if (!target) return false;
  target.item.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  return true;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openComments?.dialog.open && !openComments.dialog.matches(':modal')) {
    closeComments();
    return;
  }
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  if (document.querySelector('.menu:not([hidden])') || document.querySelector('dialog[open]')) return;
  if (event.key.toLowerCase() === 'm' && !event.ctrlKey && !event.metaKey && !event.altKey && current?.media) {
    setMuted(!soundMuted);
    return;
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    navigate(event.key === 'ArrowDown' ? 1 : -1);
  }
});

try {
  const data = await loadData();
  const hiddenVideoIds = new Set(hiddenVideos());
  const hiddenChannelIds = new Set(hiddenChannels());
  const videos = data.videos
    .filter((video) => video.type === 'short' && !hiddenVideoIds.has(video.id) && !hiddenChannelIds.has(video.channelId))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (!videos.length) {
    message.textContent = '표시할 Shorts가 없습니다.';
    message.hidden = false;
  } else {
    const feed = el('div', 'shorts-feed');
    feed.tabIndex = -1;
    entries = videos.map((video) => makeEntry(video, data.channel(video.channelId)));
    feed.append(...entries.map((entry) => entry.item));

    const nav = el('div', 'shorts-nav');
    const previous = el('button', 'shorts-nav-btn');
    previous.type = 'button';
    previous.setAttribute('aria-label', '이전 Shorts');
    previous.append(icon('arrow_upward'));
    const next = el('button', 'shorts-nav-btn');
    next.type = 'button';
    next.setAttribute('aria-label', '다음 Shorts');
    next.append(icon('arrow_downward'));
    navButtons = [previous, next];
    previous.addEventListener('click', () => navigate(-1));
    next.addEventListener('click', () => navigate(1));
    nav.append(previous, next);
    page.append(feed, nav);

    // Mouse wheel: one gesture moves one Short. Native snap scrolling bounces a single notch back to the same Short.
    // Small trackpad deltas add up until they pass 40px. The lock covers the scroll animation and extends while
    // trackpad inertia keeps sending events; it only starts when a Short was actually scrolled to.
    let wheelLockUntil = 0;
    let wheelSum = 0;
    let wheelTimer = 0;
    feed.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.target.closest('dialog, .menu')) return;
      event.preventDefault();
      const now = performance.now();
      if (now < wheelLockUntil) {
        wheelLockUntil = Math.max(wheelLockUntil, now + 150);
        return;
      }
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? feed.clientHeight : 1; // pixels, lines, pages
      const dy = event.deltaY * scale;
      if (Math.abs(event.deltaX * scale) > Math.abs(dy)) return;
      wheelSum += dy;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelSum = 0; }, 200);
      if (Math.abs(wheelSum) < 40) return;
      const moved = navigate(wheelSum > 0 ? 1 : -1);
      wheelSum = 0;
      if (moved) wheelLockUntil = now + 650;
    }, { passive: false });

    const initial = entries.find((entry) => entry.video.id === requestedId) ?? entries[0];
    initial.item.scrollIntoView({ behavior: 'auto', block: 'start' });
    updateNavigation(entries.indexOf(initial));
    const observer = new IntersectionObserver((records) => {
      const best = records
        .filter((record) => record.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (best) setCurrent(entries.find((entry) => entry.item === best.target));
    }, { root: feed, threshold: 0.6 });
    entries.forEach((entry) => observer.observe(entry.item));
    setCurrent(initial);
  }
} catch {
  message.textContent = '동영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  message.hidden = false;
}
