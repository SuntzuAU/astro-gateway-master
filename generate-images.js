// generate-images.js
// Phase 1: Generate main site images from src/image.prompts.json
// Phase 2: Generate blog post images for any post with placeholder keys (default/ prefix)
// - Reads post frontmatter, derives prompts from title + section titles
// - Calls master-image-generator Worker, stores in R2
// - Writes real R2 keys back into markdown frontmatter
// - Skips posts where all images already have real keys

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WORKER_URL = process.env.IMAGE_WORKER_URL ||
  'https://master-image-generator.speech-recognition-cloud.workers.dev/generate';
const WORKER_TOKEN = process.env.ADMIN_TOKEN || '';
const SITE = process.env.SITE_ID || 'default';

if (!WORKER_URL) throw new Error('Missing IMAGE_WORKER_URL');

const cwd = process.cwd();
const outDir = path.join(cwd, 'public', 'generated');
const dataDir = path.join(cwd, 'src', 'data');
const manifestPath = path.join(dataDir, 'image-manifest.json');
const newsDir = path.join(cwd, 'src', 'content', 'news');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

let manifest = {};
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch { manifest = {}; }
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function isPlaceholder(key) {
  if (!key) return true;
  // Keys starting with 'default/' were auto-generated placeholders
  return key.startsWith('default/');
}

