// A static server without Range support (python -m http.server, likely on the review PC) streams a clip as one
// unseekable response: dragging a progress bar snaps back to 0:00 and ?t= does nothing. Pulling the whole file
// into a Blob first makes it seekable anywhere on any server. Falls back to the plain URL if the fetch fails.
// ponytail: Blob URLs are never revoked, so every clip a Short feed visits stays in memory (about 80 MB for all 8);
// evict distant Shorts if the feed ever grows.
export function clipUrl(src) {
  return fetch(src)
    .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(String(response.status)))))
    .then((blob) => URL.createObjectURL(blob))
    .catch(() => src);
}
