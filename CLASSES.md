# MeTube class names

Use these exact names in wireframes and UI files. The site code finds elements by these names.
Sizes come from measuring youtube.com (2026-10-20). Colors: only `var(--...)` from `css/tokens.css`.

## Naming rules

1. Lowercase letters and hyphens only: `card-title`. No capitals, no underscores.
2. Pattern: `thing` or `thing-part`. The first word is the component. Example: `card`, `card-thumb`.
3. A state is a second class with the suffix `-active`: `chip chip-active`.
4. Use the names below. Need a new name? Ask the team first. Do not invent your own.
5. No inline `style=""`. No `id` for styling.
6. Pages are `home.html`, `watch.html`, `shorts.html`, `profile.html`.

## Shared on every page

| Class | What it is | Size / note |
| --- | --- | --- |
| `header` | Top bar, fixed | 56 px high |
| `header-left` | Menu button and logo | |
| `header-right` | Create, bell, avatar | |
| `logo` | "MeTube" text with the `Me` box | |
| `skip-link` | Keyboard link to the page content | hidden until focused |
| `nav-progress` | Top loading bar for page loads | 2 px, accent-to-mint gradient, above the header; finishes when the page data is loaded |
| `search` | Search form (input and button) | centered, up to 640 px |
| `search-input` | Text field | 40 px high, 16 px text, round left |
| `search-button` | Magnifier button | 64 px wide, icon centered, round right; on phones the field stays visible and the button is 44 px (youtube.com collapses it to a 40 px icon below 657 px; we keep the field for our own search feature) |
| `icon-button` | Round icon-only button | 40 px; 44 px on phones |
| `icon` | Inline SVG icon (copy from `media/icons/`) | 24 px, takes the text color; add `aria-hidden="true"` |
| `avatar` | Round picture or letter | `avatar-xs` 24 (sidebar channels), `avatar-sm` 32, `avatar-md` 36, `avatar-lg` 160 |
| `guide` | Left sidebar | 240 px wide; `guide-mini` is 72 px; hidden at 791 px or less (tablet and phone). `guide-drawer` = always hidden (Watch); `guide-open` = the menu button shows it as a 240 px overlay at <=1312 px and on Watch at every width, with `guide-scrim` behind it |
| `guide-item` | One sidebar link | 40 px high (76 px inside `guide-mini`, icon above an 11 px label; youtube.com uses 10 px, below our 11 px readability floor); `guide-item-active` for the current page |
| `guide-more` | Everything below Home and Shorts in the wide sidebar | hidden in mini mode |
| `guide-mini-only` | 구독 and 나 entries | shown only in mini mode |
| `guide-heading` | Section title (구독, 나, 탐색) | 16 px, weight 500; a link with a chevron when it opens a page |
| `guide-links` | Footer text links (소개, 저작권 ...) | 13 px, wraps |
| `guide-link` | One footer text link | placeholder |
| `guide-copy` | Footer copyright line | 12 px |
| `page` | Main area right of the sidebar | `id="content"`, focusable for skip link |
| `page-title` | The page's `h1` when the design shows no title (Home, Watch "not found") | hidden on screen, read by screen readers |
| `sr-only` | Visually hidden text that remains available to screen readers | |
| `page-message` | Message instead of content: no search results, video not found, data failed to load | centered, secondary color, 16 px |
| `button` | Base pill button | 40 px high, bold 500 |
| `button-subscribe` | Subscribe | fill `--text`, text `--bg`; 44 px min height on phones |
| `button-subscribed` | Subscribed (after click) | fill `--field-btn`, border `--field-line`; 44 px min height on phones |

## Video card and grid (Home, Profile, search results)

