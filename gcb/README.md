# Genesys Context Bridge (GCB)

Updated shared-auth package with simplified module HTML file names.

## Entry page

`index.html` is the single entry/router page.

Behavior:

- Runs shared OAuth / MFA recovery check.
- Validates Genesys access with a safe `/api/v2/users/me` call.
- Does **not** execute any business action when no module is provided.
- Does **not** default to any business module.
- Shows a safe landing / health-check page when opened directly.

## Modules

Use the `module` query parameter:

- `index.html?module=sendmsg` → Greeting / joined message processor
- `index.html?module=holdresume` → Hold / Resume page
- `index.html?module=prospects` → Prospects wrap-up page

## Shared JavaScript

- `js/gcb-common.js` - common utilities
- `js/gcb-auth.js` - shared OAuth / PKCE / MFA recovery logic
- `js/genesys-api.js` - shared Genesys API helpers
- `js/send-message.js` - Send Message module logic

## Send Message

`sendmsg.html` is greeting-only and uses shared OAuth/API files.

Duplicate greeting guard key:

`conversationId-GREETING-customerCommunicationId-agentParticipantId-agentCommunicationId`

Hold/Resume logic is not present in `sendmsg.html`.

## Backward compatibility

The router supports both old and new module names:

- `module=sendmsg`, `module=send-message`, `module=sendmessage`, `module=message`, `module=greeting` → `sendmsg.html`
- `module=holdresume`, `module=hold-resume`, `module=hold` → `holdresume.html`
- `module=prospects`, `module=prospect` → `prospects.html`
