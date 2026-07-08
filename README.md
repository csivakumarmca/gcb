# GCB v1.7.2.24 - HoldTimer Visible Blink Fix

# GCB v1.7.2.24 - HoldTimer Blink Defaults

This package keeps the latest action split:

- `holdtimer.html` is the Hold/Resume action processor, timer widget, sound/browser notification owner, and timer-box blink/highlight owner.
- `holdresume.html` is the Agent Hold Summary/details page with long visual alert/banner only.

## Key changes in v1.7.2.24

- Added blink/highlight on `holdtimer.html` when max hold time is reached.
- Sound, browser notification, taskbar/title blink, notification auto-close, alert blink duration, and sound duration are now defaults inside `holdtimer.html`.
- Agent Script no longer needs to pass sound/notification/blink-duration parameters to `holdtimer.html`.
- Keep passing only functional parameters: messages, maxHoldAttempts, maxHoldTime, autoResumeEnabled, compact, externalAction, requestId.

## Cache version

Use `v=172224`.

## Final HoldTimer Base URL

```javascript
AFT_URL_HoldTimer_Base_URL =
{{AFT_URL_GCB_Root_URL}} +
"holdtimer.html?" +
"v=" + {{AFT_GCB_Version}} +
{{AFT_URL_GCB_Common_Params}} +
"&holdMessageText=Gen-Hold-32" +
"&resumeMessageText=Gen-Resume-33" +
"&maxHoldAttempts=3" +
"&maxHoldTime=30" +
"&autoResumeEnabled=false" +
"&compact=true"
```

## Initial timer page URL

```javascript
AFT_URL_HoldTimer_Page_URL =
{{AFT_URL_HoldTimer_Base_URL}} +
"&externalAction=NONE"
```

## Hold click

```javascript
AFT_URL_HoldTimer_Page_URL =
{{AFT_URL_HoldTimer_Base_URL}} +
"&externalAction=HOLD" +
"&requestId=" + {{Scripter.Interaction ID}} + "-HOLD-" + {{Scripter.Agent Communication ID}} + "-" + {{Scripter.Agent Call Duration}}
```

## Resume click

```javascript
AFT_URL_HoldTimer_Page_URL =
{{AFT_URL_HoldTimer_Base_URL}} +
"&externalAction=RESUME" +
"&requestId=" + {{Scripter.Interaction ID}} + "-RESUME-" + {{Scripter.Agent Communication ID}} + "-" + {{Scripter.Agent Call Duration}}
```


## v1.7.2.24
- Fixed holdtimer blinking issue: repeated render was removing the blinking CSS class immediately after Time limit reached.
- Cache version: v=172224


## v1.7.2.24 change
- holdtimer.html: made Time limit reached blink clearly by animating timer widget border/background and label/time text.
- No Agent Script URL parameter change except cache version v=172224.


## v1.7.2.24 update
- holdtimer.html Time limit reached blink/highlight now continues until Resume clears the active hold record.
- No new query parameters required.
- Use cache version v=172224.
