# Build Rules — Architecture, Deployment, Images

## Why Astro

Astro is non-negotiable. Landing page performance is the primary SEO lever. Astro outputs static HTML by default with zero client-side JS unless explicitly added. Fast Core Web Vitals (LCP, CLS, FID) directly improve Google ranking. Never introduce React, Vue, or any client-side framework for content pages.

## Architecture Pattern

The reference pattern is `dragonprofessional16.com.au`:

- Single self-contained `index.astro` — no separate Nav component that imports pages for CSS variables
- All content driven from `src/site.config.json`
- Product subpages use `[product].astro` dynamic route
- Images served from Cloudflare R2 via `PUBLIC_R2_BASE` env var
- Blog posts in `src/content/news/` with required frontmatter

## Content Collection Standard

- Content folder: `src/content/news/`
- Collection name in config.ts: `news`
- Page routes: `src/pages/news/` and `src/pages/news.astro`
- URL pattern: `/news/post-slug`
- Do NOT create or use a `blog` collection or `src/content/blog/` folder

## CSS Rules

- Never use `var(--primary)` or `var(--accent)` for `background-color` on dark sections in `[product].astro`
- Extract colours in frontmatter as JS variables and apply via inline style
- `define:vars` works on `index.astro` but CSS class selectors for dark backgrounds need inline styles

## Performance Rules

- Minimise JavaScript — defer, lazy load, or eliminate
- YouTube/video embeds must use thumbnail facade (load iframe on click only)
- All images except hero: `loading="lazy"` and `decoding="async"`
- Hero images: `loading="eager"`
- Inline critical CSS using `is:inline` for above-the-fold content
- No third-party render-blocking scripts
- System fonts where possible; custom fonts use `font-display: swap`
- Mobile first: all layouts must work at 375px minimum

## CLOUDFLARE PAGES DEPLOYMENT — DO THIS FIRST WHEN A NEW SITE IS READY

**When a new repo is committed and ready to view, STOP coding and give Russ these manual instructions immediately. Do not attempt browser automation. This takes 2 minutes.**

1. Go to dash.cloudflare.com → Pages → Create a project → Connect to Git
2. Select organisation: `SuntzuAU` → select the repo
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variable:
   - Name: `PUBLIC_R2_BASE`
   - Value: `https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev`
5. Click Save and Deploy
6. Cloudflare will provide a `*.pages.dev` preview URL — share this with Russ to review

**Custom domains (after initial deploy is confirmed working):**
- Go to the Pages project → Custom domains
- Add BOTH the apex domain (e.g. `dragonmedicalone.au`) AND `www.dragonmedicalone.au`
- Adding only one causes 522 errors on the other

**Never attempt to automate Cloudflare Pages setup via browser MCP. Always give Russ the manual steps.**

## Deployment Notes

- Both apex domain AND `www` must be added as custom domains
- `PUBLIC_R2_BASE` must be set in BOTH GitHub Actions secrets AND Cloudflare Pages env vars
- Value: `https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev`
- Touching `src/site.config.json` forces a full rebuild when Cloudflare serves stale cache
- `public/_redirects` is read by Cloudflare Pages at deploy time — no dashboard config needed

## Image Generation — NEVER Autonomous

Every blog post requires three images: `heroImage`, `breakImage1`, `breakImage2` (plus alt text for each).

**Workflow:**
1. Draft article, get owner approval
2. Prepare three image prompts
3. Show owner exactly what will be sent and how many API calls (3)
4. Wait for owner to say "go" or "generate"
5. Call Worker via Chrome MCP javascript_tool
6. Capture R2 keys, add to frontmatter
7. Commit article + images together

**Worker endpoint:**
```
POST https://master-image-generator.speech-recognition-cloud.workers.dev/generate
Body: { "prompt": "...", "name": "seo-slug-here" }
```

**SEO image naming:** slug-first format, e.g. `dragon-medical-one-australia-gp-dictation-hero`

**If Chrome MCP unavailable:** inform owner and wait. Do NOT commit without images.

## Technical Gotchas

- Never use emoji/special Unicode in `site.config.json` — GitHub API corrupts during base64 encoding
- YAML frontmatter must have spaces after colons
- `push_files` cannot modify `.github/workflows/` files — provide content for manual paste
- Both apex and www must be added as Cloudflare Pages custom domains
- Cloudflare Pages 301 redirects are cached aggressively — test in incognito

## CRITICAL — ActiveCampaign Form: Two Separate Bugs, Both Fixed

### Bug 1: AC embed script hijacks form (client-side)

**NEVER use ActiveCampaign's own CSS class naming conventions in any form component.**

When a form uses AC's class names (`_form_289`, `_form_element`, `_field-wrapper`, `_submit`, `_form-thank-you`, etc.), AC's external tracking/embed script detects these classes, attaches itself, and enforces its own validation including phone format.

**Fix:** All form/wrapper classes use `vra-` prefix. Form `id` uses `vra_form_` prefix. See ACForm.astro in dragonmedicalone as the reference implementation.

### Bug 2: AC server-side phone validation (server-side, harder to spot)

**NEVER use `name="phone"` for the phone input field.**

AC's `proc.php` endpoint treats `phone` as a reserved field name and validates it server-side, requiring international E.164 format (`+XXXXXXXXXXXXX`). It returns this error via JSONP callback to `_show_error` even when the field has no `required` attribute and even when our own JS doesn't validate it. Leaving the field blank bypasses it, but any text value triggers rejection.

**Fix:** Map phone to a custom field: `name="field[XX]"` where XX is the AC custom text field ID for that form. Custom fields accept any text format.

**The `cfields` map in the script must include the phone field ID:**
```js
window.cfields = {"35": "practice_organisation", "36": "phone_number", "18": "comments_about_your_needs"};
```

If you ever see "Please provide a valid phone number (format +XXXXXXXXXXXXX)" and the field has no `required` attribute, the cause is `name="phone"`. Fix by remapping to `name="field[XX]"` using a custom AC text field.

This rule applies to ALL sites in the network. Never use `name="phone"` in any AC form.
