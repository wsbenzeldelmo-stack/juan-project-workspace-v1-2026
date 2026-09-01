# Fresh Supabase + Gemini deployment

For a brand-new Supabase project, run `sql/install.sql` in the Supabase SQL Editor before connecting the workspace. Use a current Supabase server secret key (`sb_secret_...`) as `SUPABASE_SECRET_KEY`; it is sent only in the server-side `apikey` header and never shipped to the browser. Then set `GEMINI_API_KEY`, `WORKSPACE_PASSWORD`, `SESSION_SECRET`, and `CSRF_SECRET` in Vercel.

The first successful cloud connection detects an empty Supabase project and bootstraps the local workspace records into the new database, including normalized project items, deliverables, and payments.

# JUAN PROJECT WORKSPACE — Security, Local Test, and Redeployment

## Architecture
The browser is offline-first and stores its working copy locally. No Supabase service-role key, Gemini key, or database credential is shipped to the browser. Cloud operations use same-origin Vercel serverless routes under `/api`. `/api/session` creates a signed HttpOnly `SameSite=Strict` session cookie and provides a CSRF token. `/api/data` validates the session, origin, CSRF token, table allow-list, column allow-list, operation allow-list, and input size before forwarding to Supabase REST with the server-only service-role key. `/api/gemini` follows the same session/CSRF boundary and calls Google's Gemini Interactions API server-side with `store:false`; the API key is never exposed to the browser.

## Environment variables in Vercel
Add `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY` (only if AI proxy use is enabled), `WORKSPACE_PASSWORD`, `SESSION_SECRET`, and `CSRF_SECRET`. Never use a `VITE_`, `NEXT_PUBLIC_`, or other public prefix. Generate the two secrets independently with at least 32 random bytes.

## Supabase database security
1. Back up the project.
2. Open Supabase SQL Editor.
3. Run `sql/security.sql`.
4. Confirm the five workspace tables have RLS enabled and `anon` / `authenticated` do not have table privileges.
5. Keep the service-role key only in Vercel environment variables.

The server-side service role intentionally bypasses RLS; therefore the API proxy's authenticated allow-list is the application authorization boundary. For a multi-user future version, replace the single-owner password session with Supabase Auth/JWT user identity and owner-scoped RLS policies.

## Local testing
A plain `file://` launch can test offline UI only. To test service workers and `/api`, use Vercel's local runtime: install Node.js, then `npm i -g vercel`, run `vercel dev`, and open the shown localhost URL. Add the six environment variables to `.env.local` (never commit it). Test: offline reload, reconnect, New Order save draft/resume/submit/reset, Project Data sticky header, revision/project-file add-ons, package maintenance fee = PHP 21, 1 item = 7-day default, 2+ items = 14-day default, receipt print layout, and payment ledger.

## Cloud session test
Before cloud synchronization can run, POST the workspace password to `/api/session` from an authenticated owner UI or a trusted same-origin request. The response sets the HttpOnly session cookie; subsequent `/api/data` calls require the returned CSRF token. If the session is absent, the app intentionally remains `OFFLINE · LOCAL` instead of exposing database credentials.

## Deployment
1. Commit all changed files.
2. Push to the GitHub branch connected to Vercel.
3. In Vercel Project Settings → Environment Variables, set the six server-only values for Production and Preview as appropriate.
4. Redeploy.
5. Inspect DevTools → Sources/Network and verify no Supabase service-role key or Gemini API key appears in HTML, JavaScript, localStorage, or API responses.
6. Verify response headers include CSP, HSTS, frame denial, no-sniff, referrer policy, and permissions policy.

## TLS / WAF note
The app enforces HTTPS/HSTS at the application edge. Exact TLS protocol negotiation (including TLS 1.3 availability) and managed WAF rules are controlled by the Vercel edge/project configuration, not JavaScript. Enable Vercel Firewall/Attack Challenge for suspicious traffic and rate-limit `/api/session`, `/api/data`, and `/api/gemini` in the Vercel dashboard. The serverless handlers also reject cross-origin requests and non-allow-listed database operations.
