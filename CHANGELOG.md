# v8.1.0 — Cloud authentication feedback + Gemini-first assistant
- Fixed missing `updateConnectionStatus()` runtime bug that prevented visible cloud-state transitions.
- Added explicit Authenticating, Connecting, Connected, Wrong Password, and Cloud Error feedback.
- Cloud modal remains open when authentication/database setup fails so the error is visible.
- Added automatic restore of an existing secure cloud session.
- Replaced the guided assistant workflow with free-form Gemini chat.
- Removed assistant preset shortcut cards and locked composer behavior.
- Added Gemini server status detection and secure CSRF-aware chat requests.
- Added workspace-aware Gemini context and local session chat history.
- Bumped the service-worker cache to force the corrected client bundle to load.

# v8.0.0 — Fresh Supabase + Gemini deployment
- Added full `sql/install.sql` for brand-new Supabase projects.
- Added current `sb_secret_...` server-key support via `SUPABASE_SECRET_KEY`.
- Added normalized project bundle synchronization for project items, deliverables, and payments.
- Added first-connection bootstrap into an empty database.
- Preserved legacy service-role fallback only for compatibility.

# JUAN Project Workspace — v1.1.5

## Shop + Workspace Refinement

This patch continues from the stable v1.1.4 Workspace. It does **not** include the cancelled v1.2.0 Supabase / JUAN Project Online redesign.

### Shop terminology and structure
- Renames the visible **Pricelist / Catalog** module to **Shop**.
- Uses the hierarchy **Shop → Services → Items + Packages**.
- `TV Broadcast Graphics` is now presented as a **Service**.
- `Studio`, `Lower Thirds`, `Logo Animation`, etc. are presented as **Items**.
- Packages are built from the same existing Items used by New Order.
- New Order and Shop continue to read the same `soloServices` and `packagesList` data, preventing duplicate price lists.
- Adds Service filters to New Order.
- Shop `All` view combines Items first and Packages last in one table.
- Selecting a specific Service shows separate aligned Items and Packages tables.
- Package inclusions are collapsible.
- Adds maximize controls to Items and Packages.
- Services can be drag-reordered while Shop sort is set to Default.
- Corrects Shop table column sizing and the large whitespace bug.

### Actions and visual language
- Standard buttons use the existing JUAN capsule language.
- Only the primary action in an action group remains green; supporting actions are neutral.
- `Mark as Delivered` is now secondary beside the primary `Record Payment` action.
- Row action controls use the vertical `⋮` pattern with explicit action labels such as Edit Item, Delete Item, Edit Package, Delete Package, Edit Client, and Delete Client.
- Removes the duplicate Edit button from Project Data → Order Items; the vertical menu now owns Edit / Remove.
- Fixes the existing-client typeahead layering / overlap bug.
- Updates the JUAN Assistant floating control to a true circular button with a small wave mark.
- Makes the guided JUAN Assistant copy friendlier while preserving its existing controlled workflow.

### Calendar
- Adds custom **Events** and **Meetings** to the existing Calendar.
- Click a date or `+ Add Event` to schedule.
- Supports title, date, start/end time, related project, and notes.
- Saved events persist locally in `JUAN_CALENDAR_EVENTS` and can be edited or deleted.
- Project deadlines remain visible and clickable.

### Rush and additional fees
- Keeps the underlying saved rush fields for backwards compatibility.
- Client-facing display is simplified to **Rush Fee** and **System Maintenance Fee**.
- Starting from JP-052, the displayed Rush Fee combines the saved production rush charge and applicable workload adjustment.
- Rush logic still considers Project Timeline, Project Workload, and Current Workload.
- Details are moved to an `i` information modal instead of occupying permanent order / invoice space.
- System Maintenance Fee remains ₱1 once when a project contains at least one Package, and ₱0 for solo-only projects.

### Invoice
- Adds Order Item, Quantity, and Price rows to the invoice.
- Keeps totals compact: Subtotal, Discount, Additional Fees, Total, Amount Paid, Balance.
- Additional fee lines use tight spacing and only show explanations when requested on-screen.

### Clients
- Adds a visible Client ID inherited from the client's earliest project sequence (`CL-###`).
- Client Directory defaults to ID order.
- Client Profile receives a cleaner editable profile layout and a single capsule **Save Changes** action.
- Phone numbers are normalized to Philippine international display format (`+63 9xx xxx xxxx`) when saved.

### Cache
- Service Worker cache bumped to `cache-115` and includes `shop-refinement.css`.

## 2026-09-02 — Security/architecture refactor
- Unified assistant engine; removed `assistant-bridge.js` duplicate listener layer.
- Stabilized project/filter/client/receipt responsive rules.
- Added reliable reconnect-triggered cloud mutation queue flushing.
- Added secure same-origin session, CSRF, Supabase data proxy, and Gemini proxy serverless routes.
- Removed client-side Supabase credential configuration.
- Added RLS/revoke SQL baseline and hardened response headers/CSP.
- Implemented 7-day single-item / 14-day multi-item defaults, fixed PHP 21 maintenance fee, PHP 500 revision add-ons, 50% project-file add-ons, order drafts, reset-on-submit, sticky Project Data headers, input masks, unified payment ledger styling, and compact stacked receipt totals.
