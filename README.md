# GCB v1.7.2.11 - Hold Timer Resume Reset Fix

Changes:
- Updated `holdtimer.html` so completed Resume records are not displayed as active hold.
- Updated `holdresume.html` so after successful Resume, the active hold record is removed from localStorage.
- Timer now resets to `No active hold 00:00` after Resume, even if it previously showed `Time limit reached 00:30`.
- Existing hold count, Hold/Resume messages, max hold time, and compact timer design remain unchanged.

Cache version: `v=172211`
