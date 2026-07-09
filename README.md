<!--
  Author: Sivakumar Chandrahasu | Created: 2026-07-07 | Updated: 2026-07-07
  Purpose: Package notes for the current GCB build and deployment model.
           Documents direct page auth fallback, ChatMonitor replacement, and recommended URLs.
-->
# RAKBANK Genesys Context Bridge (GCB)

Updated package: v1.7.2.26-banner-style

## Main changes

- Removed SendMsg page and related files:
  - sendmsg.html
  - js/send-message.js
  - css/send-message.css
- Added Chat Monitor as package page:
  - chatmonitor.html
  - js/chatmonitor.js
  - css/chatmonitor.css
- index.html is now the common OAuth/MFA callback and router page.
- Router mode is now silent/compact for page=holdresume, page=holdtimer, page=prospects, and page=chatmonitor, so the full GCB dashboard is not shown before the target page opens.
- Shared OAuth uses index.html as the redirect URI, then restores the original target page.

- Improved ChatMonitor support/admin dashboard:
  - OAuth, WebSocket, subscription, loaded-from/router, last conversation, last sent, last skip reason, and last error summary cards.
  - Raw log filters for All / OK / WARN / ERROR / SENT / SKIPPED.
  - Log count summary to make support checks easier without browser developer tools.

## Recommended Genesys URLs

Use the same index.html URL for OAuth, Client App and Interaction Widget routing:

```text
index.html?page=chatmonitor&clientId=<OAuthClientId>&region=mypurecloud.ie&source=ClientApp
index.html?page=holdresume&clientId=<OAuthClientId>&region=mypurecloud.ie
index.html?page=holdtimer&clientId=<OAuthClientId>&region=mypurecloud.ie
index.html?page=prospects&clientId=<OAuthClientId>&region=mypurecloud.ie
```

## Pages

- index.html - OAuth/MFA and routing only
- chatmonitor.html - AFT GCB Conversation Monitor
- holdresume.html - Hold/Resume page
- holdtimer.html - Hold Timer page
- prospects.html - Prospects page



## v1.7.2.24 direct auth fallback update
- Client App should use `index.html?page=chatmonitor`.
- Agent Script visible pages should call `holdresume.html`, `holdtimer.html`, and `prospects.html` directly to avoid router flicker.
- If a direct page does not find a valid OAuth token, it shows a small status message and starts OAuth/MFA using `index.html` as the single callback.
- After OAuth/MFA, `index.html` restores the original direct page URL automatically.


## v1.7.2.25 file header update

- Added short author, created date, updated date, and purpose comments to HTML, JS, CSS, and README files.
- Date used in all file headers: 2026-07-07.
- No functional behavior changed from v1.7.2.24 direct auth fallback.
