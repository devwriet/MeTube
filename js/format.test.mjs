// Self-check for format.js. Run: node js/format.test.mjs
import assert from 'node:assert/strict';
import { koCount, formatViews, formatSubscribers, timeAgo, formatDuration, formatDate } from './format.js';

assert.equal(koCount(0), '0');
assert.equal(koCount(850), '850');
assert.equal(koCount(5000), '5천');
assert.equal(koCount(9200), '9,200');
assert.equal(koCount(12000), '1.2만');
assert.equal(koCount(29000), '2.9만'); // float trap: 2.9 * 10 !== 29
assert.equal(koCount(19999), '1.9만'); // rounds down
assert.equal(koCount(10000), '1만');
assert.equal(koCount(150000), '15만');
assert.equal(koCount(1234567), '123만');
assert.equal(koCount(123456789), '1.2억');
assert.equal(formatViews(12000), '조회수 1.2만회');
assert.equal(formatViews(9200), '조회수 9,200회');
assert.equal(formatSubscribers(15000), '구독자 1.5만명');

const now = new Date('2026-10-26T12:00:00+09:00');
const ago = (sec) => new Date(now - sec * 1000).toISOString();
assert.equal(timeAgo(ago(10), now), '방금 전');
assert.equal(timeAgo(ago(5 * 60), now), '5분 전');
assert.equal(timeAgo(ago(3 * 3600), now), '3시간 전');
assert.equal(timeAgo(ago(3 * 86400), now), '3일 전');
assert.equal(timeAgo(ago(14 * 86400), now), '2주 전');
assert.equal(timeAgo(ago(40 * 86400), now), '1개월 전');
assert.equal(timeAgo(ago(200 * 86400), now), '6개월 전');
assert.equal(timeAgo(ago(800 * 86400), now), '2년 전');
assert.equal(timeAgo(ago(-60), now), '방금 전'); // future clock skew
// date-only = local midnight, in any time zone
assert.equal(timeAgo('2026-10-25', new Date(2026, 9, 26, 0, 30)), '1일 전');
assert.equal(timeAgo('2026-10-26', new Date(2026, 9, 26, 15, 0)), '15시간 전');

assert.equal(formatDuration(45), '0:45');
assert.equal(formatDuration(522), '8:42');
assert.equal(formatDuration(3725), '1:02:05');
assert.equal(formatDate('2026-10-23'), '2026. 10. 23.');

console.log('format.js OK');
