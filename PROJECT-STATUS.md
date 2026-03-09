# Project Status — VRA Gateway Sites

**Last updated: March 2026**

---

## Sites

| Domain | Product | Repo | Status |
|---|---|---|---|
| pdfsoftware.com.au | Tungsten Power PDF | astro-gateway-master | Live on Cloudflare Pages |
| dragonprofessional16.com.au | Dragon Professional 16 | TBD (clone from master) | Planned — next to build |
| speechrecognition.com.au | Dragon / SRC | TBD | Planned |
| ocrsoftware.com.au | OmniPage OCR | TBD | Planned |
| documentmanagement.com.au | PaperPort | TBD | Planned |
| workflowautomation.com.au | Tungsten TotalAgility | TBD | Planned |
| invoiceprocessing.com.au | Tungsten AP Automation | TBD | Planned |

---

## Template status (astro-gateway-master)

### Working
- Hero, stats bar, benefits, pricing, TCO table, about, how it works, features, FAQ, contact, footer
- Sticky nav with anchor links + News link
- Blog posts with Astro content collections (src/content/news)
- GitHub Actions pipeline: generate-images.js (Phase 1 site images + Phase 2 blog images)
- Cloudflare Worker (master-image-generator) generating images into R2
- SEO-first image naming: seoSlug-uuid.ext (slug before UUID for human-readable R2 keys)
- image-manifest.json storing r2Key + altText per image
- CROSS-SITE-LINKS.md — interlink database for the full network

### Known issues / pending
- site.config.json stats still shows old values (70+ countries, 25+ years) — needs: 15M+ users, 40 years
- DNS for pdfsoftware.com.au not yet pointed
- No /privacy or /terms pages
- No CRM form embed (placeholder only)
- Decap CMS deferred
- Email-based blog review workflow: designed (see below), not yet deployed

---

## Email review workflow (designed, pending deployment)

See EMAIL-REVIEW-WORKFLOW.md for full design. Summary:
1. Claude drafts post, pushes to a `draft/` branch, opens a PR
2. GitHub Actions emails the draft to owner (via SendGrid/Mailgun action)
3. Owner replies with APPROVE or edits inline
4. A second workflow (or owner manually merges PR) publishes to main
5. Cloudflare Pages auto-deploys on merge

---

## Cloudflare Worker

- Worker: master-image-generator
- URL: https://master-image-generator.speech-recognition-cloud.workers.dev/generate
- Binding: GATEWAY_IMAGES (R2 bucket)
- R2 public base: https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev
- SEO filename format: seoSlug-uuid.ext (slug-first, UUID suffix for uniqueness)

---

## Next actions

1. Clone astro-gateway-master to dragonprofessional16 repo
2. Create site.config.json for Dragon Professional 16
3. Create image.prompts.json for Dragon Professional 16
4. Point DNS: pdfsoftware.com.au
5. Fix stats values in pdfsoftware site.config.json
6. Deploy email review workflow
