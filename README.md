# GCB Generic v1.7.2.16 - HoldResume Elapsed Timer Sync

Changes:
- Updated holdresume.html timer indicator to match holdtimer.html behavior.
- Hold Info timer now shows elapsed time increasing from 00:00 to maxHoldTime.
- At maxHoldTime, Hold Info timer freezes at max value, e.g. 00:30.
- Removed countdown display inside holdresume.html so it no longer shows 00:19 while holdtimer.html shows 00:11.
- No change to Hold/Resume send logic.
- No change to holdtimer.html.

Cache version: v=172215

Minimum file to replace:
- holdresume.html


## v1.7.2.16
- holdresume.html: replaced duplicate Hold Timer Indicator card with Recent Hold Segments.
- Reuses existing current session hold segment/history logic.
- No change to Hold/Resume send logic or holdtimer.html.
- Cache version: v=172216.
