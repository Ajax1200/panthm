import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GSC_REPORT_FILE = path.join(__dirname, 'gsc_report.json');
const RECOMMENDATIONS_FILE = path.join(__dirname, 'content_recommendations.json');
const BLOGS_API = 'https://api.panthm.com/api/blogs/published?limit=100';

async function generateSeoRecommendations() {
  console.log('[SEO Insights] Starting ethical content analysis...');
  
  // 1. Load Google Search Console (GSC) query metrics
  let gscQueries = [];
  try {
    if (fs.existsSync(GSC_REPORT_FILE)) {
      const data = JSON.parse(fs.readFileSync(GSC_REPORT_FILE, 'utf-8'));
      gscQueries = data.topQueries || [];
      console.log(`[SEO Insights] Loaded ${gscQueries.length} query records from Search Console.`);
    } else {
      console.log('[SEO Insights] ⚠️ No gsc_report.json found. Creating default query list.');
      // Use fallback popular target niches if no GSC data is present
      gscQueries = [
        { query: 'outbound sales voice automation', impressions: 10, ctr: 0 },
        { query: 'AI calling agency India', impressions: 8, ctr: 0 },
        { query: 'custom text-to-speech pipelines', impressions: 5, ctr: 0 }
      ];
    }
  } catch (err) {
    console.error('[SEO Insights] Error loading GSC report:', err.message);
    return;
  }

  // 2. Fetch live published blogs from Hostinger API
  let publishedBlogs = [];
  try {
    const res = await axios.get(BLOGS_API, { timeout: 8000 });
    if (res.data && res.data.blogs) {
      publishedBlogs = res.data.blogs;
      console.log(`[SEO Insights] Fetched ${publishedBlogs.length} published blogs from DB.`);
    }
  } catch (err) {
    console.warn(`[SEO Insights] API fetch failed (${err.message}). Proceeding with local recommendations.`);
  }

  // 3. Analyze content gaps and keyword underperformance
  // Target keywords that have search impressions but 0% click-through rate (CTR)
  const underperformingKeywords = gscQueries.filter(q => q.impressions > 0 && q.ctr === 0);
  
  const recommendations = [];
  
  for (const item of underperformingKeywords) {
    const targetQuery = item.query.toLowerCase();
    
    // Check if we already have a blog post explicitly matching this keyword
    const hasCoverage = publishedBlogs.some(blog => {
      const title = blog.title.toLowerCase();
      const metaKeywords = (blog.metaKeywords || '').toLowerCase();
      const slug = (blog.slug || '').toLowerCase();
      
      return title.includes(targetQuery) || 
             metaKeywords.includes(targetQuery) || 
             slug.includes(targetQuery.replace(/\s+/g, '-'));
    });
    
    if (!hasCoverage) {
      console.log(`[SEO Insights] 💡 Content Gap Identified for: "${item.query}" (${item.impressions} impressions, 0% CTR)`);
      recommendations.push({
        keyword: item.query,
        impressions: item.impressions,
        avgPosition: item.position || 'N/A',
        recommendedAction: 'Write blog post explicitly targeting this query to capture existing organic impressions.',
        suggestedTitle: `Maximizing Outreach with ${item.query.replace(/\b\w/g, c => c.toUpperCase())}: A Modern Enterprise Playbook`,
        priority: item.impressions > 5 ? 'High' : 'Medium'
      });
    } else {
      // If we have coverage but CTR is 0, we need to optimize the existing meta title and description
      const existingPost = publishedBlogs.find(blog => 
        blog.title.toLowerCase().includes(targetQuery) || 
        (blog.metaKeywords || '').toLowerCase().includes(targetQuery)
      );
      
      if (existingPost) {
        console.log(`[SEO Insights] 💡 Metadata Optimization needed for: "${existingPost.title}" targeting "${item.query}"`);
        recommendations.push({
          keyword: item.query,
          impressions: item.impressions,
          avgPosition: item.position || 'N/A',
          recommendedAction: 'Optimize meta title & description of existing post to improve snippet attractiveness and CTR.',
          existingPostTitle: existingPost.title,
          existingPostSlug: existingPost.slug,
          priority: 'Low'
        });
      }
    }
  }

  // 4. Save recommendations to recommendations.json
  try {
    fs.writeFileSync(RECOMMENDATIONS_FILE, JSON.stringify(recommendations, null, 2), 'utf-8');
    console.log(`[SEO Insights] ✅ Generated ${recommendations.length} ethical SEO suggestions inside content_recommendations.json`);
  } catch (err) {
    console.error('[SEO Insights] Error writing recommendations:', err.message);
  }
}

generateSeoRecommendations();
