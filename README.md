# GCB v1.7.2.8 - HoldResume External Action Patch

Baseline: v1.7.2.7 HoldTimer compact width 200.

## What changed

Only `holdresume.html` was changed.

New parameters:

- `displayActionButton=false`
  - Hides the internal Hold/Resume button inside `holdresume.html`.
  - The page still displays all existing Hold Info details, summary, timer, history, alerts, and validation.

- `externalAction=HOLD|RESUME|NONE`
  - Allows the Agent Script page button to trigger Hold or Resume action through the same `holdresume.html` page.
  - `externalAction=NONE` keeps the page as display/details only.

- `requestId=<unique id>`
  - Used as a duplicate guard for external actions.
  - If the same external action URL is loaded more than once, the action is not repeated for the same requestId.

## Behavior

- `externalAction=HOLD`
  - Validates max hold attempts first.
  - If limit is reached, Gen-Hold-32 is not sent.
  - If allowed, sends Gen-Hold-32, starts timer, saves local hold record, and updates summary.

- `externalAction=RESUME`
  - Sends Gen-Resume-33, stops timer, updates local hold record, and refreshes summary.

- Resume remains allowed even if maximum hold count has already been reached.
- Auto-resume is still controlled by `autoResumeEnabled`; business current setting should be `autoResumeEnabled=false`.
- SendMsg and Prospects are unchanged.

## Recommended URLs

Hold Info page only:

```javascript
AFT_URL_HoldResume =
{{AFT_URL_GCB_RootURL}} +
"holdresume.html?" +
"v=17228" +
{{AFT_URL_GCB_CommonParams}} +
"&holdMessageText=Gen-Hold-32" +
"&resumeMessageText=Gen-Resume-33" +
"&maxHoldAttempts=3" +
"&maxHoldTime=30" +
"&autoResumeEnabled=false" +
"&displayActionButton=false" +
"&externalAction=NONE" +
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

Agent Script Hold action:

```javascript
AFT_URL_HoldResume_Action =
{{AFT_URL_GCB_RootURL}} +
"holdresume.html?" +
"v=17228" +
{{AFT_URL_GCB_CommonParams}} +
"&holdMessageText=Gen-Hold-32" +
"&resumeMessageText=Gen-Resume-33" +
"&maxHoldAttempts=3" +
"&maxHoldTime=30" +
"&autoResumeEnabled=false" +
"&displayActionButton=false" +
"&externalAction=HOLD" +
"&requestId=" + {{Scripter.Interaction ID}} + "-HOLD-" + {{Scripter.Agent Communication ID}} + "-" + {{Scripter.Agent Call Duration}}
```

Agent Script Resume action:

```javascript
AFT_URL_HoldResume_Action =
{{AFT_URL_GCB_RootURL}} +
"holdresume.html?" +
"v=17228" +
{{AFT_URL_GCB_CommonParams}} +
"&holdMessageText=Gen-Hold-32" +
"&resumeMessageText=Gen-Resume-33" +
"&maxHoldAttempts=3" +
"&maxHoldTime=30" +
"&autoResumeEnabled=false" +
"&displayActionButton=false" +
"&externalAction=RESUME" +
"&requestId=" + {{Scripter.Interaction ID}} + "-RESUME-" + {{Scripter.Agent Communication ID}} + "-" + {{Scripter.Agent Call Duration}}
```
