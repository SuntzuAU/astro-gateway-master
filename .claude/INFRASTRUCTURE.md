# VRA Gateway Network — Infrastructure Reference

Last updated: 17 March 2026

**Read this file before setting up any new site, adding tracking, or configuring deployments.**

---

## Google Analytics 4 — Measurement IDs

All properties are under GA Account ID `428145` (www.voicerecognition.com.au).

The `googleAnalyticsId` field in each site's `src/site.config.json` holds the G- tag.
The GA snippet fires automatically when the field is non-empty — do not hardcode the snippet.

| Domain | Product | GA4 Measurement ID | Repo Status |
|---|---|---|---|
| pdfsoftware.com.au | Tungsten Power PDF | `G-18L345NQ6C` | Committed ✅ |
| dragonprofessional16.com.au | Dragon Professional 16 | `G-Y6TT76JQMJ` | Committed ✅ |
| dragonnaturallyspeaking.com.au | Dragon NaturallySpeaking gateway | `G-V3JZSX7E0F` | Committed ✅ |
| dictationsolutions.com.au | Dictation Solutions (multi-product) | `G-74PW1ZVXZC` | Committed ✅ |
| speechrecognition.cloud | SpeechRecognition.cloud SaaS | `G-59XRLJXSS1` | Pending build |
| cloudprinting.au | PrintX cloud printing | `G-5JQ8BG0E6T` | Pending build |
| dragonmedicalone.au | Dragon Medical One | `G-WGQD3PBYQ8` | Pending build (currently Wix) |

---

## Repository & Hosting Reference

| Domain | GitHub Repo | Hosting | Stack | Notes |
|---|---|---|---|---|
| voicerecognition.com.au | N/A | Shopify | Shopify | Primary hub. Do NOT modify. |
| pdfsoftware.com.au | SuntzuAU/pdfsoftware | Cloudflare Pages | Astro | Template reference site |
| dragonprofessional16.com.au | SuntzuAU/dragonprofessional16 | Cloudflare Pages | Astro | Live |
| dragonnaturallyspeaking.com.au | SuntzuAU/dragonnaturallyspeaking | Cloudflare Pages | Astro | Migrated from Wix |
| dictationsolutions.com.au | SuntzuAU/dictationsolutions | Cloudflare Pages | Astro | Active build focus |
| speechrecognition.cloud | TBD | Cloudflare Pages | Astro | Not yet built |
| cloudprinting.au | TBD | Cloudflare Pages | Astro | Not yet built |
| dragonmedicalone.au | TBD | Wix → Cloudflare Pages | Wix > Astro | GA created, build pending |

---

## Cloudflare Infrastructure

| Item | Value |
|---|---|
| Cloudflare Account ID | `d18cbb8c5ed07455ddfb863be62e61f8` |
| R2 Bucket name | `GATEWAY_IMAGES` |
| R2 Public Base URL | `https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev` |
| Image Worker URL | `https://master-image-generator.speech-recognition-cloud.workers.dev/generate` |
| Image Worker model | `gemini-3.1-flash-image-preview` (Nano Banana 2) |
| Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent` |
| R2 image key format | `SITE_ID/YYYY/MM/DD/seo-slug-uuid.png` |
| DNS registrar | Crazy Domains (nameservers delegated to Cloudflare) |
| Cloudflare nameservers | `lindsey.ns.cloudflare.com` / `lynn.ns.cloudflare.com` |

---

## ActiveCampaign Form IDs

| Site | Form ID |
|---|---|
| pdfsoftware.com.au | `281` |
| dragonprofessional16.com.au | `283` |
| dragonnaturallyspeaking.com.au | `285` |
| dictationsolutions.com.au | Not yet confirmed |

---

## When Adding GA to a New Site

1. Create a GA4 property at analytics.google.com under Account ID 428145
2. Add a Web data stream for the site domain
3. Copy the Measurement ID (format: `G-XXXXXXXXXX`)
4. Add it to `src/site.config.json` as `"googleAnalyticsId": "G-XXXXXXXXXX"`
5. The snippet fires automatically — no template code changes needed
6. Record the ID in this file

---

## Critical Rules (Summary)

- **Never use emoji/Unicode in site.config.json** — GitHub API corrupts them during base64 encoding
- **Never call the image Worker autonomously** — prepare prompts, show Russ, wait for manual trigger
- **Always add both apex and www** as custom domains in Cloudflare Pages — adding only one causes 522 errors
- **CSS variables on product subpages** — use inline styles with hardcoded hex, not `var(--primary)` in class selectors
- **Blog content location** — `src/content/news/` not `src/content/blog/`
- **voicerecognition.com.au is Shopify** — never redesign or replace it, gateway sites link TO it
- **Workflow files** — `.github/workflows/` files cannot be pushed via GitHub MCP; provide content for manual paste
