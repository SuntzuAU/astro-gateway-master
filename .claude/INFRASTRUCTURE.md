# VRA Gateway Network — Infrastructure Reference

Last updated: 18 March 2026

**Read this file before setting up any new site, adding tracking, or configuring deployments.**

---

## MANDATORY DEPLOYMENT CHECKLIST — Every New Site

**Claude must run through this checklist at the start of any session where a new site is being deployed or a site is not loading correctly. Ask Russ to confirm each step is done before diagnosing other issues.**

- [ ] **1. Cloudflare Pages project created** — Pages project exists for this domain
- [ ] **2. Build settings configured** — build command `npm run build`, output dir `dist`, env var `PUBLIC_R2_BASE` set
- [ ] **3. GitHub repo connected** — Pages project linked to the correct SuntzuAU repo
- [ ] **4. Custom domains added in Pages** — BOTH apex and www added inside the Pages project (not just DNS records). Go to Pages -> [project] -> Custom domains -> Add a custom domain. Add `domain.com.au` AND `www.domain.com.au` separately. This step is what triggers Cloudflare to create the correct DNS records. Skipping it means the site will never load even if nameservers and DNS look correct.
- [ ] **5. Custom domains show Active** — both entries in Pages show status Active (not Pending/Invalid)
- [ ] **6. Nameservers at registrar** — Crazy Domains nameservers set to the pair assigned to this zone (check Cloudflare DNS page — common pairs: `lindsey`/`lynn`, `ganz`/`nelci`)
- [ ] **7. DNS records correct in Cloudflare** — after step 4, Cloudflare Pages auto-creates a CNAME for www and an A/CNAME for apex. Verify no old A records pointing to previous hosts (Hostinger, SiteGround, etc.) are still proxied
- [ ] **8. Logo file present** — `public/logo.jpg` exists in repo (sites use JPEG not PNG)
- [ ] **9. R2 images populated** — image-manifest.json has r2Key values; images exist in R2 at those keys
- [ ] **10. GA4 ID in site.config.json** — `googleAnalyticsId` field is non-empty
- [ ] **11. Account-level Bulk Redirects checked** — go to Cloudflare Account Home -> Bulk Redirects and verify no rules intercept this domain. These are account-wide and can silently redirect all traffic even when Pages/DNS config is correct.

**If a site is not loading:** go through steps 4, 7, and 11 first. The most common causes are: step 4 skipped (custom domains not added in Pages), old DNS records from previous host, or account-level Bulk Redirect rules.

---

## Google Analytics 4 — Measurement IDs

All properties are under GA Account ID `428145` (www.voicerecognition.com.au).

The `googleAnalyticsId` field in each site's `src/site.config.json` holds the G- tag.
The GA snippet fires automatically when the field is non-empty — do not hardcode the snippet.

| Domain | Product | GA4 Measurement ID | Repo Status |
|---|---|---|---|
| pdfsoftware.com.au | Tungsten Power PDF | `G-18L345NQ6C` | Committed |
| dragonprofessional16.com.au | Dragon Professional 16 | `G-Y6TT76JQMJ` | Committed |
| dragonnaturallyspeaking.com.au | Dragon NaturallySpeaking gateway | `G-V3JZSX7E0F` | Committed |
| dictationsolutions.com.au | Dictation Solutions (multi-product) | `G-74PW1ZVXZC` | Committed |
| dragonmedicalone.au | Dragon Medical One | `G-WGQD3PBYQ8` | Committed |
| speechrecognition.cloud | SpeechRecognition.cloud SaaS | `G-59XRLJXSS1` | Pending build |
| cloudprinting.au | PrintX cloud printing | `G-5JQ8BG0E6T` | Pending build |

---

## Repository & Hosting Reference

| Domain | GitHub Repo | Hosting | Stack | Notes |
|---|---|---|---|---|
| voicerecognition.com.au | N/A | Shopify | Shopify | Primary hub. Do NOT modify. |
| pdfsoftware.com.au | SuntzuAU/pdfsoftware | Cloudflare Pages | Astro | Template reference site |
| dragonprofessional16.com.au | SuntzuAU/dragonprofessional16 | Cloudflare Pages | Astro | Live |
| dragonnaturallyspeaking.com.au | SuntzuAU/dragonnaturallyspeaking | Cloudflare Pages | Astro | Live |
| dictationsolutions.com.au | SuntzuAU/dictationsolutions | Cloudflare Pages | Astro | Live |
| dragonmedicalone.au | SuntzuAU/dragonmedicalone | Cloudflare Pages | Astro | Build complete — deployment in progress |
| speechrecognition.cloud | TBD | Cloudflare Pages | Astro | Next build — siteType: saas |
| cloudprinting.au | TBD | Cloudflare Pages | Astro | Not yet built |

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
| R2 image key format | `SITE_ID/YYYY/MM/DD/seo-slug-uuid.jpg` |
| DNS registrar | Crazy Domains (nameservers delegated to Cloudflare) |
| Cloudflare nameservers | Assigned per zone — check Cloudflare DNS page for each domain. Common pairs: `lindsey`/`lynn`, `ganz`/`nelci`. Do not assume — verify in the zone. |

---

## ActiveCampaign Form IDs

| Site | Form ID | or UUID |
|---|---|---|
| pdfsoftware.com.au | `281` | (check repo) |
| dragonprofessional16.com.au | `283` | `452040ae-e495-4c74-bd95-dc0f67e3edd8` |
| dragonnaturallyspeaking.com.au | `285` | (check repo) |
| dragonmedicalone.au | `289` | `55459e75-589b-4fbf-9c06-f7a873049b56` |
| dictationsolutions.com.au | Not yet confirmed | — |

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

- **Deployment checklist** — run the checklist at the top of this file for every new site. Step 4 (custom domains in Pages) is the most commonly missed step.
- **Account-level Bulk Redirects** — check under Account Home -> Bulk Redirects. These are invisible in the domain zone and can hijack all traffic.
- **Custom domains in Pages** — always add BOTH apex and www inside the Pages project custom domains UI.
- **Logo files are JPEG** — sites use `public/logo.jpg`, not `logo.png`.
- **Never use emoji/Unicode in site.config.json** — GitHub API corrupts them during base64 encoding
- **Never call the image Worker autonomously** — prepare prompts, show Russ, wait for approval
- **CSS variables on product subpages** — use inline styles with hardcoded hex, not `var(--primary)` in class selectors
- **Blog content location** — `src/content/news/` not `src/content/blog/`
- **voicerecognition.com.au is Shopify** — never redesign or replace it, gateway sites link TO it
- **Workflow files** — `.github/workflows/` files cannot be pushed via GitHub MCP; provide content for manual paste
- **Old DNS records** — when a domain was previously hosted elsewhere, Cloudflare imports those old records when the zone is created. After adding custom domains in Pages, verify the old A/CNAME records have been replaced.
