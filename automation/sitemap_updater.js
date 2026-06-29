/**
 * PANTHM AI LABS — Sitemap Updater with GitHub Auto-Push
 *
 * Fetches all published blog slugs from the CMS API,
 * regenerates a complete sitemap.xml, saves it locally,
 * and pushes it directly to GitHub so Vercel auto-deploys.
 *
 * Run standalone:  node sitemap_updater.js
 * Also called automatically by autopilot.js after each publish.
 *
 * Required .env variables:
 *   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
 *   GITHUB_REPO=boostmysites25/panthm          (owner/repo)
 *   GITHUB_SITEMAP_PATH=public/sitemap.xml     (path inside repo)
 *   GITHUB_BRANCH=main                         (branch to push to)
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SITE_BASE          = 'https://panthm.com';
const SITEMAP_OUT        = path.join(__dirname, 'generated_sitemap.xml');
const API_BASE           = 'https://api.panthm.com/api';

// GitHub config — all from .env
const GITHUB_TOKEN        = process.env.GITHUB_TOKEN;
const GITHUB_REPO         = process.env.GITHUB_REPO         || 'boostmysites25/panthm';
const GITHUB_SITEMAP_PATH = process.env.GITHUB_SITEMAP_PATH || 'public/sitemap.xml';
const GITHUB_BRANCH       = process.env.GITHUB_BRANCH       || 'main';

// ── Static pages ─────────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: '/',                               changefreq: 'weekly',  priority: '1.0' },
  { loc: '/about-us',                       changefreq: 'monthly', priority: '0.8' },
  { loc: '/services',                       changefreq: 'weekly',  priority: '0.9' },
  { loc: '/portfolio',                      changefreq: 'weekly',  priority: '0.8' },
  { loc: '/blogs',                          changefreq: 'daily',   priority: '0.9' },
  { loc: '/contact',                        changefreq: 'monthly', priority: '0.7' },
  { loc: '/privacy-policy',                 changefreq: 'monthly', priority: '0.5' },
  { loc: '/services/ai-calling-agency',     changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/web-development',       changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/app-development',       changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/game-development',      changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/ux-ui-design',          changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/blockchain',            changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/infrastructure',        changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/ai-automation',         changefreq: 'monthly', priority: '0.8' },
  { loc: '/services/data-analytics',        changefreq: 'monthly', priority: '0.8' },
];

function isoDate(dateStr) {
  try { return new Date(dateStr).toISOString().split('T')[0]; }
  catch { return new Date().toISOString().split('T')[0]; }
}

function buildSitemap(blogPosts) {
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = STATIC_PAGES.map(p =>
    `  <url><loc>${SITE_BASE}${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  ).join('\n');

  const blogUrls = blogPosts.map(b =>
    `  <url><loc>${SITE_BASE}/blogs/${b.slug}</loc><lastmod>${isoDate(b.updatedAt || b.createdAt || b.publishDate)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${staticUrls}

${blogUrls}
</urlset>`;
}

// ── GitHub API: push file directly to the repo ────────────────────────────────
async function pushToGitHub(xmlContent) {
  if (!GITHUB_TOKEN) {
    console.log('[Sitemap] ⚠️  GITHUB_TOKEN not set in .env — skipping GitHub push.');
    console.log('[Sitemap] ℹ️  Add GITHUB_TOKEN to .env to enable automatic sitemap deployment.');
    return false;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_SITEMAP_PATH}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'panthm-autopilot'
  };

  // Step 1: Get the current file SHA (required for updates)
  let currentSha = null;
  try {
    const getRes = await axios.get(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    currentSha = getRes.data?.sha;
    console.log(`[Sitemap] Found existing sitemap.xml in GitHub (SHA: ${currentSha?.slice(0, 8)}...)`);
  } catch (err) {
    if (err.response?.status === 404) {
      console.log('[Sitemap] sitemap.xml not found in GitHub — will create it.');
    } else {
      console.warn(`[Sitemap] Could not fetch existing file SHA: ${err.message}`);
    }
  }

  // Step 2: Push updated content (base64 encoded)
  const contentBase64 = Buffer.from(xmlContent, 'utf-8').toString('base64');
  const today = new Date().toISOString().split('T')[0];
  const payload = {
    message: `chore: auto-update sitemap.xml with latest blog posts [${today}]`,
    content: contentBase64,
    branch: GITHUB_BRANCH,
    ...(currentSha && { sha: currentSha })
  };

  try {
    const putRes = await axios.put(apiUrl, payload, { headers });
    const commitUrl = putRes.data?.commit?.html_url;
    console.log(`[Sitemap] ✅ GitHub push successful! Vercel will auto-deploy in ~60s.`);
    if (commitUrl) console.log(`[Sitemap] Commit: ${commitUrl}`);
    return true;
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    console.error(`[Sitemap] ❌ GitHub push failed: ${detail}`);
    return false;
  }
}

// ── IndexNow: Instant indexing ping ─────────────────────────────────────────
const INDEXNOW_KEY = 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6';

async function submitToIndexNow(newBlogSlug) {
  const urlList = newBlogSlug
    ? [`${SITE_BASE}/blogs/${newBlogSlug}`]
    : [SITE_BASE + '/'];

  const body = {
    host: 'panthm.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_BASE}/${INDEXNOW_KEY}.txt`,
    urlList
  };

  try {
    const res = await axios.post('https://api.indexnow.org/indexnow', body, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      timeout: 10000
    });
    console.log(`[IndexNow] ✅ Submitted ${urlList.length} URL(s) — HTTP ${res.status}`);
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.warn(`[IndexNow] ⚠️  Submission failed (non-critical): ${JSON.stringify(detail)}`);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function updateSitemap(newBlogSlug = null) {
  console.log('[Sitemap] Starting sitemap regeneration...');

  // 1. Authenticate with CMS
  let token;
  try {
    const authRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@panthm.com',
      password: 'admin@123'
    }, { timeout: 15000 });
    token = authRes.data?.token;
    if (!token) throw new Error('No token returned');
    console.log('[Sitemap] Authenticated with CMS API.');
  } catch (err) {
    console.error(`[Sitemap] Auth failed: ${err.message}. Aborting sitemap update.`);
    return;
  }

  // 2. Fetch all blogs
  let blogs = [];
  try {
    const res = await axios.get(`${API_BASE}/blogs?page=1&limit=500`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });
    blogs = res.data?.blogs || [];
    console.log(`[Sitemap] Fetched ${blogs.length} blog posts.`);
  } catch (err) {
    console.error(`[Sitemap] Failed to fetch blogs: ${err.message}. Aborting.`);
    return;
  }

  // 3. Build XML
  const xml = buildSitemap(blogs);

  // 4. Save locally
  fs.writeFileSync(SITEMAP_OUT, xml, 'utf-8');
  console.log(`[Sitemap] Generated ${STATIC_PAGES.length} static + ${blogs.length} blog URLs → saved locally.`);

  // 5. Push to GitHub → triggers Vercel auto-deploy
  await pushToGitHub(xml);

  // 6. Ping IndexNow for instant indexing by Bing, Yandex, etc.
  await submitToIndexNow(newBlogSlug);

  console.log('[Sitemap] Done.');
  return xml;
}

// ── Standalone execution ──────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  updateSitemap().catch(console.error);
}
