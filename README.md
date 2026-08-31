## Mobile Viewer Edition

v1.1.0 adds a read-first mobile interface. See `docs/MOBILE_GUIDE.md`.

# JUAN PROJECT Workspace — v1 (2026)

A modular, offline-capable web workspace for JUAN PROJECT.

This folder is deliberately **plain HTML + CSS + JavaScript**. There is no required npm build step, React, or framework. That means you can open and edit it on macOS, Windows, or Linux with VS Code or another code editor.

## Start here

1. Read `docs/TUTORIAL.md`.
2. Run the app through a local web server (recommended):
   - macOS: double-click `scripts/run-local.command`
   - Windows: double-click `scripts/run-local.bat`
   - Linux: run `bash scripts/run-local.sh`
3. Open `http://localhost:8080` in your browser.

## Folder map

```text
juan-project-workspace-v1-2026/
├── index.html                 # HTML structure / page markup
├── css/                       # All visual styling, loaded in numbered logical order
├── js/                        # Application logic and assistant modules
├── assets/                    # App icons/images
├── ocr/                       # OCR bootstrap/local OCR files
├── docs/                      # Tutorials and maintenance guides
├── scripts/                   # Cross-platform local-server launchers
├── manifest.webmanifest       # Safari/PWA metadata
├── service-worker.js          # Offline cache
├── vercel.json                # Vercel static deployment config
├── VERSION                    # Repository version
├── CHANGELOG.md               # Human-readable change history
├── .gitignore                 # Files Git should ignore
└── .gitattributes             # Text/binary file handling
```

## The safest editing rule

**Do not change an HTML `id` unless you also update every JavaScript reference to that ID.** Most of the app is wired together by IDs such as `projectsTableBody`, `overviewCurrentProjects`, etc.

## Version control

This folder already contains an initialized Git repository with an initial v1.0.0 checkpoint. See `docs/VERSION_CONTROL.md` before making your next major revision.

## Deployment

For Vercel and Safari Add to Dock, see `docs/DEPLOYMENT.md`.

## Data note

The app uses browser-side storage for much of its local/offline data. Git versions the **code**, not the user's browser database. Always use the app's backup/export functionality before risky data migrations.
## Restoring a JSON workspace backup

Open **Settings → Data Backup & Restore → Restore JSON Backup**. The restore flow validates the file, shows a record summary, asks for confirmation and the destructive-action PIN, then replaces the current browser workspace data with the backup.

A Vercel deployment hosts the application code; it does not turn the JSON file into a shared cloud database. Restored data is saved to the browser's local workspace storage on that device. Use Supabase when you want the same database to sync across devices.

