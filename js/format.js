// 한국어 표시 포맷 (유튜브 스타일). DOM 없는 순수 함수, format.test.mjs로 검사

// 반올림 말고 내림 (youtube.com처럼)
// 10단위 미만은 소수점 1자리, 그 이상은 정수
function unit(n, base) {
  const tenths = Math.floor((n * 10) / base);
  return tenths >= 100 ? String(Math.floor(tenths / 10)) : String(tenths / 10);
}

// 예: 850, 9,200, 5천, 1.2만, 15만, 1.2억
export function koCount(n) {
  if (n >= 1e8) return unit(n, 1e8) + '억';
  if (n >= 1e4) return unit(n, 1e4) + '만';
  if (n >= 1000 && n % 1000 === 0) return n / 1000 + '천';
  return n.toLocaleString('ko-KR');
}

export const formatViews = (n) => `조회수 ${koCount(n)}회`;
export const formatSubscribers = (n) => `구독자 ${koCount(n)}명`;

// 날짜 시차병 ;;(new Date(iso)는 UTC 자정, 시간대 따라 하루 밀림)
function parseDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(iso);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function timeAgo(iso, now = new Date()) {
  const s = Math.max(0, Math.floor((now - parseDate(iso)) / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  // 1분 전까진 다 방금임
  if (s < 60) return '방금 전';
  if (m < 60) return `${m}분 전`;
  if (h < 24) return `${h}시간 전`;
  if (d < 7) return `${d}일 전`;
  if (d < 30) return `${Math.floor(d / 7)}주 전`;
  if (d < 365) return `${Math.max(1, Math.floor(d / 30))}개월 전`;
  // 윤년..? 모르는 사람임
  return `${Math.floor(d / 365)}년 전`;
}

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  // 1:5 나오면 유튜브 아님
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// Date 안 써서 시간대 밀림 없음
export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${y}. ${m}. ${d}.`;
}

// sort(() => Math.random() - 0.5)는 편향되고 브라우저마다 결과 다름
// 그래서 피셔-예이츠 씀. random 넣을 수 있음 (테스트 결정적으로)
export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
