# GCB v1.7.5 - Script-first communication resolver

This package keeps the v1.7.4 clean/hybrid URL approach but updates the communication resolver.

## Important Agent Script CommonParams

Use the hybrid CommonParams again:

```javascript
AFT_URL_GCB_CommonParams =
"&conversationId=" + {{Scripter.Interaction ID}} +
"&communicationId=" + {{Scripter.Agent Communication ID}} +
"&agentCommunicationId=" + {{Scripter.Agent Communication ID}} +
"&participantId=" + {{Scripter.Agent Participant ID}} +
"&agentParticipantId=" + {{Scripter.Agent Participant ID}} +
"&customerCommunicationId=" + {{Scripter.Customer Communication ID}} +
"&agentName=" + {{Scripter.Agent Name}}
```

Do not pass `source`; the app defaults to AgentScript internally.

## URL cache

Use a new cache value, for example:

```text
v=175
```

## Resolver change

Previous v1.7.4 required the conversation payload to prove that the connected communication is owned by the logged-in user. In Genesys message conversation payloads this ownership is not always exposed clearly, so it blocked valid Agent Script communication IDs.

v1.7.5 now:

1. Uses Agent Script `agentCommunicationId` / `agentParticipantId` first.
2. Validates that the communication exists in the conversation under an agent-like participant and is connected.
3. Falls back to logged-in user owned connected communication search if script values are missing.
4. Lets the final Genesys send API return any real owner/connected error if the script value is stale.

Replace the full package in the GitHub/root hosting folder.