| Class | What it is | Size / note |
| --- | --- | --- |
| `video-grid` | Grid of cards | 3 columns; 4 from 1912 px (wide sidebar) or 1744 px (mini sidebar); 2 at 1100 px or less, 1 at 650 px or less; 16 px column gap, 40 px row gap |
| `shorts-shelf` | Home Shorts section inside `video-grid` | spans every grid column |
| `shorts-shelf-header` | Shorts header row: title left, ⋮ button right | 40 px high; 18 px below |
| `shorts-shelf-title` | Shorts icon and title inside the header row | 20 px, bold; 24 px icon |
| `shorts-row` | Row of Home Shorts tiles | One row: 6 / 5 / 3 / 2 columns at >=1912 / 946-1911 / 548-945 / <548 px; 16 px gap, 8 px below 600 px; extra items hidden |
| `card` | One video box with separate video and channel links | |
| `card-link` | Thumbnail link to the video | |
| `card-thumb` | Thumbnail box | 16:9, 12 px radius |
| `card-duration` | Time badge on the thumbnail | bottom right |
| `card-body` | Row under the thumbnail | avatar plus text |
| `card-avatar` | Channel picture (`avatar-md`) | not shown on Profile |
| `card-title` | Video title | 16 px, 2 lines max |
| `card-channel` | Channel name | secondary color |
| `card-stats` | "37K views · 3 days ago" | secondary color |

## Home

| Class | What it is | Size / note |
| --- | --- | --- |
| `chips` | Category bar under the header | 56 px high, sticky |
| `chip` | One category button | 32 px high, 8 px radius; 44 px hit area on phones |
| `chip-active` | The selected category | fill `--text`, text `--bg` |

Home = `header` + `guide` + `page` containing `chips` and `video-grid`.

## Watch

