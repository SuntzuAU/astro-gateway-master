# New Site Kickoff — Paste Into a Fresh Claude Session

This is the prompt template for starting a new site build. Copy the template below, fill in the [BRACKETED] values, and paste into a new Claude conversation in the VRA Gateway Sites Project.

---

## Template

```
We are building a new gateway site: [DOMAIN]

Product: [PRODUCT NAME]
Site type: [gateway / saas / authority]
Repo name: [REPO_NAME] (create under SuntzuAU if it doesn't exist yet)
GA4 ID: [G-XXXXXXXXXX]
ActiveCampaign form ID: [NNN]
ActiveCampaign or UUID: [UUID from AC]

Start by reading every file in the .claude/ folder of astro-gateway-master via GitHub MCP. Then read src/site.config.json and src/data/link-network.json from the master. Confirm what you've read before proceeding.

Then work through this build in order:

PHASE 1 — REPO SETUP
- Create the new repo under SuntzuAU (use create_or_update_file with a README first, then push_files for everything else)
- Clone the full file structure from astro-gateway-master
- Update src/site.config.json with all content for this site (I will provide copy, or draft it for my approval)
- Update src/data/link-usage.json — set thisSite to [DOMAIN], reset all counts to 0
- Copy ACForm.template.astro to src/components/ACForm.astro — change ONLY the form ID ([NNN]), or UUID, and cfields
- Set googleAnalyticsId to [G-XXXXXXXXXX]
- Ensure public/logo.jpg exists (I will provide the logo file)

PHASE 2 — CONTENT
- Draft the site.config.json content for my approval (headline, subheadline, benefits, features, FAQs, comparison table, stats, CTAs)
- All content must follow .claude/CONTENT-GUIDELINES.md
- Use Australian spelling throughout
- Do NOT commit content until I approve it

PHASE 3 — IMAGES
- List all image slots needed (check .claude/IMAGE-STANDARDS.md for sizes)
- Write a prompt for each image with the correct aspect ratio specified
- Write the SEO filename (name field) for each
- State the total number of Worker API calls
- Present all prompts to me and WAIT for my approval before generating
- Use whichever generation method is available (Chrome MCP fetch, manual Cloudflare dashboard, or curl)
- If images can't be generated right now, commit with placeholders and do images in a follow-up

PHASE 4 — DEPLOY
- The moment all files are committed, IMMEDIATELY present the full deployment checklist from .claude/INFRASTRUCTURE.md with these values pre-filled:
  - Domain: [DOMAIN]
  - Repo: SuntzuAU/[REPO_NAME]
  - GA4 ID: [G-XXXXXXXXXX]
  - Form ID: [NNN]
  - R2 base: https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev

PHASE 5 — BLOG CONTENT
- Draft 2-3 initial news articles for my approval
- Each article MUST have:
  - internalLinks and externalLinks in frontmatter (read link-network.json and link-usage.json FIRST)
  - Links embedded naturally during drafting, not retrofitted
  - heroImage, breakImage1, breakImage2 fields (generate after approval)
  - Bridge paragraph in the conclusion using the adjacency map
- Present link summary at the end of each draft
- Do NOT commit until I approve

PHASE 6 — NETWORK UPDATE
- Add [DOMAIN] to link-network.json in ALL other repos (astro-gateway-master, pdfsoftware, dragonprofessional16, dragonnaturallyspeaking, dictationsolutions, dragonmedicalone)
- Include anchor text pools for the new site

Remember:
- voicerecognition.com.au is the PRIMARY Shopify site — never modify it, gateway sites link TO it
- No footer links ever — all links contextual in body copy
- Never use emoji in site.config.json
- Phone field in the form is NEVER required
- YouTube videos use the facade pattern (thumbnail + click-to-load)
- Both apex and www domains must be added in Cloudflare Pages
```

---

## Quick Reference — Sites Pending Build

| Site | Type | GA4 ID | Form ID | Notes |
|---|---|---|---|---|
| speechrecognition.cloud | saas | G-59XRLJXSS1 | TBC | Next build — SRC SaaS platform |
| cloudprinting.au | gateway | G-5JQ8BG0E6T | TBC | PrintX product |
