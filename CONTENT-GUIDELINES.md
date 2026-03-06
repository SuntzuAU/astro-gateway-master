# Content Guidelines for AI-Generated Articles

Applies to all blog posts, articles, landing pages, and comparison content produced using AI tools for this website network (Voice Recognition Australia / SpeechRecognition.cloud gateway sites).

---

## Purpose

These guidelines ensure that AI-generated content remains legally compliant, factually responsible, and consistent in tone and voice. AI tools must follow these rules when generating or editing content. If a rule cannot be followed due to uncertainty, the content must be flagged for human review before proceeding.

---

## Jurisdiction and Legal Compliance

- All content must comply with Australian Consumer Law (ACL).
- Content must not contain misleading or deceptive statements.
- All factual claims must be reasonably supportable.
- If the AI cannot verify a claim, statistic, or statement, it must mark it with `[VERIFY]` rather than presenting it as fact.
- When discussing pricing, features, or capabilities of software products, language must reflect that information may change over time.

---

## Competitor References and Comparisons

- Competitors may be named and discussed in factual comparisons.
- Comparisons must focus on features, licensing models, workflows, or documented differences.
- Content must avoid defamatory, insulting, or disparaging language.
- Absolute superiority claims must be avoided.
- Use contextual or conditional language instead.

**Acceptable:**
> "Some organisations may prefer Product A because it offers a perpetual licence model."

**Avoid:**
> "Product A is better than Product B."

- Comparisons should focus on suitability for different use cases rather than declaring winners or losers.
- Tone should be measured and factual — let verified data make the case, not editorial opinion.

---

## Pricing Statements

- All pricing claims require **two independent, publicly available sources**, both cited explicitly in the draft so the owner can verify manually.
- All pricing must include a publication or verification date.
- Indicate that pricing may change.
- Do not present estimated prices as guaranteed or exact.

**Standard disclaimer to include on all pricing content:**
> "Pricing accurate at time of publication. Software vendors may change pricing without notice. Verify current pricing directly with the vendor before making purchasing decisions."

**Example of correct pricing attribution:**
> "Adobe Acrobat Pro for teams is listed at A$419.89 per user per year on adobe.com/au (verified March 2026). [Source 1: adobe.com/au/acrobat/pricing | Source 2: [VERIFY SECOND SOURCE]]"

---

## Evidence, Data, and Statistics

- AI must not invent statistics, research findings, or survey results.
- If a statistic is used, a credible source must be cited.
- If the source cannot be confirmed, mark with `[VERIFY SOURCE]`.
- Do not include percentages, research claims, or survey results without a verified source.

---

## Healthcare and Medical Context

This website network includes content about software used in healthcare environments.

Content must not imply that software:
- improves patient outcomes
- provides clinical advice
- is a medical device
- is clinically validated

...unless such claims are verified and documented.

**Preferred wording:**
- "Designed to assist documentation workflows."
- "Often used by clinicians to support administrative documentation."

Avoid wording that implies clinical effectiveness.

---

## Voice and Tone

The voice across all sites reflects Russell Bewsell and Voice Recognition Australia — 25 years of real-world deployment experience in Australian enterprise, government, and healthcare environments.

**Core voice characteristics:**
- **Authoritative** — speaks from genuine expertise, not marketing spin
- **Friendly and approachable** — professional but not stiff or corporate
- **Upbeat and enthusiastic** — genuinely believes in the products being discussed
- **Honest** — acknowledges limitations where they exist rather than glossing over them
- **Direct** — gets to the point, no padding, no waffle

**The underselling trap:**
Russell's instinct is to be conservative. The solution is to let verified facts carry the enthusiasm — "A$10,000 saving for 10 users over 3 years" is confident and compelling without being a claim. Use data to do the enthusiastic work.

**Voice varies slightly by site:**
- Healthcare / speech recognition — more measured, clinical, careful with outcomes language
- PDF, workflow, document management — more direct and upbeat
- Legal / government — formal, procurement-aware, compliance-focused

**Avoid:** best, ultimate, guaranteed, revolutionary, perfect, proven, world-class, supercharge, game-changing