| Class | What it is | Size / note |
| --- | --- | --- |
| `watch-layout` | Two columns | |
| `watch-primary` | Left column | player, info, comments |
| `watch-secondary` | Right column | max(402 px, 27.5vw); related videos; below 1000 px it goes under the player |
| `player` | Video area | 16:9 |
| `player-big` | Center play button | 68x48 dark translucent; only before the first play (youtube.com) |
| `player-controls` | Bottom playback controls | translucent pills, no bar; hides 3 s after the last move while playing, or when the mouse leaves while playing |
| `player-progress-row` | Scrub track and time preview | 24 px hit area; 44 px on phones |
| `player-progress` | Playback position slider | keyboard and pointer seek |
| `player-buffered` | Buffered track range | inside progress slider |
| `player-progress-fill` | Played track range | MeTube accent |
| `player-progress-thumb` | Scrub thumb | shown on hover or focus |
| `player-tooltip` | Hover seek time | above progress track |
| `player-button-row` | Playback button row | 48 px high |
| `player-control-group` | Left (play, volume, time) or right (settings, fullscreen) cluster | 8 px gaps |
| `player-button` | Player action button | 40 px round pill (play icon 36 px); 48x40 inside the right pill; 44 px on phones |
| `player-time` | Current and total time | 13 px desktop |
| `player-volume-group` | Mute and volume slider | slider expands on hover |
| `player-volume` | Volume slider | hidden on touch devices |
| `player-volume-fill` | Current volume fill | inside volume slider |
| `player-loading` | Waiting indicator | animated ring |
| `player-error` | Media load error | centered alert |
| `player-left` | Left control cluster for play, volume, and time | Added alongside `player-control-group` as required by the shared context API |
| `player-right` | Right control cluster for installed player modules | Added alongside `player-control-group`; hosts the shared right pill |
| `player-settings-wrap` | Container for the settings gear in the right control group | Inserted before the fullscreen button |
| `player-popup` | Shared player popup marker for one-popup-at-a-time coordination | Added to the settings menu |
| `player-settings-panel` | Current settings menu panel | Main and speed panels replace each other |
| `player-settings-speed` | Playback speed submenu panel | Added alongside `player-settings-panel` |
| `player-settings-row` | Main panel menu item row | 48px minimum height |
| `player-settings-label` | Left-side setting name | Main panel |
| `player-settings-value` | Right-side setting value | Main panel |
| `player-settings-chevron` | Speed row forward chevron | Distinguishes the submenu entry |
| `player-settings-back` | Speed submenu back row | Accessible label is “이전 메뉴로 돌아가기” |
| `player-settings-current` | Large current playback rate | `aria-live="off"` |
| `player-settings-steps` | Group for slower/faster controls | Speed submenu |
| `player-settings-step` | Playback rate decrement/increment button | 44px target; disabled at rate bounds |
| `player-settings-presets` | Preset rate button group | Speed submenu |
| `player-settings-preset` | Playback rate preset chip | Uses `aria-pressed` for the active rate |
| `player-settings-normal` | “보통” label for the 1.0 preset | Nested inside its preset chip |
| `player-bezel` | Centered playback or volume feedback icon | One per player; 78px circle, 36px icon; 64px/32px on phones; hidden from assistive technology. |
| `player-badge` | Brief visual player feedback message | One per player, top-center; visual duplicate is aria-hidden. |
| `player-badge-fading` | Fades the visual feedback message | Removed after the 250ms fade; reduced motion disables the transition. |
| `player-feedback-sr` | Announces feedback text to assistive technology | Visually hidden, shared `role="status"` with polite live updates. |
| `player-tip` | Shared button tooltip | Repositioned and horizontally clamped for its triggering control; does not intercept pointer events. |
| `player-tip-key` | Keyboard shortcut keycap inside a tooltip | Uppercase key label; omitted when no key is provided. |
| `player-autoplay` | Autoplay switch button. | `aria-checked` reflects its state. |
| `player-autoplay-track` | Autoplay switch track. | 36px by 14px track. |
| `player-autoplay-knob` | Autoplay switch knob and state icon. | Moves when enabled. |
| `is-on` | Enabled autoplay state. | Applied to `.player-autoplay`. |
| `player-autoplay-next` | Next-video countdown group. | `role="group"`; hidden until media ends. |
| `player-autoplay-heading` | Next-video overlay heading. | Displays “다음 동영상”. |
| `player-autoplay-title` | Related video title in the overlay. | Read from its `.related-card`. |
| `player-autoplay-progress` | Five-second countdown bar. | Width uses `--progress`. |
| `player-autoplay-actions` | Overlay action button row. | Holds cancel and play-now actions. |
| `player-autoplay-action` | Overlay action button. | 44px minimum height on phones. |
| `player-autoplay-now` | Play-now action emphasis. | Accent background. |
| `player-end` | End screen over the last frame. | `role="group"`; hidden until media ends with autoplay off or cancelled; blurred, dimmed; own size container. |
| `player-end-card` | One related video on the end screen. | Cloned from `.related-card`; 3 cards from 720 px wide, 2 below; 112 px wide on phones. |
| `player-end-title` | Related video title on the end screen. | 16 px, 2 lines; 12 px, 1 line on phones; its link stretches over the whole card. |
| `player-end-meta` | Channel name, then views and age. | `--text-2`; hidden on phones. |
| `player-theater` | Theater mode button. | Hidden at 999px and below. |
| `player-context` | Player context popup menu. | `player-popup`; pointer position uses `--x` and `--y`. |
| `player-context-item` | Context menu action row. | Supports menuitem and menuitemcheckbox. |
| `player-context-check` | Repeat enabled check icon. | Hidden when repeat is off. |
| `watch-theater` | Theater layout state. | Applied to `.watch-layout` above 999px. |
| `player-menu` | Settings menu (also `player-popup`) | 303 px, 48 px rows, main panel and speed submenu |
| `watch-title` | Video title | large |
| `channel-row` | Avatar, name, subs, Subscribe | one line |
| `channel-name` | Channel name | |
| `channel-subs` | "48.3K subscribers" | secondary color |
| `watch-actions` | Like, Share, Save row | |
| `action-button` | One pill in that row | |
| `description-box` | Views, date, description | grey box (`--chip`) |
| `comments-jump` | Jump to comments on narrow screens | 36 px pill; 44 px on phones |
| `comments` | Whole comments block | |
| `comments-count` | "128 Comments" | |
| `comment-form` | Add-comment area | |
| `comment-input` | Text field | |
| `comment-list` | List of comments | |
| `comment` | One comment | |
| `comment-avatar` | Picture (`avatar-md`) | |
| `comment-body` | Text column | |
| `comment-author` | Name | |
| `comment-time` | "2 days ago" | secondary color |
| `comment-text` | The comment | |
| `comment-like` | Like button and count | |
| `related-list` | List in the right column | |
| `related-card` | One row | thumbnail left, text right |
| `related-thumb` | Thumbnail | 16:9; desktop width min(62%, 235 px); title up to 3 lines |
| `related-title` | Title | |
| `related-channel` | Channel name | |
| `related-stats` | Views and age | |

