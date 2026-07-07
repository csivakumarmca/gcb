# GCB v1.7.2.19 - Feedback Fixes

This package is based on v1.7.2.18 and includes the latest merged HoldResume design plus the following fixes:

1. `index.html`
   - Build label updated from v1.7.2.3 to v1.7.2.19.
   - Central hold monitor now ignores hold records from other conversations.
   - Prevents a new chat from showing an old `Maximum hold duration reached` Hold/Resume status.

2. `holdtimer.html`
   - Timer display changed from elapsed count-up to countdown.
   - Shows `00:30 -> 00:00` when `maxHoldTime=30`.
   - At max time, shows `Time limit reached` and stays at `00:00`.
   - Sound, browser notification, and title/taskbar attention remain owned by this page.

3. `holdresume.html`
   - On Resume, duration warning blink is cleared.
   - Count-limit alerts remain calculated separately.
   - Merged Hold Summary + Hold/Resume action behavior is retained.

Recommended cache version: `v=172219`.
