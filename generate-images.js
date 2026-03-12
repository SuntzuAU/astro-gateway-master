/**
 * generate-images.js
 * VRA Gateway Sites - shared image generation script
 *
 * MANUAL TRIGGER ONLY. Never runs on push.
 *
 * Phase 1: site images (hero, feat1, feat2)
 *   Reads src/image.prompts.json for slot->scene mapping
 *   Resolves scene prompts from src/image-prompt-library.json
 *   Skips slots that already have an r2Key in image-manifest.json
 *
 * Phase 2: blog post images (heroImage, breakImage1, breakImage2)
 *   Reads heroPrompt/breakPrompt1/breakPrompt2 from post frontmatter
 *   Falls back to library scene if heroScene/breakScene1/breakScene2 set in frontmatter
 *   Skips posts that already have all three images set
 *   Logs ACTION NEEDED for posts missing both prompts and scenes
 *
 * R2 key format: images/<site>/<role>-<shortid>.jpg
 * Short, flat, no date folders. Role = hero | feat1 | feat2 | break1 | break2 etc.
 *
 * Usage:
 *   node generate-images.js            run both phases
 *   node generate-images.js site       site images only
 *   node generate-images.js blog       all blog posts
 *   node generate-images.js post:filename.md   single post
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WORKER_URL = process.env.IMAGE_WORKER_URL ||
  'https://master-image-generator.speech-recognition-cloud.workers.dev/generate';
const WORKER_TOKEN = process.env.ADMIN_TOKEN || '';
const SITE = process.env.SITE_ID || 'default';

const cwd = process.cwd();
const dataDir = path.join(cwd, 'src', 'data');
const manifestPath = path.join(dataDir, 'image-manifest.json');
const promptsPath = path.join(cwd, 'src', 'image.prompts.json');
const libraryPath = path.join(cwd, 'src', 'image-prompt-library.json');
const newsDir = path.join(cwd, 'src', 'content', 'news');

fs.mkdirSync(dataDir, { recursive: true });

let manifest = {};
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { manifest = {}; }
}

// Load the shared library
let library = { scenes: {}, suffix: '', heroSuffix: '', breakSuffix: '' };
if (fs.existsSync(libraryPath)) {
  try { library = JSON.parse(fs.readFileSync(libraryPath, 'utf8')); } catch {}
}

function shortId() {
  return crypto.randomBytes(4).toString('hex'); // 8 hex chars: a1b2c3d4
}

/**
 * Resolve a final prompt string from either:
 *   - a direct 'prompt' field (used as-is, library suffix appended)
 *   - a 'scene' + 'type' reference into the library
 */
function resolvePrompt(entry, fallbackType = 'hero') {
  const type = (entry.type || fallbackType).toLowerCase();
  const isHero = type === 'hero';

  // Direct prompt override takes priority
  if (entry.prompt) {
    const sfx = isHero ? library.heroSuffix : library.breakSuffix;
    return `${entry.prompt} ${library.suffix} ${sfx}`.trim();
  }

  // Scene lookup
  const sceneName = entry.scene;
  if (!sceneName) return null;
  const scene = library.scenes?.[sceneName];
  if (!scene) {
    console.warn(`  Scene '${sceneName}' not found in library. Available: ${Object.keys(library.scenes || {}).join(', ')}`);
    return null;
  }

  const base = isHero ? scene.hero : scene.break;
  const sfx = isHero ? library.heroSuffix : library.breakSuffix;
  return `${base} ${library.suffix} ${sfx}`.trim();
}

function resolveAltText(entry, sceneName, type) {
  if (entry.altText) return entry.altText;
  const scene = library.scenes?.[sceneName];
  if (!scene) return '';
  return (type === 'hero' ? scene.altHero : scene.altBreak) || '';
}

