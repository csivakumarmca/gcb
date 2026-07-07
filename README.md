# GCB Generic v1.7.2.13 - HoldResume Local Summary Fix


Changes:
- Updated `holdtimer.html` so completed Resume records are not displayed as active hold.
- Updated `holdresume.html` so after successful Resume, the active hold record is removed from localStorage.
- Timer now resets to `No active hold 00:00` after Resume, even if it previously showed `Time limit reached 00:30`.
- Existing hold count, Hold/Resume messages, max hold time, and compact timer design remain unchanged.

Cache version: `v=172211`


## v1.7.2.12
- Updated holdresume.html to remove visible empty grey space below Hold History Details.
- Body/page background is now transparent and bottom note hidden to avoid unused screen area when embedded in Agent Script.
- No Hold/Resume/Refresh button changes; externalAction behavior remains the same.

## v1.7.2.13 changes
- Fixed Hold Info details showing zero/stale values after Agent Script external Hold/Resume action.
- After Hold, the Current Session Hold Count is updated locally immediately.
- After Resume, the local completed hold segment is applied immediately while Genesys transcript refresh catches up.
- Retry refresh preserves local values if Genesys transcript is delayed.
- Hold/Refresh buttons remain removed from the HTML page.
