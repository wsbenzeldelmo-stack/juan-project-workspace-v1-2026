# JUAN PROJECT Workspace — Beginner Tutorial

## 1. What “modular” means

The old application stored HTML, CSS and JavaScript inside one very large `.html` file. This version separates responsibilities:

- **HTML** = what exists on the page.
- **CSS** = how it looks.
- **JavaScript** = what it does and what data it displays.

This makes future changes easier to locate and review.

## 2. Recommended editor

Use Visual Studio Code on macOS, Windows or Linux. Open the **whole `juan-project-workspace-v1-2026` folder**, not only `index.html`.

Helpful built-in actions:
- `Cmd/Ctrl + Shift + F` — search the entire project.
- `Cmd/Ctrl + P` — quickly open a file.
- Source Control panel — Git commits and changes.

## 3. Run locally

The app should be served over `http://localhost`, especially for the service worker/PWA.

### macOS

Double-click `scripts/run-local.command`. If macOS blocks it the first time, right-click → Open, or run:

```bash
chmod +x scripts/run-local.command scripts/run-local.sh
./scripts/run-local.command
```

### Windows

Double-click `scripts/run-local.bat`. It tries `py` first and then `python`.

### Linux

```bash
bash scripts/run-local.sh
```

Then open `http://localhost:8080`.

## 4. Change text/structure

Edit `index.html`.

Example: change a page title by searching for its visible text.

**Be careful with `id="..."` attributes.** JavaScript often relies on those exact IDs.

## 5. Change colors, fonts or spacing

Start with `css/core.css` for the design tokens near `:root`. For final typography/assistant refinements, use `css/typography-guided-assistant.css`.

Use the browser Inspector to identify a class, then search that class across the `css/` folder.

## 6. Change behavior

Start with `js/app.js`. Search for the feature name or related renderer.

Example workflow:
1. Search `renderProjects`.
2. Read the function before editing.
3. Create a Git branch.
4. Make one small change.
5. Reload the browser and test.
6. Commit the change.

## 7. Avoid losing data

Code files and browser data are different things. A Git rollback restores code but may not restore LocalStorage/IndexedDB/Supabase records.

Before a risky data migration:
- export/backup data using the application's backup feature;
- keep a copy of the working project folder;
- make a Git commit/tag.

## 8. Add a new CSS or JS file

You usually do not need to. Prefer the existing modules. If you do:

1. Add `<link>` or `<script>` in `index.html`.
2. Add the file to `CORE_ASSETS` in `service-worker.js` if it is required offline.
3. Increase the service-worker cache name, for example `cache-1` → `cache-2`.
4. Record the change in `CHANGELOG.md`.

## 9. Test before deployment

At minimum test:
- Overview
- Projects → Project Details
- New Order
- Clients
- Invoices & Payments
- Reports
- Calendar
- Pricelist/Catalog
- Settings
- backup/reset/security confirmation
- offline reload after the app has been cached

## 10. Deploy

See `DEPLOYMENT.md`.
