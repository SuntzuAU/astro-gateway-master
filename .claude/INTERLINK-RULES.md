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

## CRITICAL RULE: Body Links Must Match Frontmatter

Every hyperlink that appears in an article's body copy MUST also be declared in the frontmatter `internalLinks` or `externalLinks` arrays. Links without frontmatter declarations are invisible to the automated tracking system (`update-link-usage.js`) and will not be counted toward coverage.

Claude must not commit an article that has body links missing from frontmatter, or frontmatter links missing from the body.

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
description: "Meta description 140-160 chars"
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

## Pre-Commit Link Audit Checklist

**Claude MUST verify every item before presenting a draft for approval:**

- [ ] Read link-network.json — know what anchor pools and bridge phrases are available
- [ ] Read link-usage.json — know what has already been linked
- [ ] Internal link included with descriptive anchor text
- [ ] Internal link declared in `internalLinks` frontmatter AND present in body
- [ ] Cross-site link target chosen (lowest coverage count with relevant topic match)
- [ ] Cross-site anchor text selected from appropriate pool, not already used
- [ ] Cross-site link declared in `externalLinks` frontmatter AND present in body
- [ ] Bridge paragraph uses adjacency map (conclusion paragraph)
- [ ] No duplicate links to same external site on one page
- [ ] All body hyperlinks have matching frontmatter declarations
- [ ] Present link summary at end of draft:

```
---
LINKS USED IN THIS POST
Internal: [anchor text] -> [URL]
Cross-site: [anchor text] -> [domain] (coverage count before: N)
```

## Anchor Text Approval

Claude must suggest 2-3 anchor text options for cross-site links and let the owner choose. Never commit without approval on the anchor text.

## Embedding Links During Article Creation — Not After

Links MUST be woven into the article during initial drafting — not retrofitted later. This is faster and produces more natural-reading content. Claude should:

1. Identify link targets BEFORE writing the article
2. Plan which paragraphs will contain links
3. Write the link context as part of the natural flow
4. Include the bridge paragraph in the conclusion

Retrofitting links after an article is written produces awkward, unnatural placements that readers and search engines can detect.
