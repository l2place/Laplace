# Laplace

A simple personal profile using the black, charcoal, rounded-panel design of Laplace Hub and Bridge, with the original animated background and particles. Links appear in one column with icons and names only. GitHub, Instagram, TikTok, and Discord are linked. No build step or external fonts are required.

## Website files

Upload these to the root of the GitHub repository:

- index.html
- style.css
- config.js
- visitors.js
- favicon.svg
- avatar.jpg (the existing image is unchanged)
- background.jpg
- particles.js
- buttons.js
- motion.js

Keep README.md if you want these notes in the repository. The counter folder is its separate Cloudflare backend; GitHub Pages does not run it. **Keep buttons.js and particles.js** for hover effects and background animation. Motion pauses in hidden tabs. The header control can enable or pause all motion and saves the choice in local storage. System reduced motion is respected initially, and the user can explicitly enable animation. Background parallax, layered mist, frame-rate-independent drifting particles, light streaks, hover tilt, and tap ripples provide continuous visible movement on desktop and touch screens. **Keep the new visitors.js**: it runs the real counter.

Open index.html for a visual preview. Local file previews deliberately do not record production visits.

## Live visitor counter

The backend is deployed at https://laplace-visitors.laplace-visitor-counter.workers.dev. config.js already contains this public address; it contains no credentials. Upload the new website files to activate it on https://l2place.github.io/Laplace/.

- Visits are recorded browser sessions, not a timer or a fabricated starting number.
- A new visit begins after 30 minutes without a heartbeat. Refreshing or opening another tab in the same browser does not create a second visit.
- Online now means distinct browsers with a visible page that sent a heartbeat within the last 90 seconds. It is an approximate presence count, not an instantaneous disconnect detector.
- Visible pages refresh the counter every 30 seconds. Hidden pages stop heartbeats. Returning to the page resumes them.
- Totals are stored persistently in a Cloudflare SQLite-backed Durable Object. Old browser IDs are cleaned up after 24 hours of inactivity on the next visit; the total remains.
- A random ID is stored in browser local storage to deduplicate tabs and refreshes. The database does not store names, IP addresses, or account details. Network requests are still processed by Cloudflare.
- Counts represent recorded browsers, not verified unique humans. Cleared/blocked storage, bots, deliberate automated requests, and blocked network requests can affect counts. If storage is blocked, an in-memory ID lasts only for that page load.
- If the service cannot be reached, the page shows unavailable rather than making up a number or leaving a stale online count.
- Historical traffic from before this system was installed cannot be recovered.

## Counter maintenance

The Worker only allows the configured GitHub Pages origin. For a custom domain, add its origin to ALLOWED_ORIGINS in counter/wrangler.jsonc and redeploy.

Cloudflare provides a free Workers plan with usage limits. This project uses the SQLite storage backend supported by that plan. No paid plan is required for setup.

To deploy again from this PC, double-click Setup Counter.bat, sign in when requested, and authorize Wrangler. The setup updates config.js with the deployed address. Upload config.js again if that address changes. Account credentials remain in Wrangler's local configuration and must never be copied into the site or uploaded.

For development, run npm ci inside counter, then npm run dev. npm test checks session deduplication, expiry, persistence, cleanup, input validation, and API behavior. Local website origins must be explicitly added when testing.

## Verification

Verified against a real local Cloudflare Worker and SQLite storage: distinct browsers, refreshes and tabs, concurrent requests, online presence, outage recovery, allowed origins, and responsive desktop/390px/320px layouts. Keyboard navigation and profile image loading also passed. Production connectivity is verified with read-only requests so testing does not inflate the live total.
