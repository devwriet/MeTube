# MeTube 팀원 가이드

## 요약

- 우리는 유튜브를 색만 반전시킨 가짜 사이트 "MeTube"를 만들어요. 팀 이름은 deepfake예요.
- 받은 파일은 3개예요: 이 가이드, `tokens.css`(색), `CLASSES.md`(클래스 이름 목록).
- **A**는 와이어프레임 3장(Home, Watch, Profile)을, **B**는 화면 부품(UI 컴포넌트) 8종을 HTML/CSS로 만들어요.
- AI를 써도 돼요. 대신 **AI에게 파일 3개의 규칙을 알려주고, 결과를 직접 확인하고, 어떻게 만들었는지 설명할 수 있어야 해요.**
- JS는 쓰지 않아요. 색과 클래스 이름은 받은 파일 그대로 써요.
- 다 만들면 구글 드라이브 폴더에 올려요.
- 첫 마감은 **10월 24일(금)**, 마지막 마감은 **10월 31일(금)**이에요. 무엇을 만들지는 바로 아래의 "만들 것 목록"에 있어요.

## 읽는 순서

1. "만들 것 목록"과 1번부터 3번까지 읽어요. (할 일, 프로젝트, 내 역할)
2. 4번과 5번을 읽어요. (규칙과 AI 사용법) 이 부분이 가장 중요해요.
3. 만들기 시작해요. 막히면 7번(문제 해결)을 봐요.
4. 올리기 전에 8번 체크리스트를 확인해요.

## 만들 것 목록

만들면 `[x]`로 바꿔요. 자세한 설명은 3번(역할)에 있어요.

### A: 와이어프레임 3개

- [ ] **`home-wireframe.html`** (마감 10월 24일, 금)
  - `header`, `guide`, `chips`(칩 7개), `video-grid`(`card` 8개)
- [ ] **`watch-wireframe.html`** (마감 10월 31일, 금)
  - `player`, `watch-title`, `channel-row`, `watch-actions`, `description-box`, `comments`, `related-list`
- [ ] **`profile-wireframe.html`** (마감 10월 31일, 금)
  - `banner`, `profile-header`, `tabs`, `video-grid`(`card` 8개)

### B: UI 컴포넌트 8개 (`components.html` 한 파일에 모아요)

첫 번째 마감에는 1~4번까지 올려요. 파일 이름은 `components-v1.html`이에요. 두 번째 마감에는 전부 올려요. 파일 이름은 `components-v2.html`이에요.

마감 10월 24일(금):

- [ ] 1. **헤더**: `header`, `logo`, `icon-button`
- [ ] 2. **검색창**: `search`, `search-input`, `search-button`
- [ ] 3. **영상 카드**: `card` 전체 (평소, 마우스 올림)
- [ ] 4. **카테고리 칩**: `chip`, `chip-active` (평소, 마우스 올림, 선택됨)

마감 10월 31일(금):

- [ ] 5. **사이드바**: `guide`, `guide-item`, `guide-item-active`
- [ ] 6. **버튼**: `button-subscribe`, `button-subscribed`
- [ ] 7. **댓글 한 줄**: `comment` 전체
- [ ] 8. **관련 영상 한 줄**: `related-card` 전체

만든 뒤에는 8번의 체크리스트로 확인하고, 드라이브에 올려요.

---

## 1. 프로젝트

MeTube는 유튜브와 같은 구조에 색만 반전시킨 사이트예요. 학교 과제 목업이라서 로그인, 업로드, 설정 같은 기능은 없어요.

- 화면은 4개예요: **Home**, **Watch**(영상 재생), **Shorts**, **Profile**(채널).
- Shorts는 따로 만들지 않아도 돼요. A와 B는 Home, Watch, Profile과 그 부품만 맡아요.
- 사이트는 **어두운 화면**이에요. 배경은 검은색이고, 글자는 밝은 회색이에요.
- 강조색은 파란색(`--accent`)이에요. 로고 상자, 프로필 사진 같은 곳에 배경으로 써요.

