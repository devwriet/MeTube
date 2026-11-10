// data/videos.json 한 번만 읽고 캐시함
// 캐시되는 건 데이터가 아니라 promise임. 실패도 캐시됨 ;;(새로고침 전까진 계속 실패)
let cached;

// 못 읽으면 reject. resolve값: { channels, videos, channel(id), video(id) }
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

// 카테고리 처음 나온 순서대로 (정렬은 안 함)
export const categories = (videos) => [...new Set(videos.map((v) => v.category))];

export function matchesQuery(video, channel, q) {
  const needle = q.trim().toLowerCase();
  // 검색어 없음 -> 전원 합격
  if (!needle) return true;
  return [video.title, channel?.name ?? '', channel?.handle ?? ''].some((s) => s.toLowerCase().includes(needle));
}

export function relatedVideos(data, video, n = 10) {
  // 이뭔..? 불리언 빼기임 (true=1, false=0, 같은 카테고리가 앞으로)
  // publishedAt이 YYYY-MM-DD라 localeCompare만으로 날짜순 됨
  return data.videos
    .filter((v) => v.id !== video.id && v.type === 'video')
    .sort((a, b) => (b.category === video.category) - (a.category === video.category) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, n);
}
