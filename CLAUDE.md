# CLAUDE.md

**STOP. Before doing anything, read every file in the `.claude/` folder in this repo.**

That folder contains the complete instruction set for this site: legal compliance rules, linking system, architecture patterns, image generation rules, content approval workflow, and deployment config.

After reading `.claude/`, also read:
- `src/data/link-network.json` — anchor pools, bridge phrases, authority language
- `src/site.config.json` — this site's content, colours, products
- `src/data/link-usage.json` — what has already been linked from this site
- `src/content/news/` — existing blog posts

**Do not write code or content until you have read all of the above.**

## CRITICAL RULES — NEVER VIOLATE

1. **voicerecognition.com.au is the PRIMARY Shopify site.** Gateway sites link TO it. Never redesign it.
2. **Never invent domains.** Only use the verified list in `src/data/link-network.json`.
3. **No footer links. Ever.** All links contextual in body copy.
4. **Never commit content without explicit owner approval.** Draft in chat, wait for "commit it".
5. **Never use emoji or special Unicode in `site.config.json`.** Breaks Astro builds via GitHub API.
6. **Never generate images without owner approval.** Show prompts first, wait for "go".
7. **All content must comply with Australian Consumer Law.** See `.claude/CONTENT-GUIDELINES.md`.

---
*Owner: Russell Bewsell, Voice Recognition Australia | github.com/SuntzuAU | March 2026*
