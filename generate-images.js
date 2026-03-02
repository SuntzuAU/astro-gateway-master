// generate-images.js
// Production-only image generator.
// - Reads prompts from src/image.prompts.json (or src/src/image.prompts.json if you accidentally nested it)
// - Writes images to public/generated/<seo-filename>
// - Skips regeneration unless prompt changed (uses a sidecar .hash file)
// - Calls Nano Banana via API URL you provide (so we don't guess your endpoint)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_KEY = process.env.NANO_BANANA_API_KEY;
const API_URL = process.env.NANO_BANANA_API_URL; // REQUIRED: set this in GitHub repo variables/secrets

if (!API_KEY) throw new Error("Missing env NANO_BANANA_API_KEY");
if (!API_URL) throw new Error("Missing env NANO_BANANA_API_URL (set your Nano Banana endpoint URL)");

const cwd = process.cwd();

// Handle both possible locations (you currently have src/src/image.prompts.json)
const promptPaths = [
  path.join(cwd, "src", "image.prompts.json"),
  path.join(cwd, "src", "src", "image.prompts.json"),
];

const promptsPath = promptPaths.find((p) => fs.existsSync(p));
if (!promptsPath) {
  throw new Error(
    `Cannot find image prompts file. Expected one of:\n- ${promptPaths.join("\n- ")}`
  );
}

const raw = fs.readFileSync(promptsPath, "utf8");
const config = JSON.parse(raw);

if (!config?.images?.length) {
  throw new Error(`No images[] found in ${promptsPath}`);
}

const outDir = path.join(cwd, "public", "generated");
fs.mkdirSync(outDir, { recursive: true });

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function getHashPath(filename) {
  return path.join(outDir, `${filename}.hash`);
}

function shouldGenerate(filename, prompt) {
  const imgPath = path.join(outDir, filename);
  const hashPath = getHashPath(filename);

  if (!fs.existsSync(imgPath)) return true;

  const currentHash = sha256(prompt);
  if (!fs.existsSync(hashPath)) return true;

  const prevHash = fs.readFileSync(hashPath, "utf8").trim();
  return prevHash !== currentHash;
}

function writeHash(filename, prompt) {
  fs.writeFileSync(getHashPath(filename), sha256(prompt), "utf8");
}

function sanitiseFilename(name) {
  // keep it SEO-safe: lower, hyphens, .webp, no weird chars
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|(?<=\.)-|-(?=\.)/g, "");
  return safe;
}

async function callNanoBanana(prompt) {
  // We do NOT assume Nano Banana’s payload format.
  // This request shape is generic. If your API needs different fields, tell me what it expects.
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      // common optional params you might support server-side:
      // size: "1200x630",
      // format: "webp",
      // quality: "high",
    }),
  });

  const contentType = res.headers.get("content-type") || "";

  // If API returns an image directly
  if (contentType.startsWith("image/")) {
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Otherwise assume JSON
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Nano Banana API error ${res.status}: ${JSON.stringify(json)}`);
  }

  // Try a few common shapes (base64)
  const b64 =
    json?.image_base64 ||
    json?.imageBase64 ||
    json?.data?.b64_json ||
    json?.data?.[0]?.b64_json ||
    json?.images?.[0]?.b64_json ||
    json?.images?.[0]?.base64;

  if (b64) return Buffer.from(b64, "base64");

  // Or URL returned
  const url =
    json?.image_url ||
    json?.imageUrl ||
    json?.data?.url ||
    json?.data?.[0]?.url ||
    json?.images?.[0]?.url;

  if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Failed to fetch generated image URL: ${url}`);
    const arrayBuffer = await imgRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error(
    `Nano Banana response did not contain image data we recognise: ${JSON.stringify(json)}`
  );
}

async function main() {
  let generatedCount = 0;

  for (const img of config.images) {
    const filename = sanitiseFilename(img.filename || "");
    const prompt = (img.prompt || "").trim();

    if (!filename || !prompt) {
      console.log("Skipping invalid entry (needs filename + prompt):", img);
      continue;
    }

    const outPath = path.join(outDir, filename);

    if (!shouldGenerate(filename, prompt)) {
      console.log(`Skip (unchanged): ${filename}`);
      continue;
    }

    console.log(`Generating: ${filename}`);
    const buffer = await callNanoBanana(prompt);

    fs.writeFileSync(outPath, buffer);
    writeHash(filename, prompt);
    generatedCount += 1;

    console.log(`Wrote: public/generated/${filename}`);
  }

  console.log(`Done. Generated/updated: ${generatedCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
