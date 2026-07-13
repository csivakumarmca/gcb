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


## v1.7.2.50 index layout cleanup
- Removed the misleading Runtime Parameters row from index.html because page-specific runtime IDs are passed directly to Prospects and Hold/Resume pages.
- Shortened Last API and Last Error values in the narrow status panel while retaining full values in copied/downloaded diagnostics.
- Improved text wrapping to prevent overlap in narrow Genesys interaction-widget layouts.
- ChatMonitor send, greeting, and transfer logic is unchanged.


## v1.7.2.52 post-MFA active interaction recovery
- Preserves the confirmed notification-driven Agent 1 / Agent 2 transfer and duplicate-control core.
- Interaction index pages publish recent conversation IDs to same-origin localStorage.
- After ChatMonitor OAuth/MFA completion and notification subscription, it performs a one-time fetch of recent active interaction conversations and passes valid connected snapshots into the existing processing function.
- Adds clipboard legacy fallback and stronger index diagnostic download fallback.


## v1.7.2.53 supervisor transfer greeting
- Transfer to a user with a Supervisor role now sends SUPERVISOR_JOINED first and GREETING second when configured.
- Initial Agent 1 and non-supervisor Agent 2 joined/greeting behavior is unchanged.
- Transfer detection, communication-leg resolution, duplicate-control, post-MFA recovery, Hold/Resume, Prospects, and diagnostics are unchanged.


## v1.7.2.54 configurable supervisor greeting

- Added optional participant attribute `AFT_GCB_SendGreetingForSupervisor`.
- `true`: supervisor transfer sends `SUPERVISOR_JOINED` followed by `GREETING` when the greeting text is configured.
- `false` or missing/invalid: supervisor transfer sends only `SUPERVISOR_JOINED`.
- Default is `false` to avoid an unexpected greeting when the Data Table/participant mapping has not yet been deployed.
- No changes were made to initial Agent 1, non-supervisor transfer, communication-leg resolution, duplicate-control, Hold/Resume, Prospects, OAuth/MFA, or diagnostic behavior.


## v1.7.2.55 configurable transfer greetings

- Added optional `AFT_GCB_AgentTransferGreetingText`.
- Added optional `AFT_GCB_SupervisorTransferGreetingText`.
- Initial chats continue to use `AFT_GCB_GreetingText` / language-specific greeting values.
- Agent transfers use `AFT_GCB_AgentTransferGreetingText`; when blank or missing, the existing initial Greeting is used.
- Supervisor transfers use `AFT_GCB_SupervisorTransferGreetingText` when `AFT_GCB_SendGreetingForSupervisor=true`; when blank or missing, the existing initial Greeting is used.
- `AGENT_JOINED` and `SUPERVISOR_JOINED` text and website-dependent behavior are unchanged.

## v1.7.2.56 language-specific customer messages

- Customer-facing joined and greeting messages use only `_EN` / `_AR` attributes.
- Initial greeting: `AFT_GCB_GreetingText_EN` / `_AR`.
- Agent and supervisor transfers: `AFT_GCB_TransferGreetingText_EN` / `_AR`.
- Architect selects with-subject versus without-subject templates and writes the final formatted values.
- Agent-screen hold alert text uses one common attribute per message.

## v1.7.2.57 participant-config status fix

- GCB Participant Config Status now shows exactly the 42 participant attributes populated from `PROD_AFT_GCB_Config`.
- Removed unrelated optional/runtime-only attributes from the status table.
- Summary now displays `Data Table Participant Config: x/42 OK`.
- Added a cache-buster to `chatmonitor.js`.
- No greeting, joined-message, transfer, duplicate-control, or send logic was changed.

## v1.7.2.58 hold-attempt default fix

- Hold Summary no longer reads `maxHoldAttempts` from the URL.
- Hold Summary uses fixed fallback `3` for display/local protection.
- Agent Script remains the source of truth for maximum hold-attempt enforcement.
- No ChatMonitor greeting, transfer, duplicate-control, or send logic changed.

## v1.7.2.59 participant configuration alignment

The active HTML pages now read business configuration directly from participant attributes populated by Architect.

### Hold Summary / Hold Timer
- Read Hold/Resume message text, maximum hold time, auto-resume, hold-calculation mode, alert settings, and agent alert labels from `AFT_GCB_*` participant attributes.
- URL business settings no longer override Data Table configuration.
- Hold Summary maximum-attempt display remains fixed at `3`, as requested; the Agent Script owns the actual max-attempt validation.
- Hold Timer compact layout now defaults to enabled.
- Browser notification title/body and repeated alert sound now use Data Table values.

### Prospects
- Read Data Table IDs, multi-select mode, separators, and create-wrap-up behavior from participant attributes.
- `AFT_GCB_CreateWrapupIfMissing=false` is now honored by the active page.

## v1.7.2.60 hold rate-limit and resume fix

- Prevents overlapping Hold Summary refreshes.
- Caches message details during the page session.
- Fetches full/current-session transcript details only once per unique message.
- Stops the remaining message-detail loop immediately after HTTP 429 and honors a cooldown.
- Storage/Broadcast timer events update local timer state only; they no longer trigger a full transcript reload.
- After-action summary refresh retries reduced to two.
- Resume immediately clears widget blinking and browser-title blinking.
- No ChatMonitor greeting, transfer, or duplicate-control logic changed.
