# GCB v1.7.2.3 - Manual Hold Alert + Timer Widget

This package is based on the confirmed working **v1.7.2.2 SendMsg Fast** baseline.

## What is kept unchanged

- SendMsg fast behavior is retained (`v5.2.2-fast`).
- SendMsg uses Agent Script URL values directly.
- SendMsg duplicate guard remains enabled.
- Prospects page remains unchanged.
- Full CommonParams must remain unchanged.

## What changed in this package

### 1. Auto Resume is now configurable

New Hold URL parameter:

```text
&autoResumeEnabled=false
```

When `autoResumeEnabled=false`:

- Hold sends `Gen-Hold-32`.
- Timer starts and continues.
- When `maxHoldTime` is reached, **no automatic `Gen-Resume-33` is sent**.
- Agent-side alert/notification is shown.
- Agent must manually click **Resume**.

When `autoResumeEnabled=true`:

- Old central/local auto-resume behavior can be enabled again.

### 2. Agent-side alert when hold time is exceeded

When max hold time is reached with manual resume mode:

```text
Maximum hold duration reached. Please click Resume to continue the chat.
```

The alert is shown as:

- In-page persistent warning
- Browser notification if permission is granted
- Title blink / visual attention
- Beep best-effort if browser allows audio

### 3. New holdtimer.html page

New file:

```text
holdtimer.html
```

Purpose:

- Timer-only display widget for Summary / Product / Prospects or other script tabs.
- No Hold/Resume button.
- No summary cards/history.
- Reads active hold state from localStorage.
- Shows active hold timer and exceeded warning.

Recommended URL:

```javascript
AFT_URL_HoldTimer =
{{AFT_URL_GCB_RootURL}} +
"holdtimer.html?" +
"v=17223" +
{{AFT_URL_GCB_CommonParams}} +
"&maxHoldTime=30" +
"&browserNotificationEnabled=true"
```

## Recommended Hold URL

```javascript
AFT_URL_HoldResume =
{{AFT_URL_GCB_RootURL}} +
"holdresume.html?" +
"v=17223" +
{{AFT_URL_GCB_CommonParams}} +
"&holdMessageText=Gen-Hold-32" +
"&resumeMessageText=Gen-Resume-33" +
"&maxHoldAttempts=3" +
"&maxHoldTime=30" +
"&autoResumeEnabled=false" +
"&isCustomerBasedHoldCalculation=false" +
"&alertBlinkEnabled=true" +
"&alertSoundEnabled=true" +
"&alertBlinkDurationMs=15000" +
"&titleBlinkDurationMs=30000" +
"&alertSoundRepeatCount=1" +
"&alertSoundDurationMs=600" +
"&alertSoundGapMs=250" +
"&browserNotificationEnabled=true" +
"&taskbarBlinkEnabled=true" +
"&requestNotificationPermissionOnHold=true" +
"&notificationAutoCloseMs=12000"
```

## CommonParams - keep full old values

```javascript
AFT_URL_GCB_CommonParams =
"&conversationId=" + {{Scripter.Interaction ID}} +
"&communicationId=" + {{Scripter.Agent Communication ID}} +
"&agentCommunicationId=" + {{Scripter.Agent Communication ID}} +
"&participantId=" + {{Scripter.Agent Participant ID}} +
"&agentParticipantId=" + {{Scripter.Agent Participant ID}} +
"&customerCommunicationId=" + {{Scripter.Customer Communication ID}} +
"&agentName=" + {{Scripter.Agent Name}} +
"&source=AgentScript"
```

## Files in this package

- `index.html` - GCB central status page and central hold monitor. Auto-resume now respects `autoResumeEnabled`.
- `sendmsg.html` - unchanged fast SendMsg page.
- `holdresume.html` - main Hold/Resume control page with configurable auto-resume and manual alert.
- `holdtimer.html` - new timer-only page for other tabs.
- `prospects.html` - unchanged Prospects page.
- `README.md` - this file.

## Cache version

Use a fresh cache version:

```text
v=17223
```


## v1.7.2.4 Update
- Updated `holdtimer.html` only.
- Timer-only widget now freezes at `maxHoldTime` after the limit is reached instead of continuing to count upward.
- Added optional `compact=true` URL parameter for smaller timer display on Summary/Product/Prospects tabs.
- Manual Resume behavior remains unchanged. No automatic Resume is sent when `autoResumeEnabled=false`.

Recommended timer-only URL:
```javascript
AFT_URL_HoldTimer =
{{AFT_URL_GCB_RootURL}} +
"holdtimer.html?" +
"v=17224" +
{{AFT_URL_GCB_CommonParams}} +
"&maxHoldTime=30" +
"&browserNotificationEnabled=true" +
"&compact=true"
```


## v1.7.2.5 - Hold Timer Micro Layout + Freeze Fix
- Updated `holdtimer.html` only.
- `compact=true` now uses a one-line micro timer layout suitable for 35-38 px Agent Script web page height.
- The title is next to the timer/progress bar.
- When max hold time is reached, timer freezes at `maxHoldTime` and shows `Hold limit reached`.
- No SendMsg, Prospects, or Hold/Resume control logic changes.
- Recommended cache: `v=17225`.
