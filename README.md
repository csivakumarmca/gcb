# AFT Genesys Context Bridge (AFT GCB)

- AFT GCB: `v1.0.0`
- ChatMonitor UI: `v1.0.0`
- Prospects: `Prospects_v1.0.0`
- Cache: `100000`
- Environment: `PRODUCTION`
- Release track: `PROD`
- Source baseline: `v1.7.2.95-participant-data-only`

## Prospect Value Source

Prospect values are supplied only through these Architect-prepared participant attributes:

- `SI_Prospect_InteractionTypeListJson`
- `SI_Prospect_ContactReasonListJson`
- `SI_Prospect_InteractionOutcomeListJson`

The browser contains no direct source-table read API, no obsolete source identifiers, and no fallback implementation.

## Protected Logic

Message sending, Joined/Greeting behavior, transfers, supervisor handling, duplicate control, Hold/Resume counting and timers, Prospect submission, and wrap-up assignment are unchanged.
