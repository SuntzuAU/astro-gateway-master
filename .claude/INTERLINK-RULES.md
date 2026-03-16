# Interlink Rules — Cross-Site and Internal Linking

## Why This Matters

Each internal link builds page authority within a site. Each cross-site link builds a network effect across the full domain portfolio. Search engines follow these links to determine relevance and authority. Every piece of content published anywhere in the network should benefit every site.

## Rules — Non-Negotiable

- **No footer links. Ever.** All links must be contextual — woven naturally into body copy.
- Every blog post must declare `internalLinks` and `externalLinks` in frontmatter
- Min 1 internal link per post, max 3
- Min 1 external link per post, max 2
- Never link to the same external site twice on one page
- Never repeat the same anchor text to the same destination across the site
- All links must feel natural within the sentence — not bolted on

## Before Writing Any Content

1. Read `src/data/link-network.json` for:
   - Full network of sites with URLs and topic tags
   - Anchor text pools organised by context (brand, descriptive, medical, legal, action, comparison)
   - Bridge phrases for weaving links into conclusions
   - Adjacency map (which product categories naturally link to each other)
   - Authority language block (approved VRA/Russell claims)

2. Read `src/data/link-usage.json` for:
   - `thisSite` — which site you are working on
   - Coverage counts — how many times each network site has been linked from here
   - `anchorsUsed` — which anchor texts have already been used for each destination

3. Pick your external link target:
   - Choose the site with the **lowest coverage count** that has a relevant topic match
   - If no relevant match, use lowest coverage regardless
   - Select anchor text from the appropriate pool in link-network.json
   - Check it hasn't already been used (in link-usage.json anchorsUsed)

## Blog Post Frontmatter Standard

```yaml
---
title: "Post Title"
date: "2026-03-16"
description: "Meta description 140-160 chars"  # or metaDescription on some sites
context: "descriptive"  # Options: medical, legal, descriptive, brand, action, comparison, generic
heroImage: "site/yyyy/mm/dd/seo-slug-hero-uuid.png"
heroImageAlt: "Descriptive alt text"
breakImage1: "site/yyyy/mm/dd/seo-slug-break1-uuid.png"
breakImage1Alt: "Descriptive alt text"
breakImage2: "site/yyyy/mm/dd/seo-slug-break2-uuid.png"
breakImage2Alt: "Descriptive alt text"
internalLinks:
  - to: "/news/related-post"
    anchor: "descriptive anchor text"
externalLinks:
  - to: "voicerecognition.com.au"
    anchor: "authorised Dragon reseller Australia"
    url: "https://www.voicerecognition.com.au"
---
```

## The Productivity Bridge

All sites in the network address the same universal problem: professionals spending too much time on documentation instead of their actual work. Dragon solves the input problem. PDF software solves the output problem. Cloud printing removes the last manual step.

Use the adjacency map in link-network.json to find the most logical adjacent product for the conclusion paragraph, then use bridge phrase templates to make the mention natural.

## Draft Checklist

Before presenting any draft for review, confirm:
- [ ] Internal link included with descriptive anchor text
- [ ] Cross-site link included (or flagged as pending if no live site available)
- [ ] Cross-site target is NOT the same as the previous post
- [ ] Anchor text is NOT already used for that destination on this site
- [ ] Both links feel natural — not forced
- [ ] "Links used" summary at end of draft:

```
---
LINKS USED IN THIS POST
Internal: [anchor text] -> [URL]
Cross-site: [anchor text] -> [domain]
```

## Anchor Text Approval

Claude must suggest 2-3 anchor text options for cross-site links and let the owner choose. Never commit without approval on the anchor text.
