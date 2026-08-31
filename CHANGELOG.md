# JUAN PROJECT WORKSPACE — Changelog

## v1.1.1 — Mobile Navigation Fix
- Fixed mobile bottom navigation buttons not responding to taps.
- Corrected the app reference from `window.app` to the workspace's global `app` object.
- Bottom navigation is now fixed directly to the screen bottom.
- Added iPhone safe-area handling for Safari and installed web-app mode.
- Increased reliable tap targets and enabled touch-friendly pointer handling.
- Simplified mobile glass effects, spacing, cards, and active-tab treatment.
- Added flexible viewport sizing using `dvh`, `clamp()`, and safe-area insets.
- Mobile remains viewer-first; Settings/photo editing remains available.
