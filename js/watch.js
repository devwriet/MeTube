import { renderLayout } from './layout.js';
import { loadData, relatedVideos } from './data.js';
import { el, avatar, channelAvatar, setTone, relatedCard, commentItem, subscribeButton } from './render.js';
import { koCount, formatSubscribers, formatDate } from './format.js';
import {
  GUEST_NAME, reaction, toggleReaction,
  isSaved, toggleSaved, comments, addComment, isCommentLiked, toggleCommentLike, addHistory,
  hiddenVideos, hiddenChannels,
} from './store.js';
import { icon } from './icons.js';
import { attachControls } from './player.js';
import { clipUrl } from './clip.js';

renderLayout(null);
const page = document.querySelector('.page');
const message = document.querySelector('.page-message');
const id = new URLSearchParams(location.search).get('v');
function showMessage(text, link = false) {
  page.prepend(el('h1', 'page-title', link ? '동영상을 찾을 수 없음' : '오류'));
  message.hidden = false;
  message.textContent = text;
  if (link) {
    const home = el('a', '', '홈으로 돌아가기');
    home.href = 'home.html';
    message.append(home);
    // ?v= 손으로 고쳤냐..? 그럼 여기로 옴
    document.title = '동영상을 찾을 수 없음 - MeTube';
  }
}
function actionButton(iconName, text) {
  const button = el('button', 'action-button');
  button.type = 'button';
  const label = el('span', '', text);
  button.append(icon(iconName), label);
  return [button, label];
}
try {
  const data = await loadData();
  const video = id && data.video(id);
  if (!video) {
    showMessage('동영상을 찾을 수 없습니다. ', true);
  } else {
    const channel = data.channel(video.channelId);
    document.title = `${video.title} - MeTube`;
    addHistory(video.id);
    const layout = el('div', 'watch-layout');
    const primary = el('div', 'watch-primary');
    const player = setTone(el('div', 'player'), video.hue);
    if (typeof video.src === 'string' && video.src.trim()) {
      const media = el('video');
      // 클립 전체를 Blob으로 받음 (clip.js 참고). range 요청 안 되는 서버에서도 seek 됨
      media.preload = 'auto';
      clipUrl(video.src).then((url) => { media.src = url; });
      if (video.thumb) media.poster = video.thumb;
      media.setAttribute('aria-label', video.title);
      player.append(media);
      attachControls(player, media, video);
    } else {
      player.setAttribute('role', 'img');
      player.setAttribute('aria-label', `${video.title} (영상 준비 중)`);
      const placeholder = el('p');
      placeholder.append(icon('play_arrow'), el('span', '', '영상 준비 중'));
      player.append(placeholder);
    }
    primary.append(player, el('h1', 'watch-title', video.title));
    const subscribe = subscribeButton(channel.id);
    const channelInfo = el('div');
    const channelName = el('p', 'channel-name');
    const channelLink = el('a', '', channel.name);
    channelLink.href = `profile.html?c=${encodeURIComponent(channel.id)}`;
    channelName.append(channelLink);
    channelInfo.append(channelName, el('p', 'channel-subs', formatSubscribers(channel.subscribers)));
    const actions = el('div', 'watch-actions');
    const [like, likeCount] = actionButton('thumb_up', '');
    const [dislike, dislikeCount] = actionButton('thumb_down', '');
    const [share, shareLabel] = actionButton('share', '공유');
    const [save, saveLabel] = actionButton('schedule', '');
    actions.append(like, dislike, share, save);
    const paintReaction = (value) => {
      // 내 좋아요 1개는 화면에서만 더함 (json은 안 바뀜). 일단 됨(애초에 오프 전용임)
      const likes = video.likes + (value === 'like' ? 1 : 0);
      const dislikes = video.dislikes + (value === 'dislike' ? 1 : 0);
      likeCount.textContent = koCount(likes);
      // 유튜브는 싫어요 숫자 숨기는데 우린 걍 보여줌 (이걸로 metube 승리 ㅅㄱ)
      dislikeCount.textContent = koCount(dislikes);
      like.setAttribute('aria-label', `좋아요 ${koCount(likes)}개`);
      dislike.setAttribute('aria-label', `싫어요 ${koCount(dislikes)}개`);
      like.setAttribute('aria-pressed', String(value === 'like'));
      dislike.setAttribute('aria-pressed', String(value === 'dislike'));
    };
    paintReaction(reaction(video.id));
    like.addEventListener('click', () => paintReaction(toggleReaction(video.id, 'like')));
    dislike.addEventListener('click', () => paintReaction(toggleReaction(video.id, 'dislike')));
    const paintSave = (on) => {
      saveLabel.textContent = on ? '저장됨' : '나중에 볼 동영상';
      save.setAttribute('aria-pressed', String(on));
    };
    paintSave(isSaved(video.id));
    save.addEventListener('click', () => paintSave(toggleSaved(video.id)));
    share.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href); // clipboard는 https/localhost에서만 있음. 없거나 거부되면 throw
        shareLabel.textContent = '복사됨';
        setTimeout(() => { shareLabel.textContent = '공유'; }, 2000);
      } catch {
        try { window.prompt('아래 링크를 복사하세요', location.href); } catch { /* prompt 사용 불가 */ }
      }
    });
    const channelRow = el('div', 'channel-row');
    channelRow.append(channelAvatar(channel, 'md'), channelInfo, subscribe, actions);
    primary.append(channelRow);
    const description = el('div', 'description-box');
    description.append(
      el('p', '', `조회수 ${video.views.toLocaleString('ko-KR')}회 · ${formatDate(video.publishedAt)}${video.tags.length ? ` · ${video.tags.map((t) => `#${t}`).join(' ')}` : ` · #${video.category}`}`),
      el('p', '', video.description),
    );
    if (video.description.length >= 120 || video.description.includes('\n')) {
      const more = el('button');
      more.type = 'button';
      more.setAttribute('aria-expanded', 'false');
      more.textContent = '더보기';
      more.addEventListener('click', () => {
        const open = description.toggleAttribute('data-open');
        more.setAttribute('aria-expanded', String(open));
        more.textContent = open ? '간략히' : '더보기';
      });
      description.append(more);
    } else {
      description.setAttribute('data-open', '');
    }
    primary.append(description);
    const guestComments = comments(video.id);
    // 복사본 정렬. 그냥 sort하면 공유 캐시 순서가 바뀜 ;;
    const seedComments = [...video.comments].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    const allComments = [...guestComments, ...seedComments];
    const heading = el('h2', 'comments-count', `${koCount(allComments.length)}개의 댓글`);
    heading.id = 'comments-count';
    heading.setAttribute('aria-live', 'polite');
    heading.setAttribute('tabindex', '-1');
    const commentsJump = el('a', 'comments-jump');
    commentsJump.href = '#comments-count';
    const commentsJumpLabel = el('span', '', `댓글 ${koCount(allComments.length)}개`);
    commentsJump.append(icon('comment'), commentsJumpLabel);
    const section = el('section', 'comments');
    section.setAttribute('aria-labelledby', heading.id);
    const form = el('form', 'comment-form');
    const input = el('input', 'comment-input');
    // 500자 넘게 쓸 정성이면 블로그 ㄱㄱ
    Object.assign(input, { type: 'text', name: 'comment', maxLength: 500, placeholder: '댓글 추가...', autocomplete: 'off', required: true });
    input.setAttribute('aria-label', '댓글 추가');
    const submit = el('button', 'button button-secondary', '댓글');
    submit.type = 'submit';
    submit.disabled = true;
    const list = el('ul', 'comment-list');
    form.append(avatar([...GUEST_NAME][0], 'md'), input, submit);
    input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const comment = addComment(video.id, text);
      list.prepend(commentItem(comment, false, () => toggleCommentLike(comment.id)));
      empty.hidden = true;
      heading.textContent = `${koCount(list.children.length)}개의 댓글`;
      commentsJumpLabel.textContent = `댓글 ${koCount(list.children.length)}개`;
      input.value = '';
      submit.disabled = true;
      input.focus();
    });
    allComments.forEach((comment) => list.append(commentItem(comment, isCommentLiked(comment.id), () => toggleCommentLike(comment.id))));
    description.after(commentsJump);
    const empty = el('p', 'page-message', '첫 댓글을 남겨 보세요.');
    empty.hidden = allComments.length > 0;
    section.append(heading, form, list, empty);
    primary.append(section);
    const secondary = el('aside', 'watch-secondary');
    secondary.setAttribute('aria-label', '관련 동영상');
    const related = el('div', 'related-list');
    function renderRelated() {
      const hiddenVideoIds = new Set(hiddenVideos());
      const hiddenChannelIds = new Set(hiddenChannels());
      // 전부 가져옴. slice 먼저 하면 숨긴 만큼 10개 안 채워짐
      const candidates = relatedVideos(data, video, data.videos.length);
      const visible = candidates
        .filter((item) => !hiddenVideoIds.has(item.id) && !hiddenChannelIds.has(item.channelId))
        .slice(0, 10);
      related.replaceChildren(...(visible.length
        ? visible.map((item) => relatedCard(item, data.channel(item.channelId)))
        : [el('p', 'page-message', '추천 동영상이 없습니다.')]));
    }
    renderRelated();
    document.addEventListener('metube:change', (event) => {
      if (['hidden-videos', 'hidden-channels'].includes(event.detail?.key)) renderRelated();
    });
    secondary.append(related);
    layout.append(primary, secondary);
    // 좁은 화면은 관련 동영상이 댓글 위로 올라옴
    const narrow = matchMedia('(max-width: 999px)');
    const moveSecondary = () => narrow.matches ? section.before(secondary) : layout.append(secondary);
    moveSecondary();
    narrow.addEventListener('change', moveSecondary);
    page.append(layout);
  }
} catch {
  showMessage('동영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
}
