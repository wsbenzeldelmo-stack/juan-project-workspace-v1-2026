# Mobile Viewer Edition — v1.1.0

## Purpose
The mobile experience is intentionally **not** a full admin replacement. It is designed for checking the workspace quickly and using the AI Assistant while away from the desktop.

## Main phone navigation
1. **Home** — KPIs, active projects, deadlines, calendar summary.
2. **Projects** — search and inspect project details, deliverables/progress, payment status, notes.
3. **AI** — primary mobile action surface for guided questions and workspace lookups.
4. **Finance** — read invoices, balances, payment status and reports.
5. **More** — Settings plus secondary read-only views such as Clients and Calendar.

## Intentionally desktop-only
- New Order / project creation
- Mark deliverables complete
- Record/edit payments
- Catalog/service/package administration
- Destructive operations
- Complex project editing

This prevents accidental edits on a small screen and keeps mobile fast.

## Profile photo
Settings > Profile > Change Photo now opens an editor. Drag the image, zoom with the slider, then choose **Use Photo**. The result is stored as a compact 512×512 JPEG.

## Recommended next mobile iteration
Once Supabase is the main database, add: push/deadline notifications, AI quick actions, a read-only activity feed, invoice preview/share, and an explicit temporary “Admin Mode” unlock for rare emergency edits.
