# GCB Generic v1.7.2.14 - HoldResume visible timer sync fix

## Change
Fixed the visible Hold Info page (`holdresume.html`) timer indicator when Hold/Resume is triggered from the Agent Script button.

## Issue fixed
When the Agent Script button sent `externalAction=HOLD`, the separate `holdtimer.html` widget started correctly, but the already-open Hold Info page kept showing `Hold Timer Indicator 00:00 / Timer not active`.

## Fix
- `holdresume.html` now listens/polls the shared central hold record.
- If another iframe/action instance starts HOLD, the visible Hold Info page adopts that active hold timer.
- The Hold Info timer indicator and current active hold elapsed time now run immediately.
- After RESUME, the visible Hold Info page resets back to Timer not active.

## Minimum file to replace
- `holdresume.html`

## Cache version
Use `v=172214` for the Hold Info URL.
