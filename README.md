# Genesys Context Bridge (GCB) v1.7.0

Update in v1.7.0:
- Added central Hold auto-resume monitor in `index.html`.
- `holdresume.html` writes a separate local hold record per held interaction using conversationId + agentCommunicationId + customerCommunicationId.
- `index.html` checks local browser storage every 2 seconds only; it does not poll Genesys APIs.
- When a local hold record reaches `maxHoldTime`, `index.html` sends `resumeMessageText` once using the stored `agentCommunicationId`, then marks the record `RESUMED_AUTO`.
- When the agent returns to the original Hold page, `holdresume.html` reads the central status and changes the button back to Hold.

Important limitation:
- This is browser-session based. It works while the Interaction Widget `index.html` remains loaded in the agent browser. It is not a server-side guarantee if the browser closes, machine sleeps, or the widget is unloaded.

Upload the full package to GitHub Pages root, or replace at least:
- `index.html`
- `holdresume.html`
- `js/`

# Genesys Context Bridge (GCB) v1.6.2

Fix in v1.6.2:
- Send Message now sends joined/greeting on the agent/non-external communication ID.
- `customerCommunicationId` is used only for session duplicate key, not for sending outbound messages.
- This fixes Genesys API error: `Bad request: messages may only be sent for non-external communications`.

Upload the full package to GitHub Pages root, or replace at least `js/send-message.js`.

# Genesys Context Bridge (GCB) v1.6.1

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


Fix: Prospects submit no longer fails with `centralStatus is not defined`; central status updates are safely written to the index page.
