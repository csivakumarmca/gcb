# GCB v1.7.2.2 - SendMsg Fast Patch

This package is based on the confirmed working v1.7.2.1 baseline.

## What changed

Only SendMsg behavior was optimized. Hold/Resume and Prospects were not redesigned.

- `js/send-message.js` build changed to `v5.2.2-fast`.
- SendMsg now uses Agent Script URL values directly: `conversationId`, `agentCommunicationId`, `agentParticipantId`, `customerCommunicationId`, and `agentName`.
- Removed upfront conversation resolver calls before sending.
- Removed remote duplicate reservation checks before sending.
- Keeps local browser duplicate lock/done key to prevent duplicate sends caused by multiple `sendmsg.html` loads.
- Updates participant attributes after successful send.
- Retries only when the actual POST send fails because the communication may not be ready.
- Retry settings: 3 attempts, 1 second delay.

## Keep CommonParams

Use the old full CommonParams:

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

## Cache version

Use a new cache value such as `v=17222`.

## Important

This package does not change the central hold monitor design. It only reduces Send Greeting delay by sending first and retrying only on send failure.
