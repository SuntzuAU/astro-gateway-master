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

// Negative prompt applied to every image to prevent Gemini's failure modes.
// Do NOT mention software names or brands in any prompt — Gemini renders them as logos on screens.
const NEGATIVE =
  'photorealistic DSLR photography, shot on full-frame camera 50mm lens look, ' +
  'natural skin tones realistic proportions, professional wardrobe polished grooming, ' +
  'clean modern Australian office aesthetic, ' +
  'NO logos, NO brand names, NO text on screens, NO UI mockups, NO app interfaces, ' +
  'NO stock photo cliches, NO diagrams, NO charts, NO illustrations, NO clipart, ' +
  'NO cartoon, NO anime, NO exaggerated proportions, NO warped faces, NO extra fingers, ' +
  'NO watermarks, NO gibberish text';

// 20 professionally art-directed hero scene descriptions.
// Hero images: capable, warm, modern, aspirational — attractive adults in realistic premium workplaces.
const HERO_PROMPTS = [
  'Attractive adult female medical administrator aged 30-45, professional and polished, looking briefly toward the camera while working on a laptop with a Bluetooth headset, busy modern clinic office softly blurred in the background, warm daylight, shallow depth of field, calm productive energy, landscape hero image with negative space for website text',
  'Attractive adult male clinic administrator aged 35-45, clean-shaven, wearing a discreet Bluetooth headset, seated at a desk with laptop and patient notes, busy healthcare office in the blurred background, soft natural window light, confident and approachable, hero banner framing',
  'Handsome adult male doctor aged 35-45, standing at a desktop PC and dictating into a headset microphone, busy hospital office workspace behind him with cinematic depth of field, strong daylight from a side window, hardworking but content expression, authoritative and professional, landscape hero composition with room for headline text',
  'Attractive adult male doctor aged 40-45 with short salt-and-pepper beard, dictating at a standing workstation in a modern hospital office, blurred clinical activity in the background, crisp lighting through glass, positive and capable expression, shallow depth of field',
  'Attractive adult female specialist aged 35-45, seated at a desk in a bright private consulting room, wearing a subtle headset and reviewing notes on screen, softly blurred clinic background, warm premium lighting, poised and intelligent expression, clean composition with negative space for web copy',
  'Attractive adult female lawyer aged 35-45, elegant business attire, working at a desk with city skyline behind her through large office windows, papers and a small digital voice recorder on the desk, glancing toward camera with calm confidence, warm backlighting and cinematic depth of field, landscape hero banner',
  'Attractive adult male lawyer aged 40-45, tailored suit, standing at a desk in a high-rise office, dictating toward a desktop microphone while reviewing documents on screen, skyline softly blurred in background, confident authoritative expression, rich warm lighting, space for text',
  'Three adult professionals in a public service office gathered around a shared screen displaying a word-processing document, one person dictating while a small desktop microphone sits on the table, collaborative body language, clean modern government workspace, warm lighting on the table surface, shallow depth of field',
  'Mixed-gender team of adult professionals aged 30-45 in a public-sector style office, collaborating around a desk with laptop and monitor, one team member speaking naturally while others review text on screen, subtle microphone visible, intelligent and constructive atmosphere, polished lighting, hero-banner layout',
  'Attractive adult university student aged 20-25, seated at a library desk with laptop, wearing a headset with boom mic and dictating while studying, softly blurred bookshelves in background, warm focused table lighting, modern academic setting, positive and capable expression, landscape format with negative space',
  'Adult postgraduate student aged 30-40, working at a library or campus study hub, speaking into a compact headset while editing text on screen, papers and notebook neatly arranged, shallow depth of field, clean academic atmosphere, natural lighting',
  'Attractive adult female executive aged 35-45 in a modern office, seated at a laptop with Bluetooth headset, glass-walled office environment in the background, focused but warm expression, soft directional light, shallow depth of field, clean hero composition',
  'Attractive adult male professional aged 35-45, confident and polished, standing at an ergonomic workstation in a modern office, dictating while looking at a large monitor, blurred team activity in the background, bright natural light, landscape hero image',
  'Attractive adult female consultant aged 30-45, smart business attire, working at a desk with financial papers and laptop, discreet microphone visible, speaking while reviewing a report, modern office with glass and warm backlight, confident and competent mood, space for website headline',
  'Small team of adult office professionals in a clean administrative environment, one person dictating while two others review a shared document on screen, desk microphone visible, warm premium lighting, shallow depth of field, realistic office productivity hero image',
  'Attractive adult female healthcare support worker aged 30-45, wearing a Bluetooth headset and typing at laptop, softly blurred clinic support office in background, bright clean lighting, reassuring and efficient mood, hero-banner framing',
  'Adult male physician aged 40-45, attractive and authoritative, dictating notes at a workstation after consultation, modern medical office with blurred equipment and hallway movement behind him, positive expression, cinematic daylight, shallow depth of field',
  'Attractive adult female legal assistant aged 30-40, professional attire, seated at desk with laptop, legal papers, and compact desktop recorder, city office background with soft skyline blur, warm side light, intelligent and efficient mood, landscape website hero layout',
  'Two adult education professionals and one student in a modern campus office, gathered around a screen editing a document, one person speaking naturally into a microphone, collaborative and upbeat atmosphere, warm table lighting, shallow depth of field',
  'Attractive adult professional aged 30-45 in a modern office, using a headset and computer while speaking naturally, blurred colleagues and workspace behind, warm cinematic light, confident and welcoming expression, landscape hero-banner composition with generous negative space',
];

// Break/ambient scenes — environment and detail shots, no people required.
const BREAK_PROMPTS = [
  'Clean modern clinic administration desk with laptop, Bluetooth headset resting beside it, patient folder, warm natural window light, shallow depth of field, no people',
  'Bright modern legal office interior, city skyline visible through large windows, tidy desk with documents and small digital recorder, warm afternoon light, no people',
  'Contemporary open-plan Australian corporate office, natural light flooding in, plants, glass partitions, tidy workstations, wide shot, no people',
  'Close-up of professional hands on laptop keyboard in a well-lit modern office, shallow depth of field, clean desk surface visible',
  'Modern hospital administration corridor, glass walls, clean surfaces, warm clinical lighting, wide shot with depth, no people',
  'Tidy wooden desk with leather notebook, pen, laptop and coffee cup, warm side lighting, shallow depth of field, clean minimal composition',
  'Modern Australian law firm meeting room, long table with chairs, city view through full-height windows, soft even lighting, no people',
  'University library study area, modern and light-filled, laptop and headset on desk, bookshelves softly blurred behind, warm focused table lamp',
  'Government office workspace, clean and organised, shared desks with monitors and notepads, professional warm lighting, wide shot',
  'Close-up of a compact desktop microphone on a tidy office desk beside a laptop, soft directional light, shallow depth of field, no people',
];

function buildPrompt(type, title, section1, section2, siteName) {
  const context = siteName ? ` Editorial context: ${siteName}.` : '';
  if (type === 'hero') {
    const scene = HERO_PROMPTS[Math.floor(Math.random() * HERO_PROMPTS.length)];
    return `${scene}.${context} ${NEGATIVE}`;
  }
  const scene = BREAK_PROMPTS[Math.floor(Math.random() * BREAK_PROMPTS.length)];
  return `${scene}.${context} ${NEGATIVE}`;
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
