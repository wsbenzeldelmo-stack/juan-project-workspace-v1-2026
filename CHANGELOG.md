# Changelog

## v1.0.1 — 2026-08-31

- Fixed JSON backup restore so it **replaces** the current workspace database instead of silently skipping duplicate IDs.
- Added backup validation and a restore summary before changes are made.
- Added PIN protection for destructive restore operations.
- Restores clients, projects, templates, services, packages, and catalog categories.
- Clears stale temporary task/cart data during restore.
- Prevents the built-in sample seeder from overwriting restored legacy backups on reload.
- Rebuilds the visible JP project sequence continuously after restore.

## 1.0.0 — 2026

- Converted the working JUAN PROJECT single-file web app into a modular folder structure.
- Split CSS and JavaScript into maintainable files without changing application behavior.
- Added documentation, cross-platform local launchers, Git/version-control guidance, PWA files and Vercel deployment support.
- Updated app icon assets to the refined green JUAN icon.

Future changes should be recorded here.
