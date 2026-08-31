# JUAN PROJECT WORKSPACE v1.1.4

## Mobile workflow
- Final five-slot mobile navigation: Overview · Projects · + · AI · Finance.
- Floating iPhone-style navigation capsule with maximum pill radius, safe-area handling, larger touch targets, and fixed high z-index.
- Quick Access center button: Create Order, Edit Order, Record Payment.
- Upcoming Deadlines moved to the top with horizontal scrolling and soft feather edges.
- Compact Project Status strip: Active, Remaining deliverables, Due.
- Current Projects header opens a full active-project sheet with deadline tags and progress.
- Projects list reduced to Project ID, name, progress, deadline, tags, and a vertical action menu.
- Project detail sheet prioritizes deadline/status/progress, then Deliverables and Payment Monitoring.
- Deliverables can be checked/un-checked on mobile.
- Add Item reuses the existing Service Catalog / batch-add project-item workflow.
- Payment Monitoring shows balance, paid, total, recent payment activity, and receipt thumbnails.
- Mobile receipt capture supports Camera / Photos, local OCR when available, editable reference number, and receipt attachment.
- Swipe to Record Payment uses the existing payment engine and its success state.
- AI returns to the existing guided project encoding/editing workflow.
- Finance remains intentionally compact.

## Fees and invoice
- System Maintenance is system-defined at PHP 1.00 once per project whenever any package is present, including restored/older package projects.
- Rush Production Fee now considers Project Timeline and Project Workload using system-defined tiers.
- Current Workload Adjustment retains the existing workload snapshot rules for projects starting at project 052.
- Existing production standards remain: one standalone service = 7 days; two or more standalone services = 14 days; any package = 14 days.
- Invoice totals section simplified to Subtotal, Discount, Additional Fees, TOTAL, Amount Paid, and Balance.
- Additional Fees list Rush Production Fee, Current Workload Adjustment, and System Maintenance with compact info explanations.

## Visual language
- Retains JUAN fonts, green palette, white surfaces, neutral metadata, and existing status colors.
- Project/finance mobile pages use rows for lists and cards only for summaries to maximize usable screen area.
- Desktop toolbar filters are grouped into a quieter segmented control; primary header action uses a compact pill treatment.
