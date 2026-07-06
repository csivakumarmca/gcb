# GCB Generic v1.7.4 - Clean Common Params + Owned Communication Resolve

## Key change
Agent Script CommonParams can now be simplified. The application resolves the connected communication owned by the logged-in Genesys user using existing Genesys APIs.

Recommended CommonParams:

```javascript
AFT_URL_GCB_CommonParams =
  "&conversationId=" + {{Scripter.Interaction ID}}
```

`source=AgentScript` is no longer required in CommonParams. The pages default `source` to `AgentScript`. You may still pass it from URL if needed for debug.

## Parameters no longer required in CommonParams

- communicationId
- agentCommunicationId
- participantId
- agentParticipantId
- customerCommunicationId
- agentName
- source

## Still required in module URLs

### sendmsg.html
- action
- requestType
- greetingEnabled
- joinedMessageText
- messageText
- customerName / subject / language if used by template
- requestId / reload if used by Agent Script trigger

### holdresume.html
- holdMessageText
- resumeMessageText
- maxHoldAttempts
- maxHoldTime
- hold alert settings

### prospects.html
- version and optional data table / wrap-up config

## API usage
The pages reuse existing Genesys API calls:

- GET /api/v2/users/me?expand=authorization
- GET /api/v2/conversations/messages/{conversationId}

These calls are used to resolve the correct connected agent communication for the logged-in browser/session. This avoids stale communication errors such as:

- User is not an owner of this communication
- Messages may only be sent for connected communications

## Upload
Upload the full package to GitHub/root hosting:

- index.html
- sendmsg.html
- holdresume.html
- prospects.html
- js/
- README.md
