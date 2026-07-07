# GCB Generic v1.7.2.10 - HoldResume External Action Details Refresh + No Buttons

Changed file: `holdresume.html`

Changes:
- Removed visible Hold and Refresh buttons from Hold Info page.
- Agent Script should trigger Hold/Resume using `externalAction=HOLD` or `externalAction=RESUME`.
- Hold Info page continues to show the full summary/details screen.
- Fixed details not refreshing when an OAuth token exists but `clientId` is not passed in the HoldResume URL.
- After Hold/Resume action, the page retries refreshing details and falls back to cached/local values instead of blocking the screen.
- Existing max hold attempts validation remains in `holdresume.html`.

Recommended cache version: `v=17229`


## v1.7.2.10
- Updated holdtimer compact alert text from "Hold limit reached" to "Time limit reached".
- Increased compact timer height from 34px to 36px.
- Kept compact width at 200px and freeze behavior at maxHoldTime.