## 2. 받은 파일 3개

| 파일 | 무엇인가요 | 어떻게 쓰나요 |
| --- | --- | --- |
| `GUIDE-ko.md` | 이 문서 | 처음부터 끝까지 한 번 읽어요 |
| `tokens.css` | 색과 글꼴 변수 | HTML 파일과 같은 폴더에 두고 연결해요 |
| `CLASSES.md` | 클래스 이름과 크기 목록 | 이름과 크기를 그대로 가져다 써요 |

`tokens.css`에 들어 있는 색은 이렇게 써요.

| 변수 | 쓰는 곳 |
| --- | --- |
| `--bg` | 페이지 배경 (검은색) |
| `--chip` | 칩, 회색 상자 배경 |
| `--hover` | 마우스를 올렸을 때 배경 |
| `--text` | 기본 글자 |
| `--text-2` | 보조 글자 (채널 이름, 조회수, 시간) |
| `--accent` | 파란 배경 (그 위 글자는 `--on-accent`) |
| `--link` | 링크 (주황색) |
| `--line` | 얇은 구분선 |
| `--field-line` | 검색창, 버튼의 테두리 |
| `--field-btn` | 검색 버튼, "Subscribed" 버튼 배경 |
| `--scrim`, `--on-scrim` | 썸네일 위의 시간 표시 배경과 글자 |
| `--font` | 글꼴 |

---

## 3. 역할

### A: 와이어프레임 (Home, Watch, Profile)

**와이어프레임이란?** 화면의 "뼈대"예요. 어디에 무엇이 있는지, 얼마나 큰지만 보여줘요. 사진, 장식, 예쁜 색은 필요 없어요.

- 상자마다 `CLASSES.md`의 클래스 이름을 붙여요.
- 크기는 목록에 있는 대로 맞춰요. 예를 들어 헤더는 높이 56px이에요.
- 색은 `--bg`, `--chip`, `--text`, `--text-2`, `--line`만 써요.
- 상자 안에는 글자로 내용을 적어요. 예: `영상 제목`, `채널 이름`.
- 영상 카드는 3~4개만 직접 써요. 나머지는 복사해요.

**만들 순서와 파일 이름**

1. `home-wireframe.html`
2. `watch-wireframe.html`
3. `profile-wireframe.html`

**Home의 뼈대**

```
┌─ header (높이 56px) ─────────────────────────────┐
├─ guide ──┬─ page ─────────────────────────────────┤
│ (240px)  │ chips (높이 56px): chip chip chip ...   │
│          │ video-grid                              │
│ guide-   │  [card] [card] [card] [card]            │
│ item     │  [card] [card] [card] [card]            │
└──────────┴────────────────────────────────────────┘
card 안: card-thumb(16:9) > card-duration
         card-body > card-avatar + card-title, card-channel, card-stats
```

**Watch의 뼈대** (사이드바 `guide`는 없어요. 유튜브도 Watch에서는 숨겨요.)

```
┌─ header ──────────────────────────────────────────┐
├─ watch-layout ────────────────────────────────────┤
│ watch-primary                 │ watch-secondary    │
│  player (16:9)                │ (너비 320px)       │
│  watch-title                  │  related-list      │
│  channel-row                  │   related-card     │
│   (avatar, channel-name,      │   related-card     │
│    channel-subs, Subscribe)   │   related-card     │
│  watch-actions (action-button)│                    │
│  description-box              │                    │
│  comments                     │                    │
│   comment-form                │                    │
│   comment-list > comment ...  │                    │
└───────────────────────────────┴───────────────────┘
```

**Profile의 뼈대** (사이드바는 72px의 작은 `guide-mini`예요.)

