import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MAKE_WEBHOOK_URL = process.env.LINKEDIN_MAKE_WEBHOOK_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const MEMBER_ID = process.env.LINKEDIN_MEMBER_ID;

const topics = [
  "Generative Engine Optimization (GEO): The exact tactics PANTHM AI Labs uses to get our clients cited inside Perplexity, ChatGPT, and Gemini Search.",
  "Schema Markup and Knowledge Graph integration: Building structured entity nodes (like Wikidata) to dominate semantic Google searches.",
  "Programmatic SEO (pSEO) at Scale: Building directory structures with 10k+ pages while avoiding thin content flags and optimizing crawl budgets.",
  "LLM Citation Optimization: Structuring enterprise documentation and whitepapers so LLM citation parsers index and mention your brand voice.",
  "Web Core Vitals and Next.js Pre-rendering: How speed and LCP direct search engines to allocate more crawling budget to your platform.",
  "Voice Agent Outbound Qualification: Overhauling B2B outbound funnels with ultra-low latency conversational AI that logs context to CRM."
];

async function generateSocialPost() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }

  const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
  console.log(`[Daily Social Poster] Generating post for topic: "${selectedTopic}"`);

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an elite B2B growth and technical marketing architect for PANTHM AI Labs.
Write a highly authoritative, engaging social media post (LinkedIn format) explaining a tactical blueprint for: "${selectedTopic}".

Your target audience is international CEOs, CTOs, and founders who read tech teardowns. They hate marketing fluff, generic advice, and standard guides. They want practical, implementation-level insights.

Choose ONE of the following writing styles for this post:
Style A: The Technical Autopsy
- Hook: Start with a hard truth or a common architectural mistake companies make when doing SEO/GEO.
- Body: Detail the exact mechanics of why this fails, and outline the custom solution PANTHM AI Labs builds to solve it.

Style B: Tactical Checklist
- Hook: A direct statement about achieving authority or citation dominance.
- Body: A clean, 3-step numbered breakdown of the precise technical actions required. Keep it brief and focused on code/schemas/infrastructure.

Style C: The contrarian insight
- Hook: A single sentence challenging a common belief in SEO/GEO.
- Body: Support it with cold logic and technical reasoning. Detail how PANTHM implements this contrarian strategy.

CRITICAL TONE & CONTENT RULES:
1. BANNED BUZZWORDS: Do NOT use "delve," "tapestry," "unlock," "unleash," "navigate," "revolutionary," "seamless," "supercharge," or "synergy." If you use any of these, the output will fail validation.
2. EMOJIS: Use exactly ZERO or a maximum of ONE minimal emoji (e.g., ⚙️ or 📊). No spam.
3. CALL TO ACTION: Do NOT end with desperate questions like "What are your thoughts?" or "Agree?". End with a single, clear, professional statement about PANTHM AI Labs' authority (e.g. "We build these engines for enterprise clients at PANTHM AI Labs.").
4. LENGTH: Keep the entire post under 220 words.
5. OUTPUT: Output ONLY the raw post content. Do not output labels, intro/outro text, hashtags, or formatting lines.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function publishPost() {
  console.log('[Daily Social Poster] Starting publishing process...');
  let content;
  try {
    content = await generateSocialPost();
  } catch (err) {
    console.error('[Daily Social Poster] ❌ Generation failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- Generated Post Content ---');
  console.log(content);
  console.log('------------------------------\n');

  // 1. Submit to Make.com Webhook if configured
  if (MAKE_WEBHOOK_URL) {
    try {
      console.log('[Daily Social Poster] Sending to Make.com webhook...');
      await axios.post(MAKE_WEBHOOK_URL, {
        title: "PANTHM AI Labs: Daily SEO & GEO Insights",
        excerpt: content,
        slug: "daily-insight",
        link: "https://panthm.com/blogs",
        hashtags: "#SEO #GEO #GenerativeSearch #Automation #PanthmAILabs"
      });
      console.log('[Daily Social Poster] ✅ Posted via Make.com Webhook successfully.');
      return;
    } catch (err) {
      console.error('[Daily Social Poster] ❌ Make.com Webhook delivery failed:', err.message);
    }
  }

  // 2. Direct LinkedIn API Fallback
  if (ACCESS_TOKEN && MEMBER_ID) {
    try {
      console.log('[Daily Social Poster] Attempting direct LinkedIn post via API...');
      const payload = {
        author: `urn:li:person:${MEMBER_ID}`,
        commentary: `${content}\n\n#SEO #GEO #Automation #PanthmAILabs`,
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED' },
        lifecycleState: 'PUBLISHED'
      };

      await axios.post('https://api.linkedin.com/v2/posts', payload, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log('[Daily Social Poster] ✅ Posted via direct LinkedIn API successfully.');
      return;
    } catch (err) {
      const errData = err.response?.data || err.message;
      console.error('[Daily Social Poster] ❌ Direct LinkedIn posting failed:', JSON.stringify(errData));
    }
  }

  console.warn('[Daily Social Poster] ⚠️ No active social posting destination was successful. Post logged locally above.');
}

publishPost();
