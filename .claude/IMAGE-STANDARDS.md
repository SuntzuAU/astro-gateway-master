# Image Standards — Sizes, Naming, Prompts, Manifest Schema

All images across the VRA gateway network must follow these standards. This eliminates wasted time resizing, regenerating, or fixing layout issues caused by mismatched image dimensions.

## Standard Image Slots and Sizes

| Slot | Dimensions | Aspect Ratio | CSS Treatment | Used In |
|---|---|---|---|---|
| `hero` | 1200 x 675 | 16:9 | `aspect-ratio:16/9; object-fit:cover` | Hero section on index.astro |
| `about-banner` | 1200 x 675 | 16:9 | `.card-img` with `aspect-ratio:16/9` | About section |
| `feature-*` | 800 x 450 | 16:9 | `.card-img` with `aspect-ratio:16/9` | Feature cards |
| `benefits-banner` | 1200 x 400 | 3:1 | `.img-break` with `height:220px` | Cinematic strip after benefits |
| `workflow-banner` | 1200 x 400 | 3:1 | `.img-break` | Cinematic strip after how-it-works |
| `emr-banner` | 1200 x 400 | 3:1 | `.img-break` | Cinematic strip after EMR section |
| `cta-banner` | 1200 x 400 | 3:1 | `.img-break` styled inline | CTA section |
| Blog `heroImage` | 1200 x 675 | 16:9 | Full-width with `object-fit:cover` | News article hero |
| Blog `breakImage1` | 1200 x 400 | 3:1 | Cinematic strip in article body |
| Blog `breakImage2` | 1200 x 400 | 3:1 | Cinematic strip in article body |

## Key Rules

- **16:9 images** (hero, about, features) show people, workspaces, or product interfaces
- **3:1 images** (banners, breaks) are wide cinematic strips — think establishing shots, panoramic environments, abstract patterns. They are cropped heavily top and bottom so the subject must be in the centre band
- **Always specify the aspect ratio in the Gemini prompt** — e.g. "Wide cinematic banner (3:1 aspect ratio, 1200x400px) showing..."
- **Never generate a square or portrait image** — every slot in the template is landscape

## SEO Image Naming Convention

All filenames follow slug-first format for SEO:

```
{site-id}/{yyyy}/{mm}/{dd}/{seo-slug}-{short-uuid}.{ext}
```

Examples:
- `dragonmedicalone/2026/03/17/dragon-medical-one-gp-dictation-hero-a7b3c2d1.jpg`
- `dictationsolutions/2026/03/16/digital-dictation-philips-speechmike-break1-e158022f.png`

### Naming rules
- Slug max length: 60 characters (before the UUID suffix)
- Use hyphens between words, lowercase only
- Include the product name and context keywords
- Include the slot type suffix: `-hero`, `-break1`, `-break2`, `-about`, `-feature-name`
- Short UUID is 8 hex chars from the Worker response
- File extension matches the generated format (usually `.jpg` or `.png`)

### When calling the Worker, set the `name` field to the SEO slug:
```json
{ "prompt": "...", "name": "dragon-medical-one-gp-dictation-hero" }
```

The Worker appends the UUID and extension automatically.

## Image Manifest Schema — Standard Fields

Every entry in `src/data/image-manifest.json` must include these fields:

```json
{
  "hero": {
    "key": "hero",
    "r2Key": "dragonmedicalone/2026/03/17/dragon-medical-one-hero-a7b3c2d1.jpg",
    "altText": "Descriptive SEO alt text for the image",
    "aspectRatio": "16:9",
    "slot": "hero",
    "contentType": "image/jpeg",
    "site": "dragonmedicalone"
  }
}
```

| Field | Required | Description |
|---|---|---|
| `key` | Yes | Matches the slot name used in `imgSrc()` calls |
| `r2Key` | Yes | Full R2 object path (without base URL) |
| `altText` | Yes | SEO-focused, descriptive, includes product name and context |
| `aspectRatio` | Yes | `16:9` or `3:1` — must match the slot standard |
| `slot` | Yes | One of: hero, about-banner, feature-*, benefits-banner, workflow-banner, emr-banner, cta-banner |
| `contentType` | Yes | `image/jpeg`, `image/png`, or `image/webp` |
| `site` | Yes | Site identifier matching R2 folder prefix |
| `generatedAt` | Optional | ISO timestamp if auto-generated |
| `manual` | Optional | `true` if uploaded manually rather than generated |

## Prompt Templates

When preparing image generation prompts, use these templates as starting points:

### Hero (16:9)
```
Photorealistic, professional photograph. [Subject doing action] in a [setting]. 
Warm natural lighting, shallow depth of field, modern Australian [workplace type]. 
No text, no logos, no watermarks. 16:9 aspect ratio, 1200x675px.
```

### Feature card (16:9)
```
Photorealistic close-up. [Specific detail or interaction]. Clean modern environment, 
soft studio lighting, professional quality. No text overlays. 16:9, 800x450px.
```

### Cinematic strip / break image (3:1)
```
Ultra-wide cinematic banner, 3:1 aspect ratio (1200x400px). [Panoramic scene or 
abstract environment]. Subject centred vertically (image will be cropped top and bottom). 
Professional photography style, moody lighting. No text, no logos.
```

### Blog hero (16:9)
```
Editorial photograph for a professional article about [topic]. [Scene description]. 
Clean, modern, Australian context. Natural lighting. No text, no logos. 16:9, 1200x675px.
```

## Blog Article Image Rules

- Every blog post needs 3 images: `heroImage` (16:9), `breakImage1` (3:1), `breakImage2` (3:1)
- Images are referenced in frontmatter as R2 keys (NOT full URLs)
- The news template renders them using `PUBLIC_R2_BASE` + the key
- Alt text must be unique per image, include the article topic, and be genuinely descriptive
- NEVER hardcode full R2 URLs in article markdown body — use frontmatter fields

### Correct frontmatter:
```yaml
heroImage: "dragonmedicalone/2026/03/17/dragon-medical-one-buying-guide-hero-a7b3c2d1.jpg"
heroImageAlt: "Australian clinician reviewing Dragon Medical One speech recognition options with VRA support team"
breakImage1: "dragonmedicalone/2026/03/17/dragon-medical-one-emr-setup-break1-b4c5d6e7.jpg"
breakImage1Alt: "Dragon Medical One integrated with Best Practice EMR on a clinic workstation"
breakImage2: "dragonmedicalone/2026/03/17/dragon-medical-one-trial-microphone-break2-c8d9e0f1.jpg"
breakImage2Alt: "Clinician using PowerMic during Dragon Medical One free trial in Australian practice"
```

### WRONG — hardcoded URLs in body:
```markdown
<img src="https://pub-c7a09e1ddb7c45e6a38fcdca1e4b6897.r2.dev/dragonmedicalone/2026/..." />
```

## Pre-Generation Checklist

Before generating any images, Claude must:

1. List all image slots needed for this page/article
2. Write the prompt for each, specifying aspect ratio and dimensions
3. Write the SEO filename (name field) for each
4. State the total number of Worker API calls
5. Present all of the above to Russ and wait for approval
6. Only then generate using whichever method is available