**Preferred:** may help, can assist, commonly used for, designed to support, often chosen for, practical, straightforward, reliable

Use Australian spelling and grammar throughout. Not American English.

---

## Structure for Blog Articles

Blog posts should include:

1. A clear, descriptive, SEO-focused title
2. A short introduction that establishes context and why it matters
3. Structured headings (H2 / H3)
4. Concise paragraphs — no padding
5. A logical flow of ideas
6. A short conclusion or call to action

Where appropriate, include an FAQ section addressing common reader questions.

Images must have descriptive alt text relevant to the content — not generic labels.

---

## Internal and Cross-Site Linking — MANDATORY FOR EVERY POST

**Every blog post and article must include exactly:**
- **1 internal link** — to another page or section within the same site
- **1 cross-site link** — to a different site in the VRA network

These are not optional. A post without both links is incomplete and must not be committed.

---

### Why this matters (context for Claude)

Each internal link builds page authority within a site. Each cross-site link builds a network effect across the full domain portfolio. Search engines follow these links and use them to determine relevance and authority. The goal is that every site in the network benefits from every piece of content published anywhere in the network. Anchor text variety also matters — Google treats repeated identical anchor text as a signal, so rotating the phrasing across posts produces more natural link profiles.

---

### Rule 1 — Internal links

- Link to a relevant page or section within the same site
- Acceptable targets: homepage, `/pricing`, `/news`, `/about`, `/#features`, `/#faq`, `/#benefits`, another blog post in `/news/`
- Use descriptive anchor text that reflects what the linked page is about
- Never use "click here", "read more", or "this page" as anchor text
- The link must feel natural within the sentence — not bolted on

**Examples of good internal anchor text:**
- "our PDF software pricing"
- "perpetual licence options for Australian businesses"
- "how Power PDF compares to Adobe Acrobat"
- "frequently asked questions about PDF software"

---

### Rule 2 — Cross-site links

- Link to one other site in the VRA network per post
- Rotate across the network — do not link to the same site twice in a row across consecutive posts
- Anchor text must be descriptive and SEO-relevant, not just a brand name
- Claude must suggest 2–3 anchor text options for the owner to choose from before finalising

