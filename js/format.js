// Korean display formats, YouTube style. Pure functions (no DOM), checked by format.test.mjs.

// 1 decimal below 10 units, whole number above; always rounded down like youtube.com.
function unit(n, base) {
  const tenths = Math.floor((n * 10) / base);
  return tenths >= 100 ? String(Math.floor(tenths / 10)) : String(tenths / 10);
}

// 850, 9,200, 5천, 1.2만, 15만, 1.2억
export function koCount(n) {
  if (n >= 1e8) return unit(n, 1e8) + '억';
  if (n >= 1e4) return unit(n, 1e4) + '만';
  if (n >= 1000 && n % 1000 === 0) return n / 1000 + '천';
  return n.toLocaleString('ko-KR');
}

export const formatViews = (n) => `조회수 ${koCount(n)}회`;
export const formatSubscribers = (n) => `구독자 ${koCount(n)}명`;

// "YYYY-MM-DD" is a local calendar date (new Date() alone would read it as UTC midnight).
function parseDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(iso);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "3일 전", "2주 전", "1개월 전"
export function timeAgo(iso, now = new Date()) {
  const s = Math.max(0, Math.floor((now - parseDate(iso)) / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60) return '방금 전';
  if (m < 60) return `${m}분 전`;
  if (h < 24) return `${h}시간 전`;
  if (d < 7) return `${d}일 전`;
  if (d < 30) return `${Math.floor(d / 7)}주 전`;
  if (d < 365) return `${Math.max(1, Math.floor(d / 30))}개월 전`;
  return `${Math.floor(d / 365)}년 전`;
}

// 8:42, 1:02:05
export function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// "2026-10-23" -> "2026. 10. 23." (read as a calendar date, no time zone shift)
export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${y}. ${m}. ${d}.`;
}
