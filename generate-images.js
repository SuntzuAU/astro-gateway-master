import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WORKER_URL = process.env.IMAGE_WORKER_URL ||
  'https://master-image-generator.speech-recognition-cloud.workers.dev/generate';
const WORKER_TOKEN = process.env.ADMIN_TOKEN || '';
const SITE = process.env.SITE_ID || 'default';

const cwd = process.cwd();
const outDir = path.join(cwd, 'public', 'generated');
const dataDir = path.join(cwd, 'src', 'data');
const manifestPath = path.join(dataDir, 'image-manifest.json');
const newsDir = path.join(cwd, 'src', 'content', 'news');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

let manifest = {};
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { manifest = {}; }
}

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function isPlaceholder(key) { return !key || key.startsWith('default/'); }

// Build an SEO slug from a string: lowercase, hyphens, max 70 chars, no trailing hyphens
function toSeoSlug(text) {
  const STOP_WORDS = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','it','its']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    .join('-')
    .slice(0, 70)
    .replace(/-+$/, '');
}

async function callWorker(prompt, seoName) {
  // seoName should already be a slug — passed as 'name' so Worker uses it directly
  const headers = { 'Content-Type': 'application/json' };
  if (WORKER_TOKEN) headers['Authorization'] = `Bearer ${WORKER_TOKEN}`;
  const res = await fetch(WORKER_URL, {
    method: 'POST', headers,
    body: JSON.stringify({ prompt, name: seoName, site: SITE }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) throw new Error(`Worker error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function downloadImage(r2Key, localFilename) {
  const R2_BASE = process.env.R2_PUBLIC_BASE || '';
  if (!R2_BASE) return;
  const url = `${R2_BASE.replace(/\/$/, '')}/${r2Key}`;
  const imgRes = await fetch(url);
  if (!imgRes.ok) { console.warn(`Could not download ${url}`); return; }
  fs.writeFileSync(path.join(outDir, localFilename), Buffer.from(await imgRes.arrayBuffer()));
}

async function phase1() {
  const promptsPath = path.join(cwd, 'src', 'image.prompts.json');
  if (!fs.existsSync(promptsPath)) { console.log('No image.prompts.json - skipping site images.'); return; }
  const config = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
  if (!config?.images?.length) return;
  let count = 0;
  for (const img of config.images) {
    const key = (img.key || '').trim();
    const prompt = (img.prompt || '').trim();
    // Use explicit name from prompts file, or derive SEO slug from prompt
    const seoName = img.name ? toSeoSlug(img.name) : toSeoSlug(prompt);
    if (!key || !prompt) continue;
    const entry = manifest[key];
    const localFile = path.join(outDir, path.basename(entry?.filename || ''));
    const upToDate = entry?.r2Key && entry.promptHash === sha256(prompt) && (entry.filename ? fs.existsSync(localFile) : true);
    if (upToDate) { console.log(`Skip (unchanged): ${key}`); continue; }
    console.log(`Generating site image: ${key} -> ${seoName}`);
    const result = await callWorker(prompt, seoName);
    const { r2 } = result;
    // r2.filename is the SEO filename returned by the Worker (slug-first)
    // r2.seoFilename is also available if Worker returns it
    const filename = r2.seoFilename || r2.filename || path.basename(r2.key);
    manifest[key] = {
      key,
      r2Key: r2.key,
      filename,
      contentType: r2.contentType,
      bytes: r2.bytes,
      // altText: prefer Worker-returned SEO alt text, fall back to prompt snippet
      altText: result.seo?.altText || seoName.replace(/-/g, ' '),
      prompt,
      promptHash: sha256(prompt),
      generatedAt: new Date().toISOString(),
      site: SITE,
    };
    console.log(`  R2 key: ${r2.key}`);
    console.log(`  SEO filename: ${filename}`);
    console.log(`  Alt text: ${manifest[key].altText}`);
    if (filename) await downloadImage(r2.key, filename);
    count++;
  }
  console.log(`Phase 1 done. Generated: ${count}`);
}

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

function buildPostSeoName(type, title, section1, section2, siteName) {
  // Build a descriptive SEO name for the blog post image
  const base = siteName ? toSeoSlug(siteName) : '';
  let descriptor = '';
  if (type === 'hero') descriptor = toSeoSlug(title);
  else if (type === 'break1') descriptor = toSeoSlug(section1 || title);
  else descriptor = toSeoSlug(section2 || section1 || title);
  // Combine site prefix + descriptor + type suffix, within 70 char limit
  const combined = base ? `${base}-${descriptor}` : descriptor;
  return `${combined.slice(0, 60)}-${type}`;
}

function buildPrompt(type, title, section1, section2, siteName) {
  const base = siteName ? `${siteName} - ` : '';
  if (type === 'hero') return `${base}Professional editorial photo illustrating: ${title}. Clean modern corporate Australian business environment, photography style, no text overlays.`;
  if (type === 'break1') return `${base}Professional editorial photo illustrating: ${section1 || title}. Australian enterprise context, documentary photography style, no text overlays.`;
  return `${base}Professional editorial photo illustrating: ${section2 || section1 || title}. Modern Australian workplace, technology in use, no text overlays.`;
}

function updateFrontmatterField(content, field, value) {
  const re = new RegExp(`(^---[\\s\\S]*?\n)(${field}:)([ \t]*)([^\n]+)(\n[\\s\\S]*?---)`);
  return content.replace(re, (_, pre, f, _sp, _old, post) => `${pre}${f} "${value}"${post}`);
}

async function phase2() {
  if (!fs.existsSync(newsDir)) { console.log('No news directory - skipping blog images.'); return; }
  const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  if (!files.length) { console.log('No blog posts found.'); return; }
  let siteName = '';
  try {
    const cfg = path.join(cwd, 'src', 'site.config.json');
    if (fs.existsSync(cfg)) siteName = JSON.parse(fs.readFileSync(cfg, 'utf8')).siteName || '';
  } catch {}
  let count = 0;
  for (const file of files) {
    const filePath = path.join(newsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    const needsHero = isPlaceholder(fm.heroImage);
    const needsBreak1 = isPlaceholder(fm.breakImage1);
    const needsBreak2 = isPlaceholder(fm.breakImage2);
    if (!needsHero && !needsBreak1 && !needsBreak2) { console.log(`Skip blog (done): ${file}`); continue; }
    const title = fm.title || file.replace(/\.mdx?$/, '');
    const section1 = fm.section1Title || '';
    const section2 = fm.section2Title || '';
    console.log(`Generating images for: ${file}`);
    for (const [type, field, needsIt] of [['hero','heroImage',needsHero],['break1','breakImage1',needsBreak1],['break2','breakImage2',needsBreak2]]) {
      if (!needsIt) continue;
      const prompt = buildPrompt(type, title, section1, section2, siteName);
      // SEO-first name: descriptive slug derived from post title + image type
      const seoName = buildPostSeoName(type, title, section1, section2, siteName);
      try {
        const result = await callWorker(prompt, seoName);
        const { r2 } = result;
        const altText = result.seo?.altText || seoName.replace(/-/g, ' ');
        manifest[`blog/${file.replace(/\.mdx?$/, '/')}${type}`] = {
          r2Key: r2.key,
          seoFilename: r2.seoFilename || r2.filename,
          altText,
          generatedAt: new Date().toISOString(),
        };
        content = updateFrontmatterField(content, field, r2.key);
        console.log(`  [${type}] R2: ${r2.key}`);
        console.log(`  [${type}] Alt: ${altText}`);
        count++;
      } catch (e) { console.error(`  [${type}] FAILED: ${e.message}`); }
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log(`Phase 2 done. Blog images generated: ${count}`);
}

async function main() {
  console.log('=== Phase 1: Site images ===');
  await phase1();
  console.log('\n=== Phase 2: Blog images ===');
  await phase2();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\nDone. Manifest saved.');
}

main().catch(err => { console.error(err); process.exit(1); });
