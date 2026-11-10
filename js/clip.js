// python -m http.server 같은 Range 없는 정적 서버는 하.., 클립 seek가 안 됨
// progress bar 끌면 0:00으로 튕기고 ?t=도 무시됨. 난리났따
// Blob으로 전체를 받으면 어느 서버에서든 seek됨. fetch 실패하면 원래 URL로 fallback
// 피드 커지면 멀리 있는 쇼츠부터 evict할 것 (upgrade path)
export function clipUrl(src) {
  return fetch(src)
    .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(String(response.status)))))
    .then((blob) => URL.createObjectURL(blob))
    .catch(() => src);
}
