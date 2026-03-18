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

## Site Type Variants

Not every site in the network is a product gateway. The `siteType` field in `site.config.json` controls which sections render:

- `"siteType": "gateway"` — default. Hero, stats bar, benefits, pricing, comparison table, features, about, FAQ, CTA form.
- `"siteType": "saas"` — SaaS product (e.g. speechrecognition.cloud). Hero, video, pricing tiers, feature grid, integrations, FAQ, signup CTA.
- `"siteType": "authority"` — content hub (e.g. voicerecognition.com.au redesign). Hero, featured articles, category navigation, about, newsletter CTA.

When building index.astro for a new site, wrap each section in a conditional: `{(site.siteType === 'gateway' || !site.siteType) && ( ... )}`. This keeps one template file but allows different layouts per site.

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
- YouTube/video embeds MUST use the facade pattern (see YouTube Facade section below)
- All images except hero: `loading="lazy"` and `decoding="async"`
- Hero images: `loading="eager"`
- Inline critical CSS using `is:inline` for above-the-fold content
- No third-party render-blocking scripts
- System fonts where possible; custom fonts use `font-display: swap`
- Mobile first: all layouts must work at 375px minimum

## YouTube Facade Pattern — MANDATORY

Never load a YouTube iframe at page load. Always use a click-to-load facade. This saves 500KB+ of JS on initial load.

The working reference implementation is in `dragonmedicalone/src/pages/index.astro` under the `.yt-facade` class. Copy it exactly:

1. Show a thumbnail image: `https://i.ytimg.com/vi/{YOUTUBE_ID}/maxresdefault.jpg` with `loading="lazy" decoding="async"`
2. Overlay a play button (red, centred)
3. On click, replace the entire element content with an iframe: `https://www.youtube-nocookie.com/embed/{ID}?autoplay=1&rel=0&modestbranding=1`
4. Use `youtube-nocookie.com` (not `youtube.com`) for privacy
5. The facade container uses `padding-bottom:56.25%` for 16:9 aspect ratio

```html
<div class="yt-facade" data-ytid="{YOUTUBE_ID}">
  <img src="https://i.ytimg.com/vi/{YOUTUBE_ID}/maxresdefault.jpg" alt="Video description" loading="lazy" decoding="async" />
  <div class="yt-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
</div>
<script>
  document.querySelectorAll('.yt-facade').forEach(function(el) {
    el.addEventListener('click', function() {
      var id = el.dataset.ytid;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      el.innerHTML = '';
      el.appendChild(iframe);
    });
  });
</script>
```

Do NOT deviate from this pattern. Do NOT load YouTube JS/iframe at page load under any circumstances.

## CLOUDFLARE PAGES DEPLOYMENT — PRESENT THIS CHECKLIST AUTOMATICALLY

**TRIGGER RULE: The moment the last file commit for a new site build is complete, Claude MUST immediately present this full checklist to Russ with the specific values for that site pre-filled. Do not wait to be asked. Do not continue to other tasks. The deployment is the next step.**

### Deployment Checklist (copy and present with site-specific values)

1. **Create Cloudflare Pages project:**
   - Go to dash.cloudflare.com -> Pages -> Create a project -> Connect to Git
   - Select organisation: `SuntzuAU` -> select repo: `[REPO_NAME]`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Add environment variable: `PUBLIC_R2_BASE` = `https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev`
   - Click Save and Deploy

2. **Add custom domains (BOTH required):**
   - Go to Pages -> [project] -> Custom domains -> Add a custom domain
   - Add `[DOMAIN]` (apex)
   - Add `www.[DOMAIN]`
   - Wait for both to show status: Active

3. **Verify DNS at registrar:**
   - Crazy Domains nameservers must point to Cloudflare (check zone for assigned pair)
   - After step 2, Cloudflare Pages auto-creates DNS records
   - Delete any old A records pointing to previous hosts (Hostinger, SiteGround etc.)

4. **Verify in browser:**
   - Test `https://[DOMAIN]` and `https://www.[DOMAIN]` in incognito
   - Check for redirect loops (check `public/_redirects` for self-referencing 301s)

