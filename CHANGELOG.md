# v1.1.3 — Mobile Companion + Quick Payment OCR

- Rebuilt the phone UI around the final companion model: Overview, AI, Finance.
- Upcoming Deadlines now appear first on Overview.
- Current Projects use simple cards with one progress bar along the bottom edge.
- Tapping a project opens a read-only mobile viewer with only Deliverables and Invoice.
- Replaced the old mobile navigation with a fixed iOS-style translucent dock.
- Added a raised green center `+` quick action for Record Payment.
- Added phone-friendly payment entry for project, amount, method, date and reference number.
- Added Take Photo / Choose Photo receipt actions.
- Added local receipt OCR to suggest a reference/transaction number when the bundled OCR engine is available.
- Reference number remains editable if OCR is wrong or unavailable.
- Added a green swipe-to-record interaction; the swipe itself is the payment confirmation on mobile.
- Finance mobile view now emphasizes Outstanding, Collected, Receivables and Recent Payments.
- Layout uses dynamic viewport units and iOS safe-area insets, so it works in Safari and installed web-app mode without hard-coding one iPhone size.
- Desktop workspace remains unchanged.