## Shorts

| Class | What it is | Size / note |
| --- | --- | --- |
| `shorts-page` | Shorts main page | zero padding; min-width 0 |
| `shorts-feed` | Scrolling list, one short per screen | height viewport − 56 px; vertical mandatory snap; hidden scrollbar |
| `short-item` | One full-screen short | 8 px top / 32 px bottom padding; snap start and stop |
| `short-stage` | Player, action rail, and optional comments panel | full height; 12 px player-to-rail gap; 24 px before side panel |
| `short-player` | Vertical video or placeholder | 9:16; 12 px radius; full stage height |
| `short-play` | Play/pause control for a real video | 48 px circle; 16 px top/left; scrim background |
| `short-mute` | Sound toggle for a real video | 48 px circle; 16 px top/right; scrim background; one mute state for the whole feed |
| `short-progress` | Seekable progress bar on a real video | range input, 24 px hit area (44 px on phones and touch); 3 px track (5 px on hover/focus); accent fill via `--progress` |
| `short-video` | Video inside the player | absolute fill; object-fit cover |
| `short-status` | Video preparation status pill | 36 px high; 18 px radius; 14 px text |
| `short-overlay` | Text over the bottom of the video | 156 px minimum; 16 px inset and bottom gradient |
| `short-channel` | Channel name and Subscribe row | 8 px gap; vertically centered |
| `short-channel-name` | Channel name | 14 / 20 px, medium; ellipsis |
| `short-title` | Short title | 14 / 20 px; one line with ellipsis |
| `short-actions` | Vertical action rail | 12 px gap; 78 px action pitch |
| `short-action` | Like, dislike, comments, or share button | 48 px circle; 12 / 18 px label |
| `short-action-label` | Text below a rail icon | 12 / 18 px |
| `short-channel-thumb` | Channel avatar at the bottom of the rail | 40 × 40 px; 6 px radius |
| `shorts-nav` | Previous and next controls | fixed at right; 56 px buttons, 16 px gap; hidden at 650 px and below |
| `shorts-nav-btn` | Previous or next Shorts button | 56 × 56 px circle |
| `shorts-comments` | Comments dialog or side panel | desktop side panel full stage height, 480 px wide (shrinks to 360 px minimum; 409 px basis at 1100–1312 px); centered modal maximum height 643 px; phone sheet 70dvh |
| `shorts-comments-head` | Comments title, count, and close button | 57 px high; 16 px horizontal padding |
| `shorts-comments-count` | Comment count | 16 / 22 px; secondary text |

## Profile