```
┌─ header ──────────────────────────────────────────┐
├ guide-mini ┬ page ────────────────────────────────┤
│ (72px)     │ banner (가로세로 6.2:1)               │
│            │ profile-header                        │
│            │  profile-avatar | profile-name        │
│            │                   profile-handle      │
│            │                   profile-stats       │
│            │                   profile-bio         │
│            │                   button-subscribe    │
│            │ tabs: tab tab-active tab tab          │
│            │ video-grid > card card card card      │
└────────────┴──────────────────────────────────────┘
```

### B: UI 컴포넌트 (부품 8종)

**컴포넌트란?** 여러 화면에서 반복해서 쓰는 부품이에요. 카드, 버튼 같은 것이요. 부품을 예쁘게 만들면 나중에 화면마다 갖다 붙일 수 있어요.

한 파일 `components.html`에 8종을 모두 보여줘요. 각 부품은 상태도 같이 보여줘요.

| # | 부품 | 주요 클래스 | 크기 | 보여줄 상태 |
| --- | --- | --- | --- | --- |
| 1 | 헤더 | `header`, `header-left`, `header-right`, `logo`, `icon-button` | 높이 56px | 평소, 아이콘에 마우스 올림 |
| 2 | 검색창 | `search`, `search-input`, `search-button` | 높이 40px, 왼쪽과 오른쪽이 둥글게 | 평소, 입력 중(포커스) |
| 3 | 사이드바 | `guide`, `guide-item`, `guide-item-active` | 너비 240px, 항목 높이 40px | 평소, 마우스 올림, 선택됨 |
| 4 | 카테고리 칩 | `chip`, `chip-active` | 높이 32px, 모서리 8px | 평소, 마우스 올림, 선택됨 |
| 5 | 영상 카드 | `card`, `card-thumb`, `card-duration`, `card-body`, `card-avatar`, `card-title`, `card-channel`, `card-stats` | 썸네일 16:9, 모서리 12px | 평소, 마우스 올림 |
| 6 | 버튼 | `button`, `button-subscribe`, `button-subscribed` | 높이 40px, 완전히 둥글게 | Subscribe, Subscribed |
| 7 | 댓글 한 줄 | `comment`, `comment-avatar`, `comment-body`, `comment-author`, `comment-time`, `comment-text`, `comment-like` | 사진 36px | 평소 |
| 8 | 관련 영상 한 줄 | `related-card`, `related-thumb`, `related-title`, `related-channel`, `related-stats` | 가로로 썸네일과 글자 | 평소, 마우스 올림 |

- 마우스 올림 상태는 CSS의 `:hover`로 만들어요. 선택됨 상태는 `-active` 클래스를 붙여서 보여줘요.
- 파란색(`--accent`)이 들어가는 곳은 로고 상자와 프로필 사진뿐이에요.
- 사진이 필요한 곳(썸네일, 프로필 사진)은 회색 상자나 `--chip` 색으로 채워요. 이미지 파일은 쓰지 않아요.

---

## 4. 꼭 지킬 규칙

1. **클래스 이름은 `CLASSES.md`에 있는 그대로 써요.** 없는 이름이 필요하면 팀에 먼저 물어봐요.
2. **색은 `var(--bg)`처럼 변수로만 써요.** `#ff0000`이나 `rgb(...)` 같은 색 코드를 직접 쓰지 않아요.
3. **파란색(`--accent`)은 배경으로만 써요.** 그 위의 글자는 `--on-accent`(흰색)로 써요. 검은 배경 위에 파란 글자나 파란 선은 거의 안 보여요.
4. **JS는 쓰지 않아요.** HTML과 CSS만 써요.
5. **`style="..."`를 HTML 태그 안에 직접 쓰지 않아요.** 스타일은 `<style>` 안에 써요.
6. **인터넷 주소를 쓰지 않아요.** 구글 폰트, CDN, 이미지 링크를 넣지 않아요. 글꼴은 `var(--font)`예요.
7. **한 파일은 한 화면(또는 한 묶음의 부품)만 담아요.**
8. **모르면 물어봐요.** 추측으로 만들면 나중에 합칠 때 다시 해야 해요.
9. **변수는 `tokens.css`에 있는 이름만 써요.** 2번 표는 자주 쓰는 것만 모은 거예요. `--border`, `--text-sub`, `--surface-hover`처럼 `tokens.css`에 없는 이름은 AI가 지어낸 것이라서 색이 사라져요. `var(--bg, #0f0f0f)`처럼 뒤에 색 코드를 붙이는 것도 하지 않아요.
10. **`outline: none`을 쓰지 않아요.** 키보드로 이동할 때 보이는 테두리가 사라져요.

