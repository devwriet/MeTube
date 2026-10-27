import fs from 'node:fs';

const path = process.env.METUBE_DATA ?? new URL('./videos.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const problems = [];
const fail = (msg) => problems.push(msg);
const keys = (value, required) => required.every((key) => Object.hasOwn(value, key));
const integer = (value) => Number.isInteger(value) && value >= 0;
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const channelFields = ['id', 'name', 'handle', 'subscribers', 'avatarLetter', 'bio'];
const videoFields = ['id', 'title', 'channelId', 'durationSeconds', 'views', 'likes', 'dislikes', 'publishedAt', 'category', 'type', 'description', 'src', 'hue', 'comments'];
const channelIds = new Set();
const videoIds = new Set();
const commentIds = new Set();
const categories = ['음악', '게임', '브이로그', '뉴스', '교육', '요리'];
const counts = { video: 0, short: 0 };

if (!data || Object.keys(data).sort().join(',') !== 'channels,videos' || !Array.isArray(data.channels) || !Array.isArray(data.videos)) {
  fail('top level must contain only channels and videos arrays');
} else {
  if (data.channels.length !== 6) fail(`expected 6 channels, got ${data.channels.length}`);
  if (data.videos.length !== 20) fail(`expected 20 videos, got ${data.videos.length}`);
  for (const [i, c] of data.channels.entries()) {
    if (!c || !keys(c, channelFields) || typeof c.id !== 'string' || typeof c.name !== 'string' || typeof c.handle !== 'string' || !integer(c.subscribers) || typeof c.avatarLetter !== 'string' || typeof c.bio !== 'string') { fail(`channel ${i}: missing field or wrong type`); continue; }
    if (!/^ch-[a-z]+$/.test(c.id)) fail(`channel ${i}: invalid id ${c.id}`);
    if (!c.handle.startsWith('@')) fail(`channel ${i}: invalid handle ${c.handle}`);
    if ([...c.avatarLetter].length !== 1) fail(`channel ${i}: avatarLetter must be one character`);
    if (channelIds.has(c.id)) fail(`duplicate channel id ${c.id}`);
    channelIds.add(c.id);
  }
  const woopi = data.channels.find((c) => c?.id === 'ch-woopi');
  if (!woopi || woopi.name !== '우피 (Woopi)' || woopi.handle !== '@woopi' || woopi.subscribers !== 15000 || woopi.avatarLetter !== '우' || woopi.bio !== 'MeTube 첫 번째 채널입니다.') fail('ch-woopi fields do not match required values');
  for (const [i, v] of data.videos.entries()) {
    if (!v || !keys(v, videoFields) || typeof v.id !== 'string' || typeof v.title !== 'string' || typeof v.channelId !== 'string' || !Number.isInteger(v.durationSeconds) || !integer(v.views) || !integer(v.likes) || !integer(v.dislikes) || typeof v.publishedAt !== 'string' || typeof v.category !== 'string' || typeof v.type !== 'string' || typeof v.description !== 'string' || !(v.src === null || (typeof v.src === 'string' && v.src.length > 0)) || !Number.isInteger(v.hue) || !Array.isArray(v.comments)) { fail(`video ${i}: missing field or wrong type`); continue; }
    if ([...v.title].length < 10 || [...v.title].length > 60) fail(`video ${i}: title length outside 10-60`);
    if (v.comments.length > 4) fail(`video ${v.id}: more than 4 comments`);
    if (!/^[A-Za-z0-9_-]{11}$/.test(v.id)) fail(`video ${i}: invalid id ${v.id}`);
    if (videoIds.has(v.id)) fail(`duplicate video id ${v.id}`);
    videoIds.add(v.id);
    if (!channelIds.has(v.channelId)) fail(`video ${v.id}: unknown channelId ${v.channelId}`);
    if (!categories.includes(v.category)) fail(`video ${v.id}: invalid category ${v.category}`);
    if (!['video', 'short'].includes(v.type)) fail(`video ${v.id}: invalid type ${v.type}`);
    else counts[v.type]++;
    if (v.type === 'video' && (v.durationSeconds < 60 || v.durationSeconds > 5400)) fail(`video ${v.id}: duration outside video range`);
    if (v.type === 'short' && (v.durationSeconds < 10 || v.durationSeconds > 60)) fail(`video ${v.id}: duration outside short range`);
    if (!date(v.publishedAt) || v.publishedAt < '2024-06-01' || v.publishedAt > '2026-10-25') fail(`video ${v.id}: invalid publishedAt ${v.publishedAt}`);
    if (!Number.isInteger(v.hue) || v.hue < 0 || v.hue > 359) fail(`video ${v.id}: hue outside 0-359`);
    for (const [j, c] of v.comments.entries()) {
      if (!c || !keys(c, ['id', 'author', 'text', 'time', 'likes']) || typeof c.id !== 'string' || typeof c.author !== 'string' || typeof c.text !== 'string' || typeof c.time !== 'string' || !integer(c.likes)) { fail(`video ${v.id}: comment ${j} has missing field or wrong type`); continue; }
      if (!/^c-\d+$/.test(c.id)) fail(`video ${v.id}: invalid comment id ${c.id}`);
      if (commentIds.has(c.id)) fail(`duplicate comment id ${c.id}`);
      commentIds.add(c.id);
      if (c.author === '나' || !c.author.length) fail(`video ${v.id}: invalid comment author`);
      if (c.likes > 5000) fail(`video ${v.id}: comment ${c.id} likes exceed 5000`);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(c.time) || !date(c.time.slice(0, 10)) || Number.isNaN(Date.parse(c.time)) || c.time.slice(0, 10) < v.publishedAt || Date.parse(c.time) >= Date.parse('2026-10-26T12:00:00+09:00')) fail(`video ${v.id}: invalid comment time ${c.time}`);
    }
  }
  if (counts.video !== 16 || counts.short !== 4) fail(`expected 16 video and 4 short, got ${counts.video} video and ${counts.short} short`);
  for (const category of categories) if (data.videos.filter((v) => v?.category === category).length < 2) fail(`category ${category} appears fewer than twice`);
  if (data.videos.filter((v) => v?.channelId === 'ch-woopi').length < 4) fail('ch-woopi must own at least 4 videos');
  if (data.videos.filter((v) => v?.comments?.length > 0).length < 15) fail('at least 15 videos need comments');
  if (data.videos.filter((v) => v?.comments?.length === 0).length < 2) fail('at least 2 videos need no comments');
  if (data.videos.filter((v) => v?.description?.length > 200).length < 3) fail('at least 3 descriptions must exceed 200 characters');
  if (data.videos.filter((v) => v?.type === 'video' && v.durationSeconds > 3600).length < 2) fail('at least 2 videos must exceed one hour');
  if (!data.videos.some((v) => v?.views < 1000) || !data.videos.some((v) => v?.views === 5000) || !data.videos.some((v) => v?.views === 9200) || !data.videos.some((v) => v?.views >= 10000 && v.views < 100000) || !data.videos.some((v) => v?.views >= 100000 && v.views <= 9999999) || !data.videos.some((v) => v?.views > 100000000)) fail('views do not cover all required ranges');
  if (!data.videos.some((v) => v?.publishedAt === '2026-10-25') || !data.videos.some((v) => v?.publishedAt >= '2026-10-19' && v.publishedAt <= '2026-10-25') || !data.videos.some((v) => v?.publishedAt >= '2026-09-28' && v.publishedAt <= '2026-10-05') || !data.videos.some((v) => v?.publishedAt <= '2025-10-25')) fail('publishedAt dates do not cover required relative ranges');
}

if (problems.length) { for (const problem of problems) console.error(problem); process.exitCode = 1; }
else console.log(`videos.json OK: ${data.channels.length} channels, ${data.videos.length} videos (${counts.video} video, ${counts.short} short)`);
