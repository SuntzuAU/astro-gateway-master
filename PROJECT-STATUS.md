# VRA Gateway Sites — Project Status
### Last updated: 6 March 2026

---

## QUICK START FOR NEW SESSION

1. Read this file first
2. **Read SuntzuAU/vra-network-config** — this is the single source of truth for the entire network:
   - `NETWORK-SITES.md` — which sites are live (only link to live sites)
   - `LINK-REGISTRY.md` — which links have been used across all sites (read before writing any content)
   - `CONTENT-GUIDELINES.md` — writing rules, tone, legal compliance, linking rules
3. Read `/VRA-GATEWAY-SITES-BRIEFING.md` in this repo for full project context
4. Verify GitHub MCP is working: list files in SuntzuAU/astro-gateway-master
5. Check pdfsoftware.pages.dev is live and looking correct before doing anything else

---

## REPOSITORIES

| Repo | Purpose | Status |
|---|---|---|
| SuntzuAU/vra-network-config | **Master config for entire network** — content guidelines, link registry, site list | ACTIVE |
| SuntzuAU/astro-gateway-master | Master template — all new sites cloned from here | ACTIVE |
| SuntzuAU/pdfsoftware | pdfsoftware.com.au production site | ACTIVE |

---

## LIVE SITES

| Site | URL | Domain | Status |
|---|---|---|---|
| pdfsoftware.com.au | pdfsoftware.pages.dev | NOT YET POINTED | Live on preview URL |

---

## CURRENT STATE — WHAT IS WORKING

### astro-gateway-master (template)
- ✅ index.astro — full homepage with hero, stats bar, benefits, pricing, TCO table, about, how it works, features, FAQ, CTA form, footer
- ✅ src/pages/news/index.astro — news listing page
- ✅ src/pages/news/[slug].astro — individual article page
- ✅ src/pages/about.astro
- ✅ src/pages/privacy.astro
- ✅ src/pages/terms.astro
- ✅ src/pages/404.astro
- ✅ src/content/config.ts — Astro content collection schema for news posts
- ✅ src/content/news/ — 2 sample blog posts
- ✅ src/data/image-manifest.json — maps image keys to R2 URLs
- ✅ src/site.config.json — all content, colours, pricing driven from here
- ✅ .github/workflows/generate-images.yml — GitHub Actions pipeline

### pdfsoftware repo
- ✅ All above files synced from master (as of 6 March 2026)
- ✅ Deploys to Cloudflare Pages automatically on push
- ✅ PUBLIC_R2_BASE env var set in Cloudflare Pages settings
- ✅ Images loading from R2

---

## BUGS FIXED THIS SESSION (6 March 2026)

### Critical: Icons rendering as HTML entity text
**Problem:** benefit card icons and feature card icons in site.config.json used emoji/unicode characters (e.g. &#x1F4B0;). The GitHub API corrupts these during base64 encoding, so they rendered as literal entity strings on the page.

**Fix applied to BOTH repos:**
- Removed `{b.icon}` and `{f.icon}` from index.astro
- Replaced with hardcoded inline SVG array `benefitIcons[]` in the frontmatter
- Used `set:html={benefitIcons[i]}` to render them
- SVGs are amber-coloured circular icons matching the site palette
- This is the permanent pattern going forward — NEVER put icons/emoji in site.config.json

### Critical: Pricing checkmarks showing word "checkmark"
**Problem:** CSS `content: "checkmark"` was literally printing the word.

**Fix:** Changed to `content: "✓"` — this is safe in CSS as it's a direct Unicode char in the stylesheet, not passing through JSON/GitHub API.

### Meta title format
**pdfsoftware:** Title changed to "PDF Software Australia - Switch from Adobe Acrobat and save thousands"

**master template:** Title now checks for optional `seoTitle` field in site.config.json first. If set, uses that. If not, falls back to `{siteName} — {headline}`.

To use: add `"seoTitle": "Your Custom SEO Title Here"` to site.config.json

---

## KNOWN ISSUES / PENDING

- ❌ pdfsoftware.com.au DNS not yet pointed to Cloudflare Pages
- ❌ No sites 2-10 created yet
- ❌ Decap CMS not implemented
- ❌ Pattern 3 multi-site architecture (shared layout repo) not implemented
- ❌ Email-based blog editing workflow not implemented
- ❌ SEO image naming (slug-first) in the Cloudflare Worker not implemented
- ❌ ActiveCampaign/HubSpot form embed (currently using direct AC form)
- ❌ Video section feature flag not added to template

---

## ARCHITECTURE — IMPORTANT RULES

### Icons / Unicode / Emoji
**NEVER put emoji or unicode characters in site.config.json.**
The GitHub API corrupts them during base64 encode/decode. Always use:
- Inline SVGs in the .astro template (current approach for benefit/feature icons)
- HTML entities hardcoded in the .astro template (e.g. `&#10003;` for checkmarks in prose)
- Plain ASCII text in JSON

### site.config.json is the single source of truth
All content, colours, pricing, copy lives in site.config.json. index.astro reads everything from it. To customise a cloned site, only edit site.config.json (and logo.png).

### Image manifest
src/data/image-manifest.json maps logical image keys (e.g. "hero", "about-banner") to R2 object keys. Updated by GitHub Actions after image generation.

### R2 images
Public base URL: `https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev`
Must be set as PUBLIC_R2_BASE in both GitHub Actions secrets AND Cloudflare Pages environment variables.

### Cloudflare Worker
- Name: master-image-generator
- URL: https://master-image-generator.speech-recognition-cloud.workers.dev
- Endpoint: POST /generate
- Body: `{ "prompt": "...", "name": "seo-slug-here" }`
- Returns: `{ ok: true, r2: { key, contentType, bytes } }`

---

## NEXT PRIORITIES (in order)

1. **Point DNS** for pdfsoftware.com.au → Cloudflare Pages (10 min job)
2. **Verify the icon fix** is rendering correctly on pdfsoftware.pages.dev
3. **Decide next site** — which product/domain is site #2
4. **Clone master to site #2** — create new repo, set up Cloudflare Pages, customise site.config.json
5. **SEO image naming** — update Cloudflare Worker to use slug-first filenames
6. **Email-based content workflow** — design and implement

---

## OPEN QUESTIONS FOR OWNER

- What are the remaining 4 site domains and products (beyond the 6 listed)?
- Which sites need video sections?
- What ActiveCampaign form ID should be used for each site?
- Is Decap CMS still the preferred CMS choice?
- Timeline for going live on real domains?

---

## CONTENT APPROVAL RULE (DO NOT SKIP)

Claude must NEVER commit content without explicit owner instruction.
Workflow: draft in chat → owner reviews → owner says "commit it" → Claude commits → Claude updates LINK-REGISTRY.md in vra-network-config.
Exception: bug fixes can be committed immediately, but owner must be informed straight after.
