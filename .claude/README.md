# .claude/ — Mandatory Reading for All Claude Sessions

This folder contains the complete instruction set for building and maintaining this VRA gateway site.

**Read every file in this folder before writing any code or content.**

After reading this folder, also read these data files:
- `src/data/link-network.json` — the master interlink network config (anchor pools, bridge phrases, authority language)
- `src/site.config.json` — this site's content, colours, products, CTAs
- `src/data/link-usage.json` — what has already been linked from this site
- `src/content/news/` — existing blog posts (check slugs, context tags, existing links)

## Files in this folder

| File | Purpose |
|---|---|
| `CONTENT-GUIDELINES.md` | Legal compliance (ACL), pricing rules, medical content restrictions, voice/tone, competitor comparison rules |
| `BUILD-RULES.md` | Architecture pattern, deployment config, content collection standard, image generation workflow, CSS rules, form rules, YouTube facade |
| `INTERLINK-RULES.md` | Cross-site and internal linking system, anchor text rules, frontmatter requirements, approval workflow, pre-commit checklist |
| `INFRASTRUCTURE.md` | GA4 Measurement IDs, GitHub repos, Cloudflare config, R2/Worker endpoints, ActiveCampaign form IDs, deployment checklist |
| `IMAGE-STANDARDS.md` | Image sizes by slot, aspect ratios, SEO naming convention, manifest schema, prompt templates |

## Why this folder exists

Previous builds failed because Claude sessions skipped instruction files and invented their own structure. Every structural mistake traced back to not reading the references. This folder puts everything in one place so you can read it all before starting.

**Your first message to any new session should be: "Read everything in the .claude folder first."**

## Reference document

A Word version of the infrastructure reference (`VRA-GA-Infrastructure-Reference.docx`) is stored in the Claude Project files and should be uploaded at the start of any session involving a new site build.
