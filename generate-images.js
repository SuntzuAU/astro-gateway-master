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
    const seoName = img.name ? toSeoSlug(img.name) : toSeoSlug(prompt);
    if (!key || !prompt) continue;
    const entry = manifest[key];
    const localFile = path.join(outDir, path.basename(entry?.filename || ''));
    const upToDate = entry?.r2Key && entry.promptHash === sha256(prompt) && (entry.filename ? fs.existsSync(localFile) : true);
    if (upToDate) { console.log(`Skip (unchanged): ${key}`); continue; }
    console.log(`Generating site image: ${key} -> ${seoName}`);
    const result = await callWorker(prompt, seoName);
    const { r2 } = result;
    const filename = r2.seoFilename || r2.filename || path.basename(r2.key);
    manifest[key] = {
      key,
      r2Key: r2.key,
      filename,
      contentType: r2.contentType,
      bytes: r2.bytes,
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
  const base = siteName ? toSeoSlug(siteName) : '';
  let descriptor = '';
  if (type === 'hero') descriptor = toSeoSlug(title);
  else if (type === 'break1') descriptor = toSeoSlug(section1 || title);
  else descriptor = toSeoSlug(section2 || section1 || title);
  const combined = base ? `${base}-${descriptor}` : descriptor;
  return `${combined.slice(0, 60)}-${type}`;
}

// IMPORTANT: These prompts are carefully engineered to avoid Gemini's failure modes:
// - Never mention software names, product names, or brands (Gemini renders them as logos on screens)
// - Never ask for "software interface" or "screen showing app" (produces UI mockups)
// - Always specify positive emotional state for hero shots
// - Always end with the negative list to override Gemini defaults
const NEGATIVE =
  'photorealistic DSLR photography, natural candid feel, ' +
  'NO logos, NO brand names, NO text on screens, NO UI mockups, NO app interfaces, ' +
  'NO stock photo poses, NO diagrams, NO charts, NO illustrations, NO clipart';

function buildPrompt(type, title, section1, section2, siteName) {
  const HERO_SCENES = [
    'two professionals smiling and collaborating at a modern desk with a laptop, both looking pleased with their work',
    'confident professional in smart casual attire at a clean modern desk, looking satisfied and focused',
    'small team of three people in a bright open-plan office having a positive discussion around a table',
    'professional at a standing desk in a light-filled modern office, smiling and relaxed',
    'two colleagues walking through a bright modern corridor, talking and smiling, carrying documents',
  ];
  const BREAK_SCENES = [
    'close-up of clean modern desk with laptop, coffee cup, and notepad in warm natural light',
    'bright modern meeting room with empty chairs, glass walls, city view in background',
    'hands resting on a laptop keyboard in a clean well-lit office environment, shallow depth of field',
    'wide shot of a tidy open-plan Australian office with natural light and plants',
    'professional leather notebook and pen on a clean wooden desk beside a laptop, warm light',
  ];
  const SETTINGS = [
    'modern Sydney CBD office with harbour view',
    'bright contemporary Melbourne professional workspace',
    'clean modern Australian healthcare administration office',
    'light-filled Australian legal chambers interior',
    'contemporary open-plan corporate office Brisbane',
  ];

  // Pick deterministically based on type so hero/break are always different
  const heroScene = HERO_SCENES[Math.floor(Math.random() * HERO_SCENES.length)];
  const breakScene = BREAK_SCENES[Math.floor(Math.random() * BREAK_SCENES.length)];
  const setting = SETTINGS[Math.floor(Math.random() * SETTINGS.length)];

  const context = siteName ? ` Editorial context: ${siteName}.` : '';

  if (type === 'hero') {
    return `${heroScene}, ${setting}.${context} ${NEGATIVE}`;
  }
  return `${breakScene}, ${setting}.${context} ${NEGATIVE}`;
}

// Insert field after metaDescription if missing; replace value if already present
function setFrontmatterField(content, field, value) {
  const existingRe = new RegExp(`^(${field}:)[ \\t]*.*$`, 'm');
  if (existingRe.test(content)) {
    return content.replace(existingRe, `${field}: "${value}"`);
  }
  return content.replace(
    /^(metaDescription:[ \t]*.*)$/m,
    `$1\n${field}: "${value}"`
  );
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
    if (file.startsWith('_')) { console.log(`Skip placeholder: ${file}`); continue; }
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
        content = setFrontmatterField(content, field, r2.key);
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
