# Deployment and Safari Add to Dock

## Vercel — simplest manual deployment

The project remains a static site. Upload the **contents of this project folder** to your Vercel project, with `index.html` at the deployment root.

The included `vercel.json`, `manifest.webmanifest`, icons and service worker are already in the project root.

After deployment, open the Vercel URL in Safari and choose:

**File → Add to Dock**

## Updating a deployment

Recommended workflow:
1. Create a Git branch.
2. Make/edit/test locally.
3. Commit.
4. Merge to `main`.
5. Deploy the tested `main` version.
6. Update `VERSION` and `CHANGELOG.md`.

## Service-worker cache

Browsers can keep old files offline. If you make a release and Safari/Chrome keeps an older asset, change the cache name near the top of `service-worker.js`, e.g.:

```js
const CACHE_NAME = 'juan-project-workspace-v1-2026-cache-2';
```

Then redeploy and reload.