async function callWorker(prompt, name) {
  const headers = { 'Content-Type': 'application/json' };
  if (WORKER_TOKEN) headers['Authorization'] = `Bearer ${WORKER_TOKEN}`;
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, name, site: SITE }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(`Worker error ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function downloadImage(r2Key, localFilename) {
  const R2_BASE = process.env.R2_PUBLIC_BASE || '';
  if (!R2_BASE) return false;
  const url = `${R2_BASE.replace(/\/$/, '')}/${r2Key}`;
  const imgRes = await fetch(url);
  if (!imgRes.ok) { console.warn(`  Could not download ${url} (${imgRes.status})`); return false; }
  fs.writeFileSync(path.join(outDir, localFilename), Buffer.from(await imgRes.arrayBuffer()));
  console.log(`  Downloaded to public/generated/${localFilename}`);
  return true;
}

// ─── Phase 1: Site images from image.prompts.json ───────────────────────────

async function phase1() {
  const promptPaths = [
    path.join(cwd, 'src', 'image.prompts.json'),
    path.join(cwd, 'src', 'src', 'image.prompts.json'),
  ];
  const promptsPath = promptPaths.find(p => fs.existsSync(p));
  if (!promptsPath) { console.log('No image.prompts.json found — skipping site images.'); return; }

  const config = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
  if (!config?.images?.length) return;

  let count = 0;
  for (const img of config.images) {
    const key = (img.key || '').trim();
    const prompt = (img.prompt || '').trim();
    const name = (img.name || img.key || '').trim();
    if (!key || !prompt) continue;

    const entry = manifest[key];
    const localFile = path.join(outDir, path.basename(entry?.filename || ''));
    const upToDate = entry?.r2Key && entry.promptHash === sha256(prompt) && (entry.filename ? fs.existsSync(localFile) : true);
    if (upToDate) { console.log(`Skip site image (unchanged): ${key}`); continue; }

    console.log(`Generating site image: ${key}`);
    const result = await callWorker(prompt, name);
    const { r2 } = result;
    const seo = result.seo || {};
    manifest[key] = {
      key, r2Key: r2.key, filename: r2.filename, contentType: r2.contentType,
      bytes: r2.bytes, seoSlug: seo.slug || '', altText: seo.altText || prompt.slice(0, 120),
      prompt, promptHash: sha256(prompt), generatedAt: new Date().toISOString(), site: SITE,
    };
    console.log(`  R2: ${r2.key}`);
    if (r2.filename) await downloadImage(r2.key, r2.filename);
    count++;
  }
  console.log(`Phase 1 done. Site images generated/updated: ${count}`);
}

// ─── Phase 2: Blog post images ───────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([\w]+):\s*"?([^"\n]*)"?$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

function buildSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '');
}

function buildImagePrompt(type, title, section1, section2, siteName) {
  const base = siteName ? `${siteName} — ` : '';
  if (type === 'hero') {
    return `${base}Professional editorial photo illustrating: ${title}. Clean, modern, corporate Australian business environment, high quality photography style, no text overlays.`;
  }
  if (type === 'break1') {
    const topic = section1 || title;
    return `${base}Professional editorial photo illustrating: ${topic}. Australian enterprise or government context, documentary photography style, no text overlays.`;
  }
  if (type === 'break2') {
    const topic = section2 || section1 || title;
    return `${base}Professional editorial photo illustrating: ${topic}. Modern Australian workplace, technology in use, clean professional setting, no text overlays.`;
  }
  return `${base}${title}`;
}

function updateFrontmatterKey(content, field, value) {
  // Replace the value of a frontmatter field between the --- delimiters
  return content.replace(
    new RegExp(`(^---[\\s\\S]*?\n${field}:\s*)([^\n]+)(\n[\\s\\S]*?---)`),
    (_, pre, _old, post) => `${pre}"${value}"${post}`
  );
}

async function phase2() {
  if (!fs.existsSync(newsDir)) { console.log('No news directory — skipping blog images.'); return; }

  const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  if (!files.length) { console.log('No blog posts found.'); return; }

  // Try to get site name from site.config.json
  let siteName = '';
  try {
    const configPath = path.join(cwd, 'src', 'site.config.json');
    if (fs.existsSync(configPath)) {
      siteName = JSON.parse(fs.readFileSync(configPath, 'utf8')).siteName || '';
    }
  } catch {}

  let count = 0;
  for (const file of files) {
    const filePath = path.join(newsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);

    const needsHero = isPlaceholder(fm.heroImage);
    const needsBreak1 = isPlaceholder(fm.breakImage1);
    const needsBreak2 = isPlaceholder(fm.breakImage2);

    if (!needsHero && !needsBreak1 && !needsBreak2) {
      console.log(`Skip blog images (already set): ${file}`);
      continue;
    }

    const title = fm.title || file.replace(/\.mdx?$/, '');
    const section1 = fm.section1Title || '';
    const section2 = fm.section2Title || '';
    const slug = buildSlugFromTitle(title);

    console.log(`\nGenerating images for blog post: ${file}`);

    if (needsHero) {
      const prompt = buildImagePrompt('hero', title, section1, section2, siteName);
      const name = `${slug}-hero`;
      console.log(`  [hero] ${prompt.slice(0, 80)}...`);
      try {
        const result = await callWorker(prompt, name);
        const { r2 } = result;
        const seo = result.seo || {};
        const key = `blog/${file.replace(/\.mdx?$/, '')}/hero`;
        manifest[key] = { key, r2Key: r2.key, altText: seo.altText || prompt.slice(0, 120), generatedAt: new Date().toISOString() };
        content = updateFrontmatterKey(content, 'heroImage', r2.key);
        if (fm.heroImageAlt === undefined || fm.heroImageAlt === '') {
          // add heroImageAlt if missing — handled by Worker's seo.altText
        }
        console.log(`  [hero] R2: ${r2.key}`);
        count++;
      } catch (e) { console.error(`  [hero] FAILED: ${e.message}`); }
    }

    if (needsBreak1) {
      const prompt = buildImagePrompt('break1', title, section1, section2, siteName);
      const name = `${slug}-section-1`;
      console.log(`  [break1] ${prompt.slice(0, 80)}...`);
      try {
        const result = await callWorker(prompt, name);
        const { r2 } = result;
        const key = `blog/${file.replace(/\.mdx?$/, '')}/break1`;
        manifest[key] = { key, r2Key: r2.key, altText: result.seo?.altText || prompt.slice(0, 120), generatedAt: new Date().toISOString() };
        content = updateFrontmatterKey(content, 'breakImage1', r2.key);
        console.log(`  [break1] R2: ${r2.key}`);
        count++;
      } catch (e) { console.error(`  [break1] FAILED: ${e.message}`); }
    }

    if (needsBreak2) {
      const prompt = buildImagePrompt('break2', title, section1, section2, siteName);
      const name = `${slug}-section-2`;
      console.log(`  [break2] ${prompt.slice(0, 80)}...`);
      try {
        const result = await callWorker(prompt, name);
        const { r2 } = result;
        const key = `blog/${file.replace(/\.mdx?$/, '')}/break2`;
        manifest[key] = { key, r2Key: r2.key, altText: result.seo?.altText || prompt.slice(0, 120), generatedAt: new Date().toISOString() };
        content = updateFrontmatterKey(content, 'breakImage2', r2.key);
        console.log(`  [break2] R2: ${r2.key}`);
        count++;
      } catch (e) { console.error(`  [break2] FAILED: ${e.message}`); }
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }

  console.log(`\nPhase 2 done. Blog images generated/updated: ${count}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Phase 1: Site images ===');
  await phase1();

  console.log('\n=== Phase 2: Blog post images ===');
  await phase2();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\nManifest saved: src/data/image-manifest.json');
}

main().catch(err => { console.error(err); process.exit(1); });
