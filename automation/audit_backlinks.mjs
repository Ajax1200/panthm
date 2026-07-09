import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Ensure user-agent is set to a browser agent so websites don't block us
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const BACKLINKS_FILE = 'backlinks.txt';
const REPORT_FILE = 'backlinks_audit_report.md';

async function auditUrl(url, targetDomain = 'panthm.com') {
  url = url.trim();
  if (!url) return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  console.log(`[Audit] Fetching ${url}...`);
  try {
    const response = await axios.get(url, {
      headers: { 
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000,
      validateStatus: () => true // Allow any status code so we can capture 404s
    });

    const status = response.status;
    if (status < 200 || status >= 400) {
      return { url, status: 'DEAD', details: `HTTP Status ${status}` };
    }

    const html = response.data;
    if (typeof html !== 'string') {
      return { url, status: 'NO_BACKLINK', details: 'Non-HTML response' };
    }

    // Search for link to targetDomain
    // Regex matches: href containing targetDomain (with or without subdomains/paths)
    const escapedDomain = targetDomain.replace(/\./g, '\\.');
    const linkRegex = new RegExp(`<a\\s+([^>]*?)href=["\']https?:\\/\\/(?:[^"\'>\\s]*?\\.)?${escapedDomain}(?:[^"\'>\\s]*)["\']([^>]*?)>([\\s\\S]*?)<\\/a>`, 'gi');

    let match;
    const backlinks = [];

    while ((match = linkRegex.exec(html)) !== null) {
      const attributes = (match[1] + ' ' + match[2]).trim();
      const anchorText = match[3].replace(/<[^>]*>/g, '').trim(); // Strip internal HTML tags from anchor

      // Check rel attribute for nofollow, ugc, sponsored
      const relMatch = attributes.match(/rel=["\'](.*?)["\']/i);
      const rel = relMatch ? relMatch[1].toLowerCase() : '';
      const isNofollow = rel.includes('nofollow') || rel.includes('ugc') || rel.includes('sponsored');

      backlinks.push({
        anchorText: anchorText || '[Empty Image/Element]',
        type: isNofollow ? 'NOFOLLOW' : 'DOFOLLOW',
        rel: rel || 'none'
      });
    }

    if (backlinks.length === 0) {
      return { url, status: 'NO_BACKLINK', details: `No links found pointing to ${targetDomain}` };
    }

    return {
      url,
      status: 'LIVE',
      backlinks
    };
  } catch (err) {
    return { url, status: 'DEAD', details: err.message };
  }
}

async function main() {
  if (!fs.existsSync(BACKLINKS_FILE)) {
    // Write sample links if it doesn't exist
    fs.writeFileSync(BACKLINKS_FILE, `# Put your backlinks here (one per line)
# Lines starting with # are ignored

https://example.com
`);
    console.log(`[Setup] Created template file: ${BACKLINKS_FILE}. Please paste your backlink URLs there and run the script again.`);
    return;
  }

  const content = fs.readFileSync(BACKLINKS_FILE, 'utf8');
  const urls = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  if (urls.length === 0) {
    console.log(`[Error] ${BACKLINKS_FILE} is empty or only contains comments. Please add URLs.`);
    return;
  }

  console.log(`[Start] Auditing ${urls.length} URLs for links to panthm.com...`);
  const results = [];
  for (const url of urls) {
    const res = await auditUrl(url);
    if (res) results.push(res);
  }

  // Generate Report
  let md = `# Backlink Audit Report\n`;
  md += `Generated on: ${new Date().toLocaleString()}\n\n`;
  md += `## Summary\n\n`;

  const total = results.length;
  const live = results.filter(r => r.status === 'LIVE').length;
  const dofollow = results.filter(r => r.status === 'LIVE' && r.backlinks.some(b => b.type === 'DOFOLLOW')).length;
  const nofollow = results.filter(r => r.status === 'LIVE' && r.backlinks.every(b => b.type === 'NOFOLLOW')).length;
  const dead = results.filter(r => r.status === 'DEAD').length;
  const missing = results.filter(r => r.status === 'NO_BACKLINK').length;

  md += `- **Total Checked**: ${total}\n`;
  md += `- **Live with Backlink**: ${live} (Dofollow: ${dofollow}, Nofollow: ${nofollow})\n`;
  md += `- **Missing Link**: ${missing}\n`;
  md += `- **Dead/Unreachable**: ${dead}\n\n`;

  md += `## Detailed Results\n\n`;
  md += `| Target URL | Status | Backlinks Found | Anchor Text & Type |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  for (const res of results) {
    if (res.status === 'LIVE') {
      const linksDesc = res.backlinks.map(b => `\`${b.anchorText}\` (${b.type})`).join('<br>');
      md += `| [${res.url}](${res.url}) | 🟢 **LIVE** | ${res.backlinks.length} | ${linksDesc} |\n`;
    } else if (res.status === 'NO_BACKLINK') {
      md += `| [${res.url}](${res.url}) | 🟡 **MISSING** | 0 | ${res.details} |\n`;
    } else {
      md += `| [${res.url}](${res.url}) | 🔴 **DEAD** | 0 | ${res.details} |\n`;
    }
  }

  fs.writeFileSync(REPORT_FILE, md);
  console.log(`\n[Done] Report saved to ${REPORT_FILE}`);
}

main();
