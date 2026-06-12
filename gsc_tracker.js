import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

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
    // Authenticate using the robust GoogleAuth client from googleapis
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });
    const authClient = await auth.getClient();

    const webmasters = google.webmasters({ version: 'v3', auth: authClient });

    // Calculate a 7-day range ending 3 days ago (Search Console data lag)
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
      siteUrl: 'sc-domain:panthm.com',
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

    rows.forEach(row => {
      const query = row.keys[0];
      const clicks = row.clicks;
      const impressions = row.impressions;
      const ctr = (row.ctr * 100).toFixed(2);
      const position = row.position.toFixed(1);

      console.log(`${query.padEnd(35)} | ${String(clicks).padStart(6)} | ${String(impressions).padStart(11)} | ${String(ctr).padStart(7)}% | ${String(position).padStart(12)}`);

      if (query.toLowerCase().includes('panthm')) {
        panthmStats.clicks += clicks;
        panthmStats.impressions += impressions;
        panthmStats.avgPosSum += row.position;
        panthmStats.count++;
      }
    });

    console.log('='.repeat(80));
    if (panthmStats.count > 0) {
      const overallAvgPos = (panthmStats.avgPosSum / panthmStats.count).toFixed(1);
      console.log(`\n🎯 Brand Performance summary ("PANTHM"):`);
      console.log(`   - Clicks: ${panthmStats.clicks}`);
      console.log(`   - Impressions: ${panthmStats.impressions}`);
      console.log(`   - Average Position: ${overallAvgPos}`);
    } else {
      console.log('\n⚠️ No brand queries containing "PANTHM" detected in the last 7 days yet.');
    }

  } catch (err) {
    console.error('[GSC Tracker] ❌ API Execution failed:', err.message);
    // Exit with 1 if GSC API fails so we get alerts
    process.exit(1);
  }
}

runGSCTracker().catch(() => process.exit(1));
