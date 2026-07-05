# Genesys Context Bridge (GCB) v1.6

This package keeps business pages clean and moves the visible debug/status view to `index.html`.

## Visible debug/status

`index.html` shows only four standard status lines:

1. OAuth - success/failed with reason
2. Send Greeting - success/failed with reason
3. Hold / Resume - success/failed with reason
4. Prospects - success/failed with reason

Detailed logs are hidden by default and can be opened using **Show details**.

## Pages

- `index.html` - landing, OAuth health-check, central status/debug
- `sendmsg.html` - background processor for joined/greeting messages
- `holdresume.html` - Hold/Resume page
- `prospects.html` - Prospects wrap-up page

## Debug behavior

Module pages silently write logs/status to browser localStorage using `js/gcb-debug.js`.
Visible module debug panels are disabled by default. Use `pageDebug=true` only if a visible debug panel is needed on a module page.

For the Interaction Widget landing page, use:

```text
https://<host>/gcb/index.html?langTag={{gcLangTag}}&gcTargetEnv={{gcTargetEnv}}&gcHostOrigin={{gcHostOrigin}}&conversationId={{gcConversationId}}&usePopupAuth={{gcUsePopupAuth}}&clientId=<clientId>&region=mypurecloud.ie
```
