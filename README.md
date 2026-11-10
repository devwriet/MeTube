# MeTube

Applied Screen 수업 과제로 만든 YouTube 목업입니다. 팀 이름은 deepfake입니다.
HTML, CSS, 바닐라 JavaScript(ES 모듈)만 사용하고 빌드 단계는 없습니다.

## 실행 방법

`home.html`을 더블클릭하면 열리지 않습니다. 브라우저가 `file://` 주소에서는 ES 모듈과 `fetch`를 막기 때문입니다.
폴더에서 로컬 서버를 켜고 브라우저로 접속해 주세요.

1. 이 폴더에서 터미널(Windows는 PowerShell)을 엽니다.
2. 아래 명령 중 하나를 실행합니다.
   - Python: `python -m http.server 8000` (Windows에서 안 되면 `py -m http.server 8000`)
   - VS Code: Live Server 확장으로 `index.html` 열기
3. 브라우저에서 http://localhost:8000/ 을 엽니다. 홈으로 자동 이동합니다.

화면이 비어 있으면 Windows의 Python이 `.js` 파일 형식을 잘못 알려 주는 경우일 수 있습니다. 이때는 VS Code Live Server를 사용해 주세요.

Chrome 또는 Edge를 권장합니다. 인터넷 연결은 필요하지 않습니다.

## 페이지

- `home.html`: 홈 피드, 카테고리, 검색
- `watch.html?v=MT000000013`: 재생 화면(좋아요, 댓글, 구독, 속도, 극장 모드, 자동 재생)
- `shorts.html`: Shorts 피드(음소거, 진행 바 미리보기, 댓글)
- `profile.html`: 내 채널과 다른 채널 화면

## 단축키

- 재생 화면: Space 또는 k 재생/일시정지, m 음소거, f 전체 화면, t 극장 모드, 좌우 방향키 5초 이동
- Shorts: 위/아래 방향키 이동, m 음소거

## 영상 출처

영상과 썸네일은 팀이 고른 YouTube 영상의 일부(20초 이내)이며 수업 과제용으로만 사용합니다.
출처 목록은 `media/SOURCES.md`에 있습니다.