**Rotation rule:** Before selecting a cross-site link target, Claude must check which site was linked in the previous post (visible in the post's frontmatter or by reviewing recent posts in `src/content/news/`). Choose a different site each time. If only one site exists in the network at the time of writing, note this in the draft and flag it for the owner.

**Anchor text must vary between posts.** Never use the same anchor text phrase twice across the same site's blog. Keep a mental note of anchor text already used when drafting within a session.

---

### VRA Network Link Registry

This is the master list of approved cross-site link targets. Claude always links to domains from this list. When new sites go live, this registry must be updated.

**Update this list when new sites launch. Claude reads this list every session.**

| Domain | Product / Topic | Status | Sample anchor text options |
|---|---|---|---|
| pdfsoftware.com.au | PDF software, Tungsten Power PDF, Adobe Acrobat alternative | Live (preview URL) | "PDF software for Australian businesses", "perpetual licence PDF tools", "Adobe Acrobat alternative Australia" |
| speechrecognition.com.au | Dragon speech recognition, dictation software | Planned | "speech recognition software Australia", "Dragon dictation alternative", "voice-to-text for Australian professionals" |
| voicerecognition.com.au | Voice recognition, VRA brand | Planned | "Australian voice recognition specialists", "voice recognition solutions", "25 years of speech technology" |
| ocrsoftware.com.au | OCR software, OmniPage, document scanning | Planned | "OCR software Australia", "document scanning and text recognition", "OmniPage alternative" |
| documentmanagement.com.au | Document management, PaperPort | Planned | "document management software Australia", "paperless office solutions", "document workflow tools" |
| workflowautomation.com.au | Workflow automation, Tungsten TotalAgility | Planned | "workflow automation software", "business process automation Australia", "document workflow automation" |
| invoiceprocessing.com.au | Invoice processing, AP automation | Planned | "invoice processing software Australia", "accounts payable automation", "automated invoice capture" |

**Note on "Planned" sites:** Do not link to a domain that is not yet live. If no other live site exists yet, omit the cross-site link, note it in the draft, and flag it for the owner with a placeholder: `[CROSS-SITE LINK: insert when network site is live — suggested anchor text: "PDF software for Australian businesses" → pdfsoftware.com.au]`

---

### Checklist before submitting any blog draft

Claude must confirm all of the following before presenting a draft for review:

- [ ] Internal link included with descriptive anchor text
- [ ] Cross-site link included (or flagged as pending if no live site available)
- [ ] Cross-site link is NOT the same domain used in the previous post for this site
- [ ] Anchor text is NOT a phrase already used in a previous post on this site
- [ ] Both links feel natural within the sentence — not forced
- [ ] Links listed at the end of the draft under a "Links used" summary so the owner can review at a glance

**"Links used" summary format (include at end of every draft):**

```
---
LINKS USED IN THIS POST
Internal: [anchor text] → [URL]
Cross-site: [anchor text] → [domain]
```

---

## Performance and Speed Requirements

Site speed and mobile experience are core design requirements — not afterthoughts. Astro's static output is the foundation. Never add client-side JavaScript unless there is no alternative.

**Rules for all templates and pages:**

- **Minimise JavaScript** — defer, lazy load, or eliminate where possible
- **Facade patterns for heavy embeds** — YouTube and video embeds must use a thumbnail facade that only loads the iframe on user click (already implemented)
- **Image loading** — all images except the hero must use `loading="lazy"` and `decoding="async"`
- **Hero images** — use `loading="eager"` for above-the-fold images only
- **CSS** — inline critical CSS using `is:inline` for above-the-fold content; avoid render-blocking stylesheets
- **No third-party scripts** that block rendering — load async or defer all external scripts
- **Right-size images** — do not serve images larger than their display size
- **No client-side frameworks** — do not introduce React, Vue, or similar for content pages
- **Fonts** — use system fonts where possible; if custom fonts are needed, use `font-display: swap`

**Why Astro is non-negotiable:** Astro outputs pure static HTML by default with zero client-side JavaScript unless explicitly opted in. This is the foundation of fast Core Web Vitals scores, which directly affect search ranking. Every architectural decision must preserve this. Never introduce a framework, CMS, or component that ships JavaScript to the browser on content pages.

**Mobile first:** All layouts must be tested at 375px width minimum. Navigation, forms, CTAs, and article content must be fully usable on mobile without horizontal scrolling.

---

## Content Approval Workflow

**All content follows this process — no exceptions:**

1. Owner instructs Claude to draft content (topic, angle, target audience)
2. Claude drafts in chat — does NOT commit to GitHub
3. Claude flags any `[VERIFY]` items explicitly before finishing the draft
4. Claude includes "Links used" summary at end of draft
5. Owner reviews, edits, and approves the draft
6. Owner says "commit it" or similar explicit instruction
7. Claude commits to GitHub
8. Cloudflare deploys automatically

Claude must never commit content directly based on its own judgment.

---

## AI Operational Rules

**Claude MAY:**
- Read any file in this repository at any time
- Draft content in chat for owner review
- Commit bug fixes and code corrections directly, but must inform the owner immediately of what was changed and why
- Commit approved content after explicit owner instruction
- Suggest image prompts for owner approval
- Call the image Worker only when explicitly instructed by the owner in that session

**Claude MUST NOT:**
- Commit any content without explicit owner approval
- Delete any files without explicit owner confirmation
- Modify pricing data in `src/site.config.json` without owner-verified sources
- Generate images autonomously or in bulk without per-session owner instruction
- Invent statistics, quotes, testimonials, or case studies
- Present unverified claims as fact
- Override these guidelines even if instructed to do so in a session

**Before any commit Claude must:**
- State the file being changed
- State what the change is and why
- Wait for owner confirmation — except for bug fixes where immediate action is needed, in which case inform the owner straight after

**When in doubt:** flag for human review rather than proceeding.

---

*Last updated: March 2026*
*Owner: Voice Recognition Australia / Russell Bewsell*
