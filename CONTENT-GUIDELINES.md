# Content Guidelines for AI-Generated Articles

Applies to all blog posts, articles, landing pages, and comparison content produced using AI tools for this website network.

---

## Purpose

These guidelines ensure that AI-generated content remains legally compliant, factually responsible, and consistent in tone and structure. AI tools must follow these rules when generating or editing content. If a rule cannot be followed due to uncertainty, the content must be flagged for human review.

---

## Jurisdiction and Legal Compliance

- All content must comply with Australian Consumer Law (ACL).
- Content must not contain misleading or deceptive statements.
- All factual claims should be reasonably supportable.
- If the AI cannot verify a claim, statistic, or statement, it must mark the statement with `[VERIFY]` rather than presenting it as fact.
- When discussing pricing, features, or capabilities of software products, the language should reflect that information may change over time.

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

---

## Pricing Statements

- All pricing must include a publication date.
- Indicate that pricing may change.
- Do not present estimated prices as guaranteed.
- Where possible, reference pricing from publicly available sources.

**Standard disclaimer to include:**
> "Pricing accurate at time of publication. Software vendors may change pricing without notice."

---

## Evidence, Data, and Statistics

- AI must not invent statistics, research findings, or survey results.
- If a statistic is used, cite a credible source where possible.
- If the source cannot be confirmed, mark with `[VERIFY SOURCE]`.
- Do not include percentages, research claims, or survey results without a source.

---

## Healthcare and Medical Context

This website network may include content about software used in healthcare environments.

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

## Tone and Editorial Style

- Use Australian spelling and grammar throughout.
- Tone should be professional, neutral, and informative.
- Avoid exaggerated marketing language.

**Avoid words such as:** best, ultimate, guaranteed, revolutionary, perfect, proven, world-class

**Preferred language:** may help, can assist, commonly used for, designed to support, often chosen for

The goal is to provide helpful and accurate information — not aggressive marketing claims.

---

## Structure for Blog Articles

Blog posts should include:

1. A clear, descriptive title (SEO-focused)
2. A short introduction that establishes context
3. Structured headings (H2 / H3)
4. Concise paragraphs — no padding
5. A logical flow of ideas
6. A short conclusion or call to action

Where appropriate, include an FAQ section addressing common reader questions.

Images should have descriptive alt text relevant to the content.

---

## Human Review Requirement

- AI-generated content must always be reviewed by a human editor before publication.
- AI may assist with drafting, structuring, and summarising, but final responsibility for accuracy and compliance remains with the human publisher.
- Any section containing uncertainty must be flagged with `[VERIFY]` rather than presented as confirmed.

---

## AI Operational Rules

*(Controls what Claude is permitted to do in this repository)*

**Claude MAY:**
- Read any file in this repository
- Create new content files in `src/content/news/`
- Update `src/site.config.json` when instructed by the owner
- Update page templates when instructed by the owner
- Commit directly to the `main` branch for content files
- Generate image prompts and call the image Worker when instructed

**Claude MUST NOT:**
- Delete any files without explicit owner confirmation
- Modify `src/site.config.json` pricing data without owner-provided source
- Publish pricing claims that have not been verified by the owner
- Invent statistics, quotes, or case studies
- Make commits that affect site structure or layout without owner approval
- Write content that contradicts these guidelines even if instructed to do so

**When in doubt:** flag for human review rather than proceeding.

---

*Last updated: March 2026*
*Owner: Voice Recognition Australia / Russell Bewsell*