5. **Post-deploy checks:**
   - GA4 firing (check Real Time in analytics.google.com) — GA4 ID: `[GA4_ID]`
   - ActiveCampaign form submitting — Form ID: `[FORM_ID]`
   - Images loading from R2
   - Mobile layout at 375px

**Never attempt to automate Cloudflare Pages setup via browser MCP. Always give Russ the manual steps.**

## ActiveCampaign Form — NEVER REWRITE

### CRITICAL RULE: Copy the template, never start from scratch

The frozen form template is `src/components/ACForm.template.astro` in `astro-gateway-master`. When building a new site:

1. Copy `ACForm.template.astro` to `src/components/ACForm.astro`
2. Change ONLY these values (all found in `site.config.json` under `form`):
   - Form ID number (e.g. 283 -> 289)
   - The `or` hidden field UUID
   - The `cfields` mapping if the form has different custom fields
   - The submit button colour (driven from `site.colours.accent`)
3. Do NOT change anything else. Do NOT add validation. Do NOT change field types.

### Phone field rules
- The phone field has NO `required` attribute — it is always optional
- Input type is `text` not `tel` — ActiveCampaign's intl-tel-input handles the rest
- Do NOT add `type="tel"` or `required` to the phone field under any circumstances
- Any format is accepted via the widget

### Form heading placement
The heading ("Get in touch") and subtext sit OUTSIDE the white `.formbox` card. On dark CTA backgrounds they must be white. On light backgrounds they use dark text. Check the section background before styling.

### Form IDs per site

| Site | Form ID |
|---|---|
| pdfsoftware.com.au | 281 |
| dragonprofessional16.com.au | 283 |
| dragonnaturallyspeaking.com.au | 285 |
| dragonmedicalone.au | 289 |
| dictationsolutions.com.au | TBC |

### Form config in site.config.json

```json
"form": {
  "formId": "289",
  "orUuid": "55459e75-589b-4fbf-9c06-f7a873049b56",
  "submitText": "Request a Free Trial",
  "cfields": { "35": "practice_organisation", "18": "comments_about_your_needs" }
}
```

## Image Generation — Three Methods

**Every blog post requires three images:** `heroImage`, `breakImage1`, `breakImage2` (plus alt text for each). See `.claude/IMAGE-STANDARDS.md` for exact sizes, naming, and prompt templates.

**NEVER generate images without owner approval. Present all prompts and expected API call count FIRST.**

### Method 1 (preferred): Claude calls Worker directly via fetch

If Chrome MCP is available, use `javascript_tool` to POST:

```javascript
fetch('https://master-image-generator.speech-recognition-cloud.workers.dev/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: '...', name: 'seo-slug-here' })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)))
```

### Method 2: Russ triggers manually in Cloudflare dashboard

Claude prepares the exact JSON payloads and presents them as copy-paste blocks:

```
Endpoint: POST https://master-image-generator.speech-recognition-cloud.workers.dev/generate
Body:
{ "prompt": "...", "name": "seo-slug-here" }
```

Russ pastes into Worker HTTP test panel. Russ pastes back the R2 keys. Claude commits to image-manifest.json.

### Method 3: curl commands

```bash
curl -X POST https://master-image-generator.speech-recognition-cloud.workers.dev/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "...", "name": "seo-slug-here"}'
```

### NEVER stall the build waiting for images

If image generation fails or is delayed, commit the site with placeholder divs. The `imgSrc()` helper already shows a coloured fallback when no image exists. Generate images in a follow-up step.

**SEO image naming:** slug-first format. See IMAGE-STANDARDS.md for the full naming convention.

## Technical Gotchas

- Never use emoji/special Unicode in `site.config.json` — GitHub API corrupts during base64 encoding
- YAML frontmatter must have spaces after colons
- `push_files` cannot modify `.github/workflows/` files — provide content for manual paste
- Both apex and www must be added as Cloudflare Pages custom domains
- Cloudflare Pages 301 redirects are cached aggressively — test in incognito
- Logo files are JPEG (`public/logo.jpg`) — index.astro references `/logo.jpg`