| Class | What it is | Size / note |
| --- | --- | --- |
| `banner` | Wide picture at the top | ratio about 6.2 : 1 (1284 px wide = 207 px high, 374 px wide = 60 px high), 16 px radius (8 px on phones) |
| `profile-header` | Avatar and text | |
| `profile-avatar` | Big picture (`avatar-lg`) | 160 px; 120 px at 839 px or less; 72 px at 599 px or less |
| `profile-name` | Channel name | 36 px / 50 px line, bold (24 px / 32 px on phones) |
| `profile-handle` | `@deepfake` | |
| `profile-stats` | Subscribers and video count | secondary color |
| `profile-bio` | Short text | |
| `tabs` | Tab bar | 48 px high, 24 px between tabs, 16 px labels |
| `tab` | One tab | |
| `tab-active` | Current tab | underline 2 px, `--text` color |

Profile (`profile.html?c=<channel id>`, built by `js/profile.js` from `data/videos.json`) = `header` + `guide` + `page` containing `banner`, `profile-header`, `tabs`, and one `tab-panel` per tab (only the selected one is shown).

On Profile the `video-grid` is 3 columns from 1171 px, 2 from 671 to 1170 px, 1 below, with a 32 px row gap (the Home rule above does not apply). The channel-search button next to the tabs is 48 px.

Tabs: Home, Videos, Shorts, Playlists, About. JS switches the panels, so `tab` is a button with `role="tab"`.

| Class | What it is | Size / note |
| --- | --- | --- |
| `profile-wrap` | Width wrapper for the whole profile | steps like youtube.com: 642 px from 671, 856 from 957, 1070 from 1171, back to 856 from 1313 (the wide sidebar takes room), 1070 from 1339, 1284 from 1553; full width below 671 |
| `profile-info` | Text column next to the avatar (name, meta, bio, button) | |
| `profile-meta` | One line: `@handle · subscribers · videos` | holds `profile-handle` and `profile-stats` |
| `tabs-bar` | Full-width sticky strip behind the tabs (draws the divider line across the page) | sticks 56 px from the top; holds one `profile-wrap tabs` |
| `tablist` | Wrapper around the tab buttons (the search icon sits next to it inside `tabs`) | 24 px between tabs |
| `shelf-wrap` | Relative wrapper for a Home shelf and its arrows | |
| `shelf-arrow` | Previous/next control over a Home shelf edge | 40 px circle; hidden on phones |
| `shelf-prev` | Previous shelf control | chevron points left |
| `shelf-next` | Next shelf control | chevron points right |
| `playlist-grid` | Playlists tab: grid of 210 px cards | add next to `video-grid`; 4 px column gap |
| `tab-panel` | Content of one tab | `hidden` on the others |
| `section-heading` | Heading inside a panel ("Latest") | 20 px, bold |
| `shelf` | Home tab: one row that scrolls sideways | cards 210 px wide; `shelf-wide` makes them 354 px, at most 85% of the row |
| `chips-end` | Chip row pushed to the right (Playlists "Sort by") | add next to `chips` |
| `profile-actions` | Row with Subscribe and Community | 8 px gap, buttons 40 px high |
| `button-secondary` | Grey pill button (Community) | fill `--field-btn`, text `--text` |
| `card-menu` | Button that opens the card action menu | 40 px round target (44 px hit area on phones), 24 px icon; hidden until hover on mouse devices, always visible on short tiles |
| `menu` | Shared card action menu | Fixed overlay; max-height calc(100dvh - 16px), scrolls when needed; bottom sheet on phones |
| `menu-item` | One action in the card menu | 36 px high; 48 px on phones |
| `toast` | Action feedback message | Fixed near the bottom of the screen |
| `toast-action` | Optional action in a toast | Accent-colored button |
| `short-grid` | Shorts tab: grid of tiles | add next to `video-grid`; columns at least 200 px, 4 px gap, 2 columns on phones |
| `short-tile` | One short in Home or Profile | Thumbnail is 2:3 with 8 px radius everywhere |
| `playlist-card` | Playlist card | add next to `card`; stacked lines above the thumbnail |
| `about` | About tab text block | max 720 px |

## Not in this list on purpose

Upload, login, settings, live chat, playlists. The site is a mockup.