async function callWorker(prompt, r2Key) {
  const headers = { 'Content-Type': 'application/json' };
  if (WORKER_TOKEN) headers['Authorization'] = `Bearer ${WORKER_TOKEN}`;
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, name: r2Key, site: SITE }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) throw new Error(`Worker error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// --- Phase 1: Site images ---------------------------------------------------

async function phase1() {
  if (!fs.existsSync(promptsPath)) {
    console.warn('\nWARNING: src/image.prompts.json not found.');
    console.warn('Copy from astro-gateway-master and update scenes for this site.\n');
    return;
  }

  const config = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
  if (!config?.images?.length) { console.log('No images defined in image.prompts.json.'); return; }

  let count = 0;
  for (const img of config.images) {
    const { key, role } = img;
    if (!key) { console.warn('Skipping entry with no key.'); continue; }

    if (manifest[key]?.r2Key) {
      console.log(`Skip (exists): ${key} -> ${manifest[key].r2Key}`);
      continue;
    }

    const type = img.type || 'hero';
    const prompt = resolvePrompt(img, type);
    if (!prompt) {
      console.warn(`Skip ${key}: could not resolve prompt (no 'prompt' or valid 'scene' field).`);
      continue;
    }

    const r2Key = `images/${SITE}/${role || key}-${shortId()}.jpg`;
    const altText = resolveAltText(img, img.scene, type);

    console.log(`Generating: ${key} [scene:${img.scene || 'custom'}] -> ${r2Key}`);
    try {
      const result = await callWorker(prompt, r2Key);
      manifest[key] = {
        key,
        r2Key: result.r2?.key || r2Key,
        altText,
        scene: img.scene || 'custom',
        generatedAt: new Date().toISOString(),
        site: SITE,
      };
      console.log(`  Done: ${manifest[key].r2Key}`);
      count++;
    } catch (e) {
      console.error(`  FAILED: ${e.message}`);
    }
  }
  console.log(`Phase 1 done. Generated: ${count}`);
}

// --- Phase 2: Blog post images ----------------------------------------------

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

function setFrontmatterField(content, field, value) {
  const re = new RegExp(`^(${field}:)[ \\t]*.*$`, 'm');
  if (re.test(content)) return content.replace(re, `${field}: "${value}"`);
  return content.replace(/^(metaDescription:[ \t]*.*)$/m, `$1\n${field}: "${value}"`);
}

function resolvePostPrompt(fm, role) {
  // role: 'hero' | 'break1' | 'break2'
  const isHero = role === 'hero';
  const promptField = isHero ? 'heroPrompt' : (role === 'break1' ? 'breakPrompt1' : 'breakPrompt2');
  const sceneField = isHero ? 'heroScene' : (role === 'break1' ? 'breakScene1' : 'breakScene2');
  const altField = isHero ? 'heroImageAlt' : (role === 'break1' ? 'breakImage1Alt' : 'breakImage2Alt');

  if (fm[promptField]) {
    const sfx = isHero ? library.heroSuffix : library.breakSuffix;
    return {
      prompt: `${fm[promptField]} ${library.suffix} ${sfx}`.trim(),
      altText: fm[altField] || '',
    };
  }

  if (fm[sceneField]) {
    const scene = library.scenes?.[fm[sceneField]];
    if (!scene) {
      console.warn(`  Scene '${fm[sceneField]}' not found in library.`);
      return null;
    }
    const base = isHero ? scene.hero : scene.break;
    const sfx = isHero ? library.heroSuffix : library.breakSuffix;
    return {
      prompt: `${base} ${library.suffix} ${sfx}`.trim(),
      altText: fm[altField] || (isHero ? scene.altHero : scene.altBreak) || '',
    };
  }

  return null;
}

async function processPost(file) {
  const filePath = path.join(newsDir, file);
  if (!fs.existsSync(filePath)) { console.error(`Post not found: ${filePath}`); return 0; }

  const content = fs.readFileSync(filePath, 'utf8');
  const fm = parseFrontmatter(content);
  const slug = file.replace(/\.mdx?$/, '');

  const hasHero  = fm.heroImage   && !fm.heroImage.startsWith('default/');
  const hasB1    = fm.breakImage1 && !fm.breakImage1.startsWith('default/');
  const hasB2    = fm.breakImage2 && !fm.breakImage2.startsWith('default/');

  if (hasHero && hasB1 && hasB2) { console.log(`Skip (done): ${file}`); return 0; }

  // Check if this post has any way to generate images
  const hasHeroSource  = fm.heroPrompt || fm.heroScene;
  const hasB1Source    = fm.breakPrompt1 || fm.breakScene1;
  const hasB2Source    = fm.breakPrompt2 || fm.breakScene2;

  if (!hasHeroSource && !hasB1Source && !hasB2Source) {
    console.log(`\n  ACTION NEEDED: ${file}`);
    console.log(`  Add at least one of these to the post frontmatter:`);
    console.log(`    heroPrompt: "your custom prompt"`);
    console.log(`    heroScene: doctor-surgery   # or any scene from image-prompt-library.json`);
    console.log(`    breakPrompt1/breakScene1, breakPrompt2/breakScene2`);
    console.log(`  Available scenes: ${Object.keys(library.scenes || {}).join(', ')}\n`);
    return 0;
  }

  console.log(`Generating images for: ${file}`);
  let updated = content;
  let count = 0;

  const tasks = [
    { field: 'heroImage',   altField: 'heroImageAlt',   role: 'hero',   needs: !hasHero },
    { field: 'breakImage1', altField: 'breakImage1Alt', role: 'break1', needs: !hasB1 },
    { field: 'breakImage2', altField: 'breakImage2Alt', role: 'break2', needs: !hasB2 },
  ];

  for (const { field, altField, role, needs } of tasks) {
    if (!needs) continue;
    const resolved = resolvePostPrompt(fm, role);
    if (!resolved) { console.log(`  Skip ${field}: no prompt or scene defined`); continue; }

    const r2Key = `images/${SITE}/${slug}-${role}-${shortId()}.jpg`;
    try {
      const result = await callWorker(resolved.prompt, r2Key);
      const finalKey = result.r2?.key || r2Key;
      updated = setFrontmatterField(updated, field, finalKey);
      if (resolved.altText) updated = setFrontmatterField(updated, altField, resolved.altText);
      console.log(`  [${role}] ${finalKey}`);
      count++;
    } catch (e) {
      console.error(`  [${role}] FAILED: ${e.message}`);
    }
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  return count;
}

async function phase2() {
  if (!fs.existsSync(newsDir)) { console.log('No news dir.'); return; }
  const files = fs.readdirSync(newsDir)
    .filter(f => !f.startsWith('_') && (f.endsWith('.md') || f.endsWith('.mdx')));
  let total = 0;
  for (const file of files) total += await processPost(file);
  console.log(`Phase 2 done. Total blog images generated: ${total}`);
}

// --- Main -------------------------------------------------------------------

async function main() {
  const mode = process.argv[2] || 'all';

  if (mode === 'site' || mode === 'all') {
    console.log('=== Phase 1: Site images ===');
    await phase1();
  }

  if (mode === 'blog' || mode === 'all') {
    console.log('\n=== Phase 2: Blog images ===');
    await phase2();
  }

  if (mode.startsWith('post:')) {
    const file = mode.replace('post:', '');
    console.log(`=== Single post: ${file} ===`);
    await processPost(file);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\nDone. Manifest saved.');
}

main().catch(err => { console.error(err); process.exit(1); });
