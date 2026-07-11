<!--
  Author: Sivakumar Chandrahasu | Created: 2026-07-07 | Updated: 2026-07-07
  Purpose: Package notes for the current GCB build and deployment model.
           Documents direct page auth fallback, ChatMonitor replacement, and recommended URLs.
-->
# RAKBANK Genesys Context Bridge (GCB)

Updated package: v1.7.2.30-participant-status

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


## v1.7.2.30 participant-config status update

GCB now reads configuration from participant data populated by CM/Architect from PROD_AFT_GCB_Config.

Applied participant attributes include:
- Hold/Resume message, limits, alert/sound/notification settings, and EN/AR labels.
- Prospects Data Table IDs, separators, multi-select flag, and wrap-up create flag.
- ChatMonitor support/admin role lists, supervisor keyword, and EN/AR joined/greeting messages.

GCB does not call the config Data Table directly; CM/Architect remains responsible for reading the table and setting participant data.


Banner layout switch (ChatMonitor)
- Query parameter: bannerLayout=light or bannerLayout=dark
- Alternate accepted query parameter: bannerTheme=dark or bannerTheme=light
- Participant attribute fallback: AFT_GCB_BannerLayout = dark or light
- Priority: query parameter first, then participant attribute, then default light.


ChatMonitor banner default update - v1.7.2.33
- Default banner layout is light.
- Use bannerLayout=dark only when dark preview is required.
- Header compact sizing: min-height 50px, logo 40x40px, logo padding 0.


Transfer leg resolver - v1.7.2.47-safe-ui-diagnostics
- Re-reads the full messaging conversation when a transfer notification arrives before the new agent communication ID.
- Selects only the logged-in user's latest agent participant and connected web messaging leg.
- Does not fall back to another agent participant.


## Transfer agent greeting - v1.7.2.47-safe-ui-diagnostics
- For a non-supervisor Agent 2 transfer, sends Agent Joined followed by Greeting.
- Keeps transfer-leg resolver and communication-leg duplicate keys unchanged.
- Supervisor transfers continue to send Supervisor Joined only.


## v1.7.2.47 Safe Enhancements
- Preserves the confirmed v1.7.2.45 Agent 1/Agent 2 joined and greeting transfer logic.
- Renames Chat Monitor status label to SendMessage.
- Uses User Role label.
- Removes duplicate index card title.
- Adds copy/download diagnostics with concise, masked Agent View output.
- Adds index download fallback.
- Adds OAuth/MFA refresh-safe PKCE callback handling.


## v1.7.2.48 Index Support Health
- Removed the misleading SendMessage status row from index.html.
- Added Runtime Parameters availability, Last API, and Last Error rows.
- Added Environment, Source, page-load time, User Role, and shortened User ID metadata.
- Copy/Download details now produce a support-focused index diagnostic report without OAuth secrets or customer personal/banking data.
- ChatMonitor Agent 1 / Agent 2 joined and greeting send/transfer logic is unchanged from the confirmed v1.7.2.47 baseline.


## v1.7.2.49 Support Agent Participant
- Replaced the Support View Role column with Agent Participant.
- Shows shortened agent participant ID and current state for easier transfer troubleshooting.
- Full participant ID is available as hover text.
- No changes to Agent 1 / Agent 2 joined, greeting, transfer, duplicate-control, OAuth, Hold/Resume, or Prospects logic.
