// Loads data/videos.json once and offers lookups and filters.
let cached;

// Resolves to { channels, videos, channel(id), video(id) }. Rejects if the file cannot be loaded.
export function loadData() {
  cached ??= fetch('data/videos.json')
    .then((res) => {
      if (!res.ok) throw new Error(`data/videos.json: HTTP ${res.status}`);
      return res.json();
    })
    .then(({ channels, videos }) => {
      const channelById = new Map(channels.map((c) => [c.id, c]));
      const videoById = new Map(videos.map((v) => [v.id, v]));
      return {
        channels,
        videos,
        channel: (id) => channelById.get(id),
        video: (id) => videoById.get(id),
      };
    });
  return cached;
}

// Categories in first-seen order.
export const categories = (videos) => [...new Set(videos.map((v) => v.category))];

// Case-insensitive match on title or channel name; empty query matches all.
export function matchesQuery(video, channel, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [video.title, channel?.name ?? '', channel?.handle ?? ''].some((s) => s.toLowerCase().includes(needle));
}

// Up to n other regular videos: same category first, then newest.
export function relatedVideos(data, video, n = 10) {
  return data.videos
    .filter((v) => v.id !== video.id && v.type === 'video')
    .sort((a, b) => (b.category === video.category) - (a.category === video.category) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, n);
}
