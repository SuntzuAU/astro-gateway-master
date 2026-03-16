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
| `BUILD-RULES.md` | Architecture pattern, deployment config, content collection standard, image generation workflow, CSS rules |
| `INTERLINK-RULES.md` | Cross-site and internal linking system, anchor text rules, frontmatter requirements, approval workflow |

## Why this folder exists

Previous builds failed because Claude sessions skipped instruction files and invented their own structure. Every structural mistake traced back to not reading the references. This folder puts everything in one place so you can read it all before starting.

**Your first message to any new session should be: "Read everything in the .claude folder first."**
