# v8.4.0 — Unified System Feedback & Loading UX

- Added one centralized SystemModal architecture with confirm, warning, processing, and error modes; consequential system responses no longer rely on browser-native confirmation dialogs.
- Added one reusable SystemToast system for lightweight success/information feedback with responsive top-right placement, close controls, and optional retry/actions.
- Added InlineValidation helpers and moved key form validation into the relevant fields instead of interrupting users with generic popups.
- Added ComponentLoader/skeleton and reusable asynchronous button loading utilities without introducing full-screen navigation loaders.
- Unified cloud connection feedback: inline wrong-password feedback, Authentication → Connecting → Syncing phases, success toast, and safe retryable connection errors while preserving local data.
- Refined payment recording so feature forms never stack a processing modal; fields lock during persistence, values remain intact after failures, and financial views update together after success.
- Refined New Order flow: normal valid orders create directly, Rush Fee consequences use the warning mode, and project creation uses delayed processing feedback to avoid flicker.
- Refined invoice PDF/image/email response states and backup restore feedback using the same centralized architecture.
- Standardized destructive confirmations, focus trapping/restoration, safe Escape/backdrop behavior, modal z-index, minimum mobile touch targets, and no-modal-stacking rules.
- Removed the obsolete Order Summary confirmation dialog and retained functional form modals such as Record Payment, Shop editors, and Additional Fees management.
- Preserved offline-first persistence, Supabase synchronization/security routes, Gemini integration, centralized financial calculations, catalog rules, and all existing JUAN PROJECT WORKSPACE visual tokens.
- No database schema migration required.

# v8.3.0 — Seller / Shop Redesign

- Rebuilt only the Seller / Shop page to match the approved catalog-management reference.
- Added compact header actions, search + type/status/sort controls, 25/75 category/catalog layout, list/grid views, inline package inclusions, status badges, and row action menus.
- Removed the full Additional Fees table from the main Shop canvas. Fee configuration now lives in the dedicated Additional Fees modal.
- Preserved central fee/calculation behavior: System Maintenance Fee ₱21 once when applicable, Revision Fee ₱500 per additional revision, Rush Fee current rule, and Project File Request as an order item.
- Added safe JSON catalog import that merges new IDs without resetting existing records.
- Preserved offline-first local persistence and existing cloud/security pathways. No database schema migration required.

# v8.2.0 — Project Details redesign + unified billing logic
- Redesigned all Project Details tabs while preserving the existing JUAN PROJECT WORKSPACE sidebar, header, tab, spacing, card, and green-accent visual language.
- Project Data now separates Client Information, Project Information, Order / Items, Financial Summary, and Notes preview with cleaner hierarchy.
- Deliverables now uses a production-progress summary, compact metrics, grouped deliverable rows, status chips, and progress indicators.
- Payment Monitoring now uses one systematic equation: Items Subtotal + Additional Charges − Discounts = Total; Total − Amount Paid = Balance Due.
- Added a dedicated color-coded Balance Summary card using Paid (green), Partially Paid (amber), Unpaid (orange), and Overdue (red) semantic states while keeping the balance amount dark and readable.
- Invoice now uses the same centralized financial calculation as Project Data and Payment Monitoring, removes redundant fee/total rows, hides zero-value adjustments, and uses Order Item / Qty / Amount.
- Project File Request remains a normal order item. Rush Fee, Revision Fee, and System Maintenance Fee are handled as Additional Charges.
- Revision requests now increment the project revision count instead of creating new visible order-item rows; legacy revision ADDON rows remain supported for existing records.
- Added fallback handling for legacy/imported projects that have stored totals but no order-item rows.
- Notes now includes a compact project activity history.
- Fixed Payment Monitoring rendering against the current DOM IDs.
- Added a dedicated v8.2 Project Details stylesheet and bumped the service-worker cache so the redesigned UI loads after redeployment.

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
