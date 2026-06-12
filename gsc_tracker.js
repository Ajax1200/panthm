import { google } from 'googleapis';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

// GitHub configuration (provided in GitHub Actions env)
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPO || 'Ajax1200/panthm';
const GITHUB_PATH   = 'automation/gsc_report.json';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

async function pushToGitHub(reportData) {
  if (!GITHUB_TOKEN) {
    console.log('[GSC Tracker] ⚠️ GITHUB_TOKEN not set in environment — skipping GitHub push.');
    return false;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'panthm-gsc-tracker'
  };

  let currentSha = null;
  try {
    const getRes = await axios.get(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    currentSha = getRes.data?.sha;
    console.log(`[GSC Tracker] Found existing gsc_report.json in GitHub (SHA: ${currentSha?.slice(0, 8)}...)`);
  } catch (err) {
    if (err.response?.status === 404) {
      console.log('[GSC Tracker] gsc_report.json not found in GitHub — will create it.');
    } else {
      console.warn(`[GSC Tracker] Could not fetch existing file SHA: ${err.message}`);
    }
  }

  const contentBase64 = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8').toString('base64');
  const today = new Date().toISOString().split('T')[0];
  const payload = {
    message: `chore: auto-update daily search analytics report [${today}]`,
    content: contentBase64,
    branch: GITHUB_BRANCH,
    ...(currentSha && { sha: currentSha })
  };

  try {
    const putRes = await axios.put(apiUrl, payload, { headers });
    const commitUrl = putRes.data?.commit?.html_url;
    console.log(`[GSC Tracker] ✅ GitHub push successful!`);
    if (commitUrl) console.log(`[GSC Tracker] Commit: ${commitUrl}`);
    return true;
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    console.error(`[GSC Tracker] ❌ GitHub push failed: ${detail}`);
    return false;
  }
}

async function runGSCTracker() {
  console.log('[GSC Tracker] Initializing Search Console query...');

  const credentialsJson = process.env.GSC_API_KEY_JSON;
  if (!credentialsJson) {
    console.error('[GSC Tracker] ❌ Error: GSC_API_KEY_JSON environment variable is not defined.');
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (err) {
    console.error('[GSC Tracker] ❌ Error: Failed to parse GSC_API_KEY_JSON credentials.', err.message);
    process.exit(1);
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });
    const authClient = await auth.getClient();

    const webmasters = google.webmasters({ version: 'v3', auth: authClient });

    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 3);
    const start = new Date(today);
    start.setDate(today.getDate() - 10);

    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    console.log(`[GSC Tracker] Fetching performance data from ${startDate} to ${endDate}...`);

    const response = await webmasters.searchanalytics.query({
      siteUrl: 'https://www.panthm.com/',
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 200
      }
    });

    const rows = response.data.rows || [];
    console.log(`[GSC Tracker] Query completed. Retrieved ${rows.length} terms.`);

    console.log('\n================== SEARCH CONSOLE REPORT (Last 7 Days) ==================');
    console.log(String('Query').padEnd(35) + ' | Clicks | Impressions | CTR (%) | Avg Position');
    console.log('-'.repeat(80));

    let panthmStats = { clicks: 0, impressions: 0, count: 0, avgPosSum: 0 };
    const allQueries = [];
    const lowCtrQueries = [];
    const thresholdQueries = [];

    rows.forEach(row => {
      const query = row.keys[0];
      const clicks = row.clicks;
      const impressions = row.impressions;
      const ctr = row.ctr; // fraction
      const ctrPercent = (ctr * 100).toFixed(2);
      const position = row.position;
      const positionFormatted = position.toFixed(1);

      console.log(`${query.padEnd(35)} | ${String(clicks).padStart(6)} | ${String(impressions).padStart(11)} | ${String(ctrPercent).padStart(7)}% | ${String(positionFormatted).padStart(12)}`);

      allQueries.push({ query, clicks, impressions, ctr, position });

      if (query.toLowerCase().includes('panthm')) {
        panthmStats.clicks += clicks;
        panthmStats.impressions += impressions;
        panthmStats.avgPosSum += position;
        panthmStats.count++;
      }

      // Low CTR opportunities: impressions > 10 and CTR < 2%
      if (impressions > 10 && ctr < 0.02) {
        lowCtrQueries.push(query);
      }

      // Threshold queries: ranking in position 5-15 (close to page 1 top spots)
      if (position >= 5.0 && position <= 15.0) {
        thresholdQueries.push(query);
      }
    });

    console.log('='.repeat(80));
    
    let brandSummary = null;
    if (panthmStats.count > 0) {
      const overallAvgPos = (panthmStats.avgPosSum / panthmStats.count).toFixed(1);
      console.log(`\n🎯 Brand Performance summary ("PANTHM"):`);
      console.log(`   - Clicks: ${panthmStats.clicks}`);
      console.log(`   - Impressions: ${panthmStats.impressions}`);
      console.log(`   - Average Position: ${overallAvgPos}`);
      brandSummary = {
        clicks: panthmStats.clicks,
        impressions: panthmStats.impressions,
        avgPosition: parseFloat(overallAvgPos)
      };
    } else {
      console.log('\n⚠️ No brand queries containing "PANTHM" detected in the last 7 days yet.');
    }

    // Prepare JSON report payload
    const reportData = {
      lastUpdated: new Date().toISOString(),
      dateRange: { startDate, endDate },
      brandStats: brandSummary,
      topQueries: allQueries.slice(0, 30),
      lowCtrQueries: lowCtrQueries.slice(0, 20),
      thresholdQueries: thresholdQueries.slice(0, 20)
    };

    // Push report to GitHub
    await pushToGitHub(reportData);

  } catch (err) {
    console.error('[GSC Tracker] ❌ API Execution failed:', err.message);
    process.exit(1);
  }
}

runGSCTracker().catch(() => process.exit(1));
