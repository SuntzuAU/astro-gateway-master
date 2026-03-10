/**
 * update-link-usage.js
 * Runs after every merge to main.
 * Scans all blog post frontmatter and rebuilds link-usage.json from scratch.
 * The frontmatter is the source of truth - this file is the computed report.
 *
 * Usage: node .github/scripts/update-link-usage.js
 * Requires: gray-matter (npm install gray-matter)
 */

const fs = require('fs');
const path = require('path');

// Try to load gray-matter, fall back gracefully
let matter;
try {
  matter = require('gray-matter');
} catch (e) {
  console.error('gray-matter not found. Run: npm install gray-matter');
  process.exit(1);
}

const USAGE_FILE = path.join(__dirname, '../../src/data/link-usage.json');
const NETWORK_FILE = path.join(__dirname, '../../src/data/link-network.json');
const BLOG_DIR = path.join(__dirname, '../../src/content/blog');

function getAllMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(f => path.join(dir, f));
}

function main() {
  const usage = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
  const network = JSON.parse(fs.readFileSync(NETWORK_FILE, 'utf8'));
  const networkSites = Object.keys(network.network);

  // Reset counts - recompute from scratch
  const coverage = {};
  const anchorsUsed = {};
  networkSites.forEach(site => {
    coverage[site] = 0;
    anchorsUsed[site] = [];
  });

  const internalLog = [];
  const externalLog = [];
  let internalTotal = 0;

  const posts = getAllMarkdownFiles(BLOG_DIR);

  for (const postPath of posts) {
    const raw = fs.readFileSync(postPath, 'utf8');
    const { data } = matter(raw);
    const slug = '/' + path.basename(postPath).replace(/\.mdx?$/, '');

    // Process internal links
    if (data.internalLinks && Array.isArray(data.internalLinks)) {
      for (const link of data.internalLinks) {
        internalLog.push({
          from: slug,
          to: link.to,
          anchor: link.anchor,
          date: data.date || 'unknown'
        });
        internalTotal++;
      }
    }

    // Process external links
    if (data.externalLinks && Array.isArray(data.externalLinks)) {
      for (const link of data.externalLinks) {
        const site = link.to;
        if (coverage[site] !== undefined) {
          coverage[site]++;
          if (link.anchor && !anchorsUsed[site].includes(link.anchor)) {
            anchorsUsed[site].push(link.anchor);
          }
          externalLog.push({
            from: slug,
            to: site,
            anchor: link.anchor,
            date: data.date || 'unknown'
          });
        }
      }
    }
  }

  // Check for anchor pool exhaustion warnings
  for (const site of networkSites) {
    if (!network.network[site]) continue;
    const pools = network.network[site].anchorPools || {};
    const allAnchors = Object.values(pools).flat();
    const remaining = allAnchors.filter(a => !anchorsUsed[site].includes(a));
    if (remaining.length <= 2) {
      console.warn(`WARNING: Anchor pool for ${site} has only ${remaining.length} unused anchor(s) remaining. Add more anchors to link-network.json.`);
    }
  }

  // Write updated usage file
  const updated = {
    _readme: usage._readme,
    thisSite: usage.thisSite,
    lastUpdated: new Date().toISOString().split('T')[0],
    internal: {
      totalLinks: internalTotal,
      log: internalLog
    },
    external: {
      coverage,
      anchorsUsed,
      log: externalLog
    }
  };

  fs.writeFileSync(USAGE_FILE, JSON.stringify(updated, null, 2));
  console.log(`link-usage.json updated. Internal: ${internalTotal} links. External: ${JSON.stringify(coverage)}`);
}

main();
