// generate-images.js
// Calls your master-image-generator Worker (not Gemini directly).
// - Reads prompts from src/image.prompts.json
// - Worker handles SEO naming, R2 storage, alt text generation
// - Writes a local SEO manifest: src/data/image-manifest.json
// - Also downloads images to public/generated/ for local Astro builds
// - Skips regeneration if prompt unchanged (hash check)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const WORKER_URL = process.env.IMAGE_WORKER_URL ||
  "https://master-image-generator.speech-recognition-cloud.workers.dev/generate";

const WORKER_TOKEN = process.env.ADMIN_TOKEN || "";
const SITE = process.env.SITE_ID || "default";

if (!WORKER_URL) throw new Error("Missing IMAGE_WORKER_URL");

const cwd = process.cwd();

const promptPaths = [
  path.join(cwd, "src", "image.prompts.json"),
  path.join(cwd, "src", "src", "image.prompts.json"),
];
const promptsPath = promptPaths.find((p) => fs.existsSync(p));
if (!promptsPath) throw new Error(`Cannot find image prompts file. Checked:\n- ${promptPaths.join("\n- ")}`);

const config = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
if (!config?.images?.length) throw new Error(`No images[] found in ${promptsPath}`);

const outDir = path.join(cwd, "public", "generated");
const dataDir = path.join(cwd, "src", "data");
const manifestPath = path.join(dataDir, "image-manifest.json");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

let manifest = {};
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); }
  catch { manifest = {}; }
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function shouldGenerate(key, prompt) {
  const entry = manifest[key];
  if (!entry?.r2Key) return true;
  const localFile = path.join(outDir, path.basename(entry.filename || ""));
  if (!fs.existsSync(localFile)) return true;
  return entry.promptHash !== sha256(prompt);
}

async function callWorker(prompt, name) {
  const headers = { "Content-Type": "application/json" };
  if (WORKER_TOKEN) headers["Authorization"] = `Bearer ${WORKER_TOKEN}`;

  const res = await fetch(WORKER_URL, {
    method: "POST",
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
  const R2_BASE = process.env.R2_PUBLIC_BASE || "";
  if (!R2_BASE) {
    console.log(`  ↳ No R2_PUBLIC_BASE set — skipping local download of ${localFilename}`);
    return false;
  }

  const url = `${R2_BASE.replace(/\/$/, "")}/${r2Key}`;
  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    console.warn(`  ↳ Could not download image from ${url} (${imgRes.status})`);
    return false;
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(path.join(outDir, localFilename), buffer);
  console.log(`  ↳ Downloaded to public/generated/${localFilename}`);
  return true;
}

async function main() {
  let generatedCount = 0;

  for (const img of config.images) {
    const key = (img.key || img.filename || "").toString().trim();
    const prompt = (img.prompt || "").toString().trim();
    const name = (img.name || img.filename || "").toString().trim();

    if (!key || !prompt) {
      console.log("Skipping invalid entry (needs key + prompt):", img);
      continue;
    }

    if (!shouldGenerate(key, prompt)) {
      console.log(`Skip (unchanged): ${key}`);
      continue;
    }

    console.log(`Generating: ${key}`);
    console.log(`  Prompt: ${prompt.slice(0, 80)}...`);

    const result = await callWorker(prompt, name);
    const { r2 } = result;
    const seo = result.seo || {};

    manifest[key] = {
      key,
      r2Key: r2.key,
      filename: r2.filename,
      contentType: r2.contentType,
      bytes: r2.bytes,
      seoSlug: seo.slug || "",
      altText: seo.altText || prompt.slice(0, 120),
      prompt,
      promptHash: sha256(prompt),
      generatedAt: new Date().toISOString(),
      site: SITE,
    };

    console.log(`  ↳ R2 key: ${r2.key}`);
    console.log(`  ↳ SEO slug: ${seo.slug}`);
    console.log(`  ↳ Alt text: ${seo.altText}`);

    await downloadImage(r2.key, r2.filename);
    generatedCount += 1;
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nManifest updated: src/data/image-manifest.json`);
  console.log(`Done. Generated/updated: ${generatedCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
