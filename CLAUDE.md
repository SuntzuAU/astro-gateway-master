# CLAUDE.md — Mandatory Pre-Build Instructions

This file is read by every Claude session working on any VRA gateway site repo. **Read this entire file before doing anything else.**

---

## CRITICAL RULES — NEVER VIOLATE THESE

1. **voicerecognition.com.au is the PRIMARY 25-year Shopify ecommerce site.** It is NOT a gateway site. Never redesign or replace it. Gateway sites link TO it for purchasing.
2. **Never invent domains.** Only use the verified list in `src/data/link-network.json`.
3. **No footer links. Ever.** All cross-site and internal links must be contextual — woven naturally into body copy.
4. **Never commit content without explicit owner approval.** Draft in chat first, wait for "commit it".
5. **Never use emoji or special Unicode in `site.config.json`.** GitHub API corrupts them during base64 encoding, breaking Astro builds.
6. **Never use a separate Nav component** that depends on importing pages to define CSS variables. Use the dragonprofessional16 self-contained single-file pattern.
7. **`push_files` cannot modify `.github/workflows/` files.** Provide content for manual paste via GitHub web editor.
8. **CSS variable rule:** Never use `var(--primary)` or `var(--accent)` for `background-color` on dark sections in `[product].astro`. Extract colours in frontmatter as JS variables and apply via inline style.

---

## MANDATORY PRE-BUILD CHECKLIST

Before writing a single line of code or content, read these files **in this order**:

1. `CLAUDE.md` — this file (you are reading it)
2. `src/data/link-network.json` — full network config, anchor pools, AND authority language for VRA/Russell
3. `src/site.config.json` — this site's content, colours, products, CTAs
4. `src/data/link-usage.json` — what has already been linked from this site (anchor text already used)
5. `src/content/news/` — existing blog posts (check slugs, context tags, existing links)

Only after reading all five may you proceed.

**Why this matters:** The dictationsolutions.com.au build was severely broken because a prior session skipped these files and invented its own structure from scratch. Every structural mistake in that build traced back to not reading the reference files. Do not repeat this.

---

## AUTHORITY LANGUAGE

All authority claims about VRA and Russell Bewsell **must come from `src/data/link-network.json` -> `authority` block**. Never improvise credentials, statistics, or claim language. If a claim is not in that block, do not use it.

---

## BLOG POST IMAGE REQUIREMENT — MANDATORY, NO EXCEPTIONS

Every blog post MUST have three images. This is not optional. A blog post without images is incomplete and must not be committed.

**Required images for every post:**
- `heroImage` — full-width image above the article header
- `breakImage1` — contextual image placed after the header, before the body
- `breakImage2` — contextual image placed at the end of the body, before the CTA

**Required alt text for every image:**
- `heroImageAlt`
- `breakImage1Alt`
- `breakImage2Alt`

**Workflow — images MUST be generated BEFORE committing the article:**

1. Draft the article in chat and get owner approval
2. Prepare three image prompts relevant to the article content
3. Call the Worker three times via Chrome MCP javascript_tool (Claude can do this autonomously — no need to ask owner to trigger manually)
4. Capture the three R2 keys from the Worker responses
5. Add all six image frontmatter fields to the article
6. THEN commit article + images together in one operation

**Worker endpoint:**
```
POST https://master-image-generator.speech-recognition-cloud.workers.dev/generate
Body: { "prompt": "...", "name": "seo-slug-here" }
Response: { ok: true, r2: { key: "site/yyyy/mm/dd/seo-slug-uuid.png" } }
```

**Call via Chrome MCP:**
```javascript
(async () => {
  const r = await fetch('https://master-image-generator.speech-recognition-cloud.workers.dev/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '...', name: '...' })
  });
  const d = await r.json();
  return JSON.stringify(d);
})();
```

**SEO image naming:** slug-first format describing article content, e.g. `dragon-medical-one-australia-gp-dictation-hero`

**If Chrome MCP is unavailable:** inform the owner and wait — do NOT commit the article without images.

---

## ARCHITECTURE PATTERN

The reference pattern for all page builds is `dragonprofessional16.com.au`. Key rules:

- Single self-contained `index.astro` — no separate Nav component
- All content driven from `src/site.config.json`
- Product subpages use `[product].astro` dynamic route
- Images served from Cloudflare R2 via `PUBLIC_R2_BASE` env var
- Blog posts in `src/content/news/` with required frontmatter (see link-network.json rules)

---

## DEPLOYMENT

- Hosting: Cloudflare Pages
- Both apex domain AND `www` must be added as custom domains in the Pages project
- `PUBLIC_R2_BASE` must be set in BOTH GitHub Actions secrets AND Cloudflare Pages environment variables
- Value: `https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev`
- Touching `src/site.config.json` forces a full rebuild when Cloudflare serves stale cache

---

## CONTENT APPROVAL WORKFLOW

1. Owner instructs Claude to draft content
2. Claude drafts in chat — does NOT commit
3. Claude flags any `[VERIFY]` items
4. Claude suggests anchor text options for cross-site links — owner chooses
5. Owner reviews and approves
6. Owner says "commit it"
7. Claude generates images via Worker (Chrome MCP), captures R2 keys
8. Claude commits article WITH images in one operation
9. Cloudflare deploys automatically

**Never commit an article without images. Never commit images separately as a follow-up step.**

---

*Owner: Russell Bewsell, Voice Recognition Australia*
*GitHub: github.com/SuntzuAU*
*Last updated: March 2026*