---

## 5. AI 사용법

AI를 써도 돼요. 단, **내가 어떻게 만들었는지 설명할 수 있어야 해요.** 줄마다 설명할 필요는 없고, 전체 과정만 말하면 돼요.

### 5-1. 원칙 5가지

1. **AI는 우리 파일을 몰라요.** 새 대화를 시작할 때마다 `tokens.css`와 `CLASSES.md`의 내용을 붙여 넣어요. 안 붙이면 AI가 마음대로 클래스 이름과 색을 만들어요.
2. **한 번에 하나만 시켜요.** "Home 전체 만들어줘"보다 "헤더만 만들어줘"가 더 정확해요. 완성한 부분은 저장해 두고 다음 부분으로 넘어가요.
3. **AI가 준 결과는 꼭 확인해요.** 브라우저에서 열고, 4번 규칙을 하나씩 대조해 봐요. AI는 규칙을 자주 어겨요.
4. **틀렸으면 AI에게 어디가 틀렸는지 알려줘요.** 처음부터 다시 시키지 않아도 돼요. 7번에 복사해서 쓸 수 있는 수정 요청이 있어요.
5. **과정을 기억해 둬요.** 어떤 질문을 했고 무엇을 고쳤는지 기억해 두면, 나중에 물어볼 때 대답할 수 있어요.

### 5-2. 처음 한 번 하는 준비 질문 (새 대화마다)

AI 대화창에 아래를 먼저 붙여 넣어요. `[ ]` 안은 파일 내용으로 바꿔요.

```
나는 학교 과제로 "MeTube"라는 웹사이트의 화면을 HTML과 CSS로 만들고 있어.
유튜브와 구조가 같고 색만 반전시킨 어두운 사이트야.

아래 규칙을 항상 지켜줘.
1. HTML과 CSS만 써. JavaScript는 쓰지 마.
2. 클래스 이름은 아래 CLASSES.md에 있는 이름만 써. 새 이름을 만들지 마.
3. 색은 아래 tokens.css의 var(--...) 변수만 써. #ff0000이나 rgb() 같은 색 코드를 직접 쓰지 마.
4. 인터넷 주소(CDN, 구글 폰트, 이미지 링크)를 쓰지 마. 사진 자리는 회색 상자로 채워.
5. style="..." 속성을 태그에 쓰지 마. CSS는 <head> 안의 <style>에 써.
6. 파일 하나로 완성된 HTML을 줘. 맨 위에 <link rel="stylesheet" href="tokens.css">를 넣어.
7. 규칙을 지킬 수 없는 부분이 있으면 만들지 말고 먼저 알려줘.

[tokens.css 내용 전체]

[CLASSES.md 내용 전체]

이해했으면 "이해했어"라고만 대답해.
```

AI가 "이해했어"라고 하면 그다음부터 부탁해요.

### 5-3. A: 와이어프레임 요청 예시

**Home 요청 (복사해서 쓰세요)**

