import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const MEMBER_ID = process.env.LINKEDIN_MEMBER_ID;
const MAKE_WEBHOOK_URL = process.env.LINKEDIN_MAKE_WEBHOOK_URL;

/**
 * Posts a blog link and description to LinkedIn.
 * @param {string} title Blog title
 * @param {string} excerpt Short description/excerpt
 * @param {string} slug Blog slug
 * @param {Array} tags Blog tags array
 */
export async function postToLinkedIn(title, excerpt, slug, tags = []) {
  const blogUrl = `https://panthm.com/blogs/${slug}`;
  
  // Format tags array into a hashtag string (e.g. "#AI #WebDev")
  const hashtags = Array.isArray(tags)
    ? tags.map(t => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')
    : '';

  // If a Make.com Webhook is configured, route the request through it (e.g. for Company Page posting)
  if (MAKE_WEBHOOK_URL) {
    try {
      console.log(`[LinkedIn Webhook] Routing post through Make.com webhook for company page: ${title}`);
      await axios.post(MAKE_WEBHOOK_URL, {
        title,
        excerpt,
        slug,
        link: blogUrl,
        hashtags: hashtags || '#AI #WebDevelopment #SEO #PanthmAILabs'
      });
      console.log(`[LinkedIn Webhook] ✅ Successfully sent data to Make.com Webhook.`);
      return true;
    } catch (error) {
      console.error(`[LinkedIn Webhook] ❌ Failed to send to Webhook:`, error.message);
      return false;
    }
  }

  if (!ACCESS_TOKEN || !MEMBER_ID) {
    console.warn('[LinkedIn] ⚠️ LINKEDIN_ACCESS_TOKEN or LINKEDIN_MEMBER_ID is not configured in .env. Skipping LinkedIn post.');
    return false;
  }

  const postUrl = 'https://api.linkedin.com/v2/posts';

  // Constructing a catchy LinkedIn message
  const commentary = `🚀 New Blog Post from PANTHM AI LABS!

📝 ${title}

${excerpt}

Read the full article here: ${blogUrl}

${hashtags || '#AI #WebDevelopment #SEO #LLMO #TechTrends #SoftwareEngineering #PanthmAILabs'}`;

  const payload = {
    author: `urn:li:person:${MEMBER_ID}`,
    commentary: commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED'
    },
    content: {
      article: {
        source: blogUrl,
        title: title,
        description: excerpt
      }
    },
    lifecycleState: 'PUBLISHED'
  };

  try {
    const response = await axios.post(postUrl, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    console.log(`[LinkedIn] ✅ Successfully shared post: ${title}`);
    if (response.headers['x-restli-id']) {
      console.log(`[LinkedIn] Post ID: ${response.headers['x-restli-id']}`);
    }
    return true;
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error(`[LinkedIn] ❌ Failed to post to LinkedIn:`, JSON.stringify(errorDetails));
    
    // If v2/posts fails, let's try a fallback to the legacy ugcPosts API just in case
    try {
      console.log('[LinkedIn] Trying legacy ugcPosts API fallback...');
      const ugcUrl = 'https://api.linkedin.com/v2/ugcPosts';
      const ugcPayload = {
        author: `urn:li:person:${MEMBER_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: commentary
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text: excerpt
                },
                originalUrl: blogUrl,
                title: {
                  text: title
                }
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      await axios.post(ugcUrl, ugcPayload, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log(`[LinkedIn UGC] ✅ Successfully shared post via fallback: ${title}`);
      return true;
    } catch (fallbackError) {
      const fallbackDetails = fallbackError.response?.data || fallbackError.message;
      console.error(`[LinkedIn UGC] ❌ Fallback also failed:`, JSON.stringify(fallbackDetails));
      return false;
    }
  }
}
