import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    metaDescription: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    breakImage1: z.string().optional(),
    breakImage1Alt: z.string().optional(),
    breakImage2: z.string().optional(),
    breakImage2Alt: z.string().optional(),
    section1Title: z.string().optional(),
    section2Title: z.string().optional(),
    section3Title: z.string().optional(),
  }),
});

export const collections = { news };