```
Home 와이어프레임을 만들어줘.
구조: header(높이 56px), 왼쪽 guide(너비 240px), 오른쪽 page 안에 chips(높이 56px)와 video-grid.
- header 안: header-left(메뉴 버튼 icon-button, logo), search(search-input, search-button), header-right(icon-button 2개, avatar).
- guide 안: guide-item 5개 (Home, Shorts, Subscriptions, You, History). Home은 guide-item-active.
- chips 안: chip 7개. 첫 번째는 chip-active.
- video-grid: 4열, 간격 16px. card 8개.
- card 안: card-thumb(16:9, 회색 상자), card-duration, card-body(card-avatar, card-title, card-channel, card-stats).
와이어프레임이라서 색은 --bg, --chip, --text, --text-2, --line만 써. 글자는 "영상 제목", "채널 이름"처럼 자리 표시로 써.
```

**Watch, Profile**은 위 요청의 구조 부분만 3번의 뼈대로 바꿔요.

### 5-4. B: 부품 요청 예시

**영상 카드 요청 (복사해서 쓰세요)**

```
영상 카드(card) 하나를 만들어줘.
- card 안: card-thumb(16:9 비율, 모서리 12px, --chip 색), 그 안 오른쪽 아래에 card-duration(--scrim 배경, --on-scrim 글자, 12px).
- 아래에 card-body: 왼쪽에 card-avatar(36px 원), 오른쪽에 card-title(16px, 굵기 500, 최대 2줄), card-channel(--text-2), card-stats(--text-2).
- 마우스를 올리면 card-thumb 위에 살짝 밝아지는 효과를 넣어줘 (--hover 사용).
- 카드 3개를 나란히 보여줘.
```

다른 부품도 같은 방식으로 해요. 3번의 표에서 "클래스", "크기", "상태"를 그대로 요청에 옮겨 적으면 돼요.

### 5-5. 좋은 요청과 나쁜 요청

| 나쁜 요청 | 왜 문제인가요 | 좋은 요청 |
| --- | --- | --- |
| "유튜브 Home 화면 만들어줘" | AI가 진짜 유튜브 색과 클래스를 써요 | 5-3처럼 구조, 클래스, 크기를 알려줘요 |
| "예쁘게 만들어줘" | 마음대로 색과 그림자를 넣어요 | "tokens.css의 변수만 써서"라고 해요 |
| "전부 만들어줘" | 규칙을 어길 확률이 커져요 | 헤더만, 카드만처럼 하나씩 해요 |
| "자바스크립트로 검색도 되게" | JS는 금지예요 | 검색창의 모양만 만들어요 |

### 5-6. 결과를 받으면 (5단계)

1. 코드를 파일로 저장해요. 이름은 3번의 파일 이름을 써요.
2. 같은 폴더에 `tokens.css`가 있는지 확인하고, 파일을 **더블클릭**해서 브라우저로 열어요.
3. 화면이 3번의 뼈대, 표와 비슷한지 눈으로 비교해요.
4. 코드에서 `#`으로 시작하는 색 코드와 `<script>`, `style="`를 검색해요. (VS Code는 `Cmd+F`예요.) 있으면 7번의 수정 요청을 써요.
5. 고친 내용과 이유를 기억해 둬요. 나중에 물어볼 수 있어요.

### 5-7. 내 코드를 설명할 수 있게 하기

AI에게 이렇게 물어보세요. 답을 읽어 두면 내 코드를 설명할 수 있어요.

```
방금 만든 코드를 HTML 처음 배우는 학생이 이해할 수 있게 설명해줘.
- 전체 구조를 3~5줄로 요약해줘.
- 중요한 CSS 규칙 5개를 골라서, 각각 무엇을 하는지 한 줄씩 설명해줘.
```

선생님이 물어보면 이 요약으로 답할 수 있어요. 예: "AI에게 규칙과 클래스 목록을 알려주고 카드를 만들게 했어요. 색 코드가 직접 들어 있어서 변수로 바꿨어요."

---

## 6. 시작 틀

