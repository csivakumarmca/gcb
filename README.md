# GCB Generic v1.7.2.18 - Final Merged HoldResume Package

This package consolidates the latest working GCB HTML files for RAKBANK testing.

## Files included

- `index.html`
- `sendmsg.html`
- `holdresume.html`
- `holdtimer.html`
- `prospects.html`

## Main confirmed behavior

### Send Message
- Uses the fast direct send logic from v5.2.2-fast.
- Uses full Agent Script common parameters.
- Uses duplicate request protection through `requestId`.

### HoldResume merged page
- `holdresume.html` is now the single visible Hold Summary page.
- It supports merged mode:
  - `externalAction=NONE` → display summary only.
  - `externalAction=HOLD` → send `Gen-Hold-32`, start local active hold, refresh/show active summary.
  - `externalAction=RESUME` → send `Gen-Resume-33`, close active hold, calculate/show completed summary.
  - Duplicate `requestId` → skip duplicate send and refresh/display summary only.
- Duplicate Hold/Refresh buttons inside HTML are removed/hidden using `displayActionButton=false`.
- Duplicate internal timer card was replaced by Recent Hold Segments.
- Sound, browser notification, and taskbar/title alert are not owned by `holdresume.html`.
- `holdresume.html` keeps visual alert/banner and blink only.

### HoldTimer
- `holdtimer.html` is the alert owner.
- Shows compact 200px timer.
- Shows elapsed time increasing from `00:00` to `maxHoldTime`.
- Freezes at `maxHoldTime`, for example `00:30`.
- Resets to `No active hold 00:00` after Resume.
- Handles sound/browser/taskbar notification based on URL parameters.

## Recommended cache version

Use `v=172218` for all pages after upload.

## Important Agent Script variable rule

Dynamic/Base URL variables can be dynamic values. Page URL variables that are changed by button click must be normal String variables.

Recommended pattern:

- `AFT_URL_*_Base_URL` → Dynamic Value.
- `AFT_URL_*_Page_URL` → normal String variable if the action updates it.
- Web Page source should use page-specific variables, not a shared `dynamicPageURL1`.

## Final Web Page source mapping

- SendMessage component → `{{AFT_URL_SendMessage_Page_URL}}`
- Hold Summary component → `{{AFT_URL_HoldResume_Page_URL}}`
- Hold Timer small widget → `{{AFT_URL_HoldTimer_Page_URL}}`
- Prospects component → `{{AFT_URL_Prospects_Page_URL}}`

Do not reuse one common variable such as `dynamicPageURL1` across multiple web page components.
