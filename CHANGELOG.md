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