AI 없이 직접 만들 때, 또는 AI의 결과를 정리할 때 쓰는 틀이에요. `tokens.css`는 같은 폴더에 두세요.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MeTube Home 와이어프레임</title>
  <link rel="stylesheet" href="tokens.css">
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { background: var(--bg); color: var(--text); font: 14px var(--font); }
    /* 여기에 CSS를 써요 */
  </style>
</head>
<body>
  <!-- 여기에 HTML을 써요 -->
</body>
</html>
```

## 7. 문제 해결

### AI가 규칙을 어겼을 때 (복사해서 쓰세요)

| 상황 | AI에게 이렇게 말해요 |
| --- | --- |
| 색 코드를 직접 썼어요 | `코드에 #으로 시작하는 색 코드가 있어. 전부 tokens.css의 var(--...) 변수로 바꿔줘. 어떤 변수로 바꿨는지 목록도 알려줘.` |
| 없는 변수 이름을 썼어요 | `tokens.css에 없는 var(--...) 이름이 있어. tokens.css에 있는 변수로만 바꾸고, var(--이름, #색코드)처럼 뒤에 붙은 색 코드도 전부 지워줘. 바꾼 목록도 알려줘.` |
| 없는 클래스 이름을 썼어요 | `CLASSES.md에 없는 클래스 이름을 썼어. CLASSES.md의 이름으로 바꾸고, 바꾼 이름을 목록으로 알려줘.` |
| JS가 들어 있어요 | `<script>가 들어 있어. JS 없이 HTML과 CSS만으로 다시 만들어줘.` |
| `style="..."`를 썼어요 | `태그 안의 style 속성을 전부 <head>의 <style> 안으로 옮겨줘.` |
| 인터넷 주소가 있어요 | `외부 주소(CDN, 폰트, 이미지 링크)를 전부 빼줘. 사진 자리는 var(--chip) 색의 상자로 바꿔줘.` |
| 크기가 달라요 | `[클래스 이름]의 크기를 CLASSES.md대로 [높이 56px]로 맞춰줘.` |
| 파란 글자가 안 보여요 | `--accent는 배경으로만 써야 해. 파란 글자와 파란 선을 --text나 --text-2로 바꾸고, 파란 배경 위의 글자는 --on-accent로 해줘.` |

### 그 밖의 문제

- **화면이 하얗거나 색이 없어요.** `tokens.css`가 HTML 파일과 같은 폴더에 있는지, `<link>`의 이름이 맞는지 확인해요.
- **글자가 검은색이라 안 보여요.** `body`에 `background: var(--bg); color: var(--text);`가 있는지 확인해요.
- **AI가 같은 실수를 계속해요.** 새 대화를 열고 5-2의 준비 질문부터 다시 시작해요. 대화가 길어지면 AI가 규칙을 잊어요.
- **계속 안 돼요.** 15분 이상 막히면 팀에 물어봐요. 막힌 부분의 화면과 AI에게 한 질문을 같이 보내면 빨라요.

---

## 8. 확인하고 올리기

### 체크리스트

- [ ] 파일을 더블클릭하면 브라우저에서 열려요
- [ ] 클래스 이름이 `CLASSES.md`와 같아요
- [ ] 색 코드(`#...`)와 `rgb(...)`가 직접 들어 있지 않아요
- [ ] `<script>`와 `style="`가 없어요
- [ ] 인터넷 주소(`http`)가 없어요
- [ ] 브라우저 창 크기를 바꿔도 화면이 크게 깨지지 않아요

### 올리는 방법

- 팀 구글 드라이브 폴더 안에 내 폴더(`A` 또는 `B`)를 만들어서 올려요.
- 고칠 때는 파일을 덮어쓰지 않고 번호를 올려요: `home-wireframe-v2.html`
- 올린 뒤에 팀에 알려줘요.

### 일정

마감은 위의 "만들 것 목록"에 있어요. 일정이 밀릴 것 같으면 마감 전에 미리 알려줘요.
