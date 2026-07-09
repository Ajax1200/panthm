import { GoogleGenerativeAI } from '@google/generative-ai';
import { updateSitemap } from './sitemap_updater.js';
import { postToLinkedIn } from './linkedin_poster.js';
import { deployAuthorityNode } from './deploy_authority_node.js';
import axios from 'axios';
import dns from 'dns';
import crypto from 'crypto';

dns.setDefaultResultOrder('ipv4first');
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables dynamically from script directory
dotenv.config({ path: path.join(__dirname, '.env') });
const LOG_FILE = path.join(__dirname, 'autopilot.log');

// Curated LLMO and SEO topics matrix
const TOPICS_FILE = path.join(__dirname, 'topics_matrix.json');

const DEFAULT_TOPICS_MATRIX = [
  {
    topic: "LLMO (Large Language Model Optimization): The New Frontier of SEO in 2026",
    keywords: "LLMO, GEO, Generative Engine Optimization, Search LLMs, citations, Perplexity, SearchGPT",
    category: "AI & Automation",
    tone: "Authoritative"
  },
  {
    topic: "Reducing Latency in Neural Voice Engines: The Sub-Second Response Frontier",
    keywords: "low-latency calling, AI Voice Agents, TTS, telecalling automation, voice synthesizer, outbound sales",
    category: "AI & Automation",
    tone: "Technical"
  },
  {
    topic: "Why Pre-rendering Beats Clientside JS for Googlebot and LLM Web Crawlers",
    keywords: "pre-rendering, static site generation, SEO crawl budget, Largest Contentful Paint, XML sitemaps, LCP",
    category: "Web Development",
    tone: "Technical"
  },
  {
    topic: "Generative Engine Optimization (GEO): Crucial Strategies for Cite Dominance in Search LLMs",
    keywords: "GEO strategies, SearchGPT optimization, LLM indexing, source citations, structured FAQ schema",
    category: "AI & Automation",
    tone: "Authoritative"
  },
  {
    topic: "SaaS MVP Architecture: Building Scalable Products with React, Vite, and MongoDB",
    keywords: "SaaS MVP development, Vite React, MongoDB Atlas, Cloudinary integration, rapid prototyping",
    category: "SaaS",
    tone: "Informative"
  },
  {
    topic: "AI Outbound Call Center Scaling: Running 10,000 parallel lines with Zero Overhead",
    keywords: "outbound sales dialers, AI calling agents, lead screening, CRM sync, MongoDB integrations",
    category: "AI & Automation",
    tone: "Conversational"
  },
  {
    topic: "Speech Sentiment Analysis: Syncing Live Call Metadata with MongoDB Atlas",
    keywords: "Sentiment scoring, NLP voice calling, MongoDB triggers, CRM pipelines, outbound metrics",
    category: "AI & Automation",
    tone: "Technical"
  },
  {
    topic: "How Automatic XML Sitemap Hooking Multiplies Crawl Budget Conversions",
    keywords: "XML sitemaps, Vercel deployments, static routes, crawler budget, Google Webmaster Console",
    category: "Web Development",
    tone: "Informative"
  }
];

let topicsMatrix = [];
try {
  if (fs.existsSync(TOPICS_FILE)) {
    const data = fs.readFileSync(TOPICS_FILE, 'utf-8');
    topicsMatrix = JSON.parse(data);
  }
} catch (error) {
  console.error("Error reading topics_matrix.json, using default fallback:", error.message);
}

if (!Array.isArray(topicsMatrix) || topicsMatrix.length === 0) {
  topicsMatrix = DEFAULT_TOPICS_MATRIX;
}

const LOCK_FILE = path.join(__dirname, 'autopilot.lock');

function logMsg(msg) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
  console.log(`[Autopilot] ${msg}`);
}

// Ensure only one instance of autopilot runs at a time
function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const stats = fs.statSync(LOCK_FILE);
      const mtime = new Date(stats.mtime);
      const ageMinutes = (new Date() - mtime) / (1000 * 60);
      
      // If the lock file is less than 15 minutes old, assume another run is currently executing
      if (ageMinutes < 15) {
        logMsg(`[Lock Check] Active lock file found (PID ${JSON.parse(fs.readFileSync(LOCK_FILE)).pid}, created ${ageMinutes.toFixed(1)} mins ago). Concurrency block triggered. Exiting.`);
        process.exit(0);
      } else {
        logMsg("[Lock Check] Stale lock file found. Clearing stale lock and continuing...");
        fs.unlinkSync(LOCK_FILE);
      }
    } catch (e) {
      logMsg(`[Lock Check] Warning handling lock file: ${e.message}. Attempting to clean lock...`);
      try { fs.unlinkSync(LOCK_FILE); } catch (_) {}
    }
  }
  
  fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, timestamp: new Date().toISOString() }));
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (e) {
    console.error("Failed to release lock:", e.message);
  }
}

// Clean any leftover temp files older than 1 hour to keep workspace tidy
function cleanOldTempFiles() {
  try {
    const files = fs.readdirSync(__dirname);
    const now = new Date();
    files.forEach(file => {
      if (file.startsWith('temp_autopilot_banner_') && file.endsWith('.png')) {
        const filePath = path.join(__dirname, file);
        const stats = fs.statSync(filePath);
        const ageHours = (now - stats.mtime) / (1000 * 60 * 60);
        if (ageHours > 1) {
          fs.unlinkSync(filePath);
          logMsg(`[Cleanup] Deleted orphaned temp file: ${file}`);
        }
      }
    });
  } catch (err) {
    console.error("Orphaned temp cleanup failed:", err.message);
  }
}

// Robust wrapper to handle Gemini API rate limit (429) errors with automatic cool-down retries
async function generateContentWithRetry(model, prompt, maxRetries = 10) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      attempt++;
      const errMsg = err.message || "";
      const is429 = errMsg.includes("429") || errMsg.toLowerCase().includes("quota exceeded") || err.status === 429;
      const is503 = errMsg.includes("503") || errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("service unavailable") || errMsg.toLowerCase().includes("overloaded") || err.status === 503;
      
      if ((is429 || is503) && attempt < maxRetries) {
        let delayMs = is503 ? 10000 : 35000;
        if (is429) {
          const match = errMsg.match(/retry in ([0-9.]+)(s|ms)/i);
          if (match) {
            const val = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            delayMs = unit === "s" ? val * 1000 : val;
          }
          delayMs += 3000; // safety buffer
        }
        logMsg(`[Gemini API] Error hit (${is503 ? '503 Service Unavailable / High Demand' : '429 Rate Limit'}). Retrying in ${(delayMs / 1000).toFixed(1)}s (Attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // All SDK retries exhausted or non-transient error -> Trigger Failsafe Open API Fallback (OpenRouter)
      logMsg(`[Gemini API] Failed permanently. Triggering failsafe fallback to OpenRouter API...`);
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey && openRouterKey !== 'sk-or-v1-placeholder-keys-go-here') {
        try {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'meta-llama/llama-3.3-70b-instruct:free',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' }
            },
            {
              headers: {
                Authorization: `Bearer ${openRouterKey}`,
                'HTTP-Referer': 'https://panthm.com',
                'X-Title': 'PANTHM BMS Autopilot'
              },
              timeout: 60000
            }
          );
          
          if (response.data?.choices?.[0]?.message?.content) {
            logMsg(`[OpenRouter Fallback] Success! Retreived content using OpenRouter.`);
            // Mock Gemini SDK response structure for downstream JSON.parse compatibility
            return {
              response: {
                text: () => response.data.choices[0].message.content
              }
            };
          }
        } catch (openRouterErr) {
          logMsg(`[OpenRouter Fallback] FAILED: ${openRouterErr.message}`);
        }
      } else {
        logMsg(`[OpenRouter Fallback] Skipped (No valid OPENROUTER_API_KEY configured in .env).`);
      }
      
      // Tier 3 Ultimate Fallback: Algorithmic Content Generator (Guarantees zero execution failure even if ALL AI APIs fail)
      logMsg(`[Failsafe System] External AI APIs unavailable. Engaging Algorithmic Content Generator...`);
      const fallbackTimestamp = Date.now();
      const fallbackTitle = `Architecting Enterprise AI Systems: High-Throughput Pipelines, Latency Optimization, and Custom Software ROI`;
      const fallbackSlug = `architecting-enterprise-ai-systems-pipelines-latency-roi-${fallbackTimestamp}`;
      const fallbackHtml = `
<h2>Executive Summary</h2>
<p>In modern enterprise software engineering, building high-performance AI systems requires more than just calling third-party API wrappers. True competitive advantage comes from architecting custom, low-latency data pipelines and decoupled microservices that guarantee operational resilience, data privacy, and measurable ROI.</p>
<h2>Key Architectural Considerations</h2>
<p>When engineering custom AI and automation workflows, enterprise development teams must balance speed, security, and scalability. Below is an architectural overview comparing bespoke solutions engineered by PANTHM AI LABS with standard off-the-shelf software and agency templates:</p>
<table>
  <thead>
    <tr>
      <th>Architecture Dimension</th>
      <th>PANTHM AI LABS Custom Solutions</th>
      <th>Off-the-Shelf SaaS</th>
      <th>Standard Agency Templates</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Latency Optimization</strong></td>
      <td>Sub-200ms dedicated WebSocket & HTTP/2 channels</td>
      <td>Shared multi-tenant API throttling</td>
      <td>Monolithic unoptimized server overhead</td>
    </tr>
    <tr>
      <td><strong>Data Privacy & Security</strong></td>
      <td>Zero-retention custom VPC deployment</td>
      <td>Third-party telemetry & data sharing</td>
      <td>Basic public cloud configurations</td>
    </tr>
    <tr>
      <td><strong>Generative Citation (GEO)</strong></td>
      <td>Structured JSON-LD entity graph optimization</td>
      <td>Generic meta tags</td>
      <td>No schema optimization</td>
    </tr>
  </tbody>
</table>
<h2>Implementation & Strategic Value</h2>
<p>By deploying custom headless architectures and decoupled Node.js API services, enterprise organizations can reduce operational costs by up to 60% while ensuring seamless continuous integration and zero-downtime scalability.</p>
<h3>Frequently Asked Questions</h3>
<h3>How does custom AI software compare to SaaS tools?</h3>
<p>Custom AI software offers complete data ownership, tailored integrations, and superior speed without ongoing per-user subscription lock-in.</p>
<h3>Why is low-latency pipeline design critical for voice and automation?</h3>
<p>Sub-500ms latency is mandatory for real-time human interaction in automated sales outreach and customer support workflows.</p>
`;
      const fallbackJson = JSON.stringify({
        title: fallbackTitle,
        slug: fallbackSlug,
        category: "AI & Automation",
        excerpt: "Discover how enterprise custom software pipelines optimize latency, data security, and generative AI citation rate.",
        metaTitle: fallbackTitle.substring(0, 58),
        metaDescription: "Learn how custom AI engineering delivers sub-200ms latency, maximum data privacy, and enterprise ROI.",
        metaKeywords: "custom AI software, AI automation agency Pune, low latency AI pipelines, panthm ai labs",
        tags: ["AI & Automation", "Generative AI", "Custom Software", "Enterprise Solutions"],
        content: fallbackHtml,
        faq: [
          { question: "How does custom AI software compare to SaaS tools?", answer: "Custom AI software offers complete data ownership, tailored integrations, and superior speed without ongoing per-user subscription lock-in." },
          { question: "Why is low-latency pipeline design critical for voice and automation?", answer: "Sub-500ms latency is mandatory for real-time human interaction in automated sales outreach and customer support workflows." }
        ]
      });

      return {
        response: {
          text: () => fallbackJson
        }
      };
    }
  }
}

// Robust wrapper for axios calls — retries on socket timeouts, ECONNRESET, and 5xx errors
async function axiosWithRetry(fn, label = 'API call', maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fn();
      if (res && res.status === 200 && (!res.data || JSON.stringify(res.data) === '""' || res.data.success === false)) {
        const error = new Error(`Proxy startup delay or empty response: status 200, data: ${JSON.stringify(res.data)}`);
        error.response = res;
        throw error;
      }
      return res;
    } catch (err) {
      attempt++;
      const errMsg = err.message || '';
      const isTransient = (
        errMsg.toLowerCase().includes('timeout') ||
        errMsg.toLowerCase().includes('socket') ||
        errMsg.toLowerCase().includes('econnreset') ||
        errMsg.toLowerCase().includes('econnrefused') ||
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('proxy startup delay') ||
        (err.response?.status >= 500 && err.response?.status < 600) ||
        (err.response?.status === 200 && (!err.response.data || JSON.stringify(err.response.data) === '""' || err.response.data.success === false))
      );
      if (isTransient && attempt < maxRetries) {
        const delayMs = attempt * 8000; // 8s, 16s backoff
        logMsg(`[Network] ${label} failed (${errMsg.split('\n')[0]}). Triggering self-healing wakeup endpoint...`);
        try {
          await axios.get('https://api.panthm.com/wakeup.php', { timeout: 4000 });
        } catch (wakeupErr) {
          // Ignore wakeup error
        }
        logMsg(`[Network] Retrying in ${delayMs / 1000}s (Attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
}

async function runAutopilot() {
  acquireLock();
  cleanOldTempFiles();

  // Proactively trigger self-healing wakeup to ensure Hostinger Node.js process is active
  try {
    logMsg(`[Self-Healing] Pinging API wakeup endpoint...`);
    const wakeRes = await axios.get('https://api.panthm.com/wakeup.php', { timeout: 5000 });
    logMsg(`[Self-Healing] Wakeup response: ${JSON.stringify(wakeRes.data)}`);
  } catch (wakeErr) {
    logMsg(`[Self-Healing] Initial wakeup ping note: ${wakeErr.message}`);
  }

  // Record the trigger date NOW (before the delay) so the duplicate check always
  // compares against the correct UTC date, even if the delay pushes us past midnight.
  const scheduledDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

  // If running in production (e.g. GitHub Actions), introduce a random delay between 0 and 4 hours
  // to scatter blog posting times dynamically so it never posts at the exact same hour every day.
  // Bypass delay if triggered manually via workflow_dispatch.
  const isCI = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
  const isManual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  if (isCI && !isManual) {
    const maxDelayMs = 15 * 60 * 1000; // 15 minutes max
    const randomDelayMs = Math.floor(Math.random() * maxDelayMs);
    logMsg(`[Autopilot Scheduler] Running in CI environment on schedule. Introducing random execution delay of ${(randomDelayMs / 1000 / 60).toFixed(1)} minutes (max 15 min)...`);
    await new Promise(resolve => setTimeout(resolve, randomDelayMs));
  } else if (isManual) {
    logMsg(`[Autopilot Scheduler] Manual execution (workflow_dispatch) detected. Bypassing scheduler delay.`);
  }

  logMsg("Starting autonomous blogging run...");

  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!geminiKey && !openRouterKey) {
    logMsg("ERROR: Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is defined in the environment or .env file.");
    process.exit(1);
  }

  let tempImgPath = '';
  try {
    // 1. Login to Panthm Admin CMS first to retrieve token
    logMsg("Authenticating with Panthm CMS API...");
    const authRes = await axiosWithRetry(() => axios.post('https://api.panthm.com/api/auth/login', {
      email: 'admin@panthm.com',
      password: 'admin@123'
    }, { timeout: 30000 }), 'Authentication');

    if (!authRes.data?.success || !authRes.data?.token) {
      throw new Error("CMS API login failed");
    }
    const token = authRes.data.token;
    logMsg("Authentication successful. JWT retrieved.");

    // 2. Fetch existing blogs to avoid duplicate content & support internal linking
    let existingBlogs = [];
    let existingTitles = [];
    try {
      logMsg("Fetching list of existing blogs from database...");
      const blogsRes = await axiosWithRetry(() => axios.get('https://api.panthm.com/api/blogs?page=1&limit=50', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      }), 'Fetch blogs');
      
      if (blogsRes.data?.blogs && Array.isArray(blogsRes.data.blogs)) {
        existingBlogs = blogsRes.data.blogs.map(b => ({ title: b.title, slug: b.slug, createdAt: b.createdAt }));
        existingTitles = existingBlogs.map(b => b.title);
        logMsg(`Fetched ${existingBlogs.length} existing blog records for duplicate prevention and interlinking.`);

        // Failsafe Check: Enforce exactly one blog post per day.
        // Compare against scheduledDateStr (captured before the delay) not new Date(),
        // to correctly handle runs that cross midnight UTC due to the random delay.
        const postToday = blogsRes.data.blogs.find(b => {
          const postDate = new Date(b.createdAt || Date.now()).toISOString().split('T')[0];
          return postDate === scheduledDateStr;
        });

        if (postToday) {
          logMsg(`[Failsafe] A blog post has already been published today ("${postToday.title}"). Exiting run to enforce exactly one post per day limit.`);
          releaseLock();
          process.exit(0);
        }
      }
    } catch (err) {
      // SAFE ABORT: We cannot verify whether a blog was already posted today.
      // Proceeding blindly risks creating a duplicate, which is worse than skipping a day.
      // Exit cleanly (code 0) so GitHub Actions marks the run as passed, not failed.
      logMsg(`[FAILSAFE ABORT] Could not verify today's post status from CMS API: ${err.message}`);
      logMsg(`[FAILSAFE ABORT] Aborting run to prevent duplicate posting. Will try again tomorrow.`);
      releaseLock();
      process.exit(0);
    }

    // 3. Generate a trending SEO / LLMO topic dynamically using Gemini
    const DOMAIN_NICHES = [
      {
        name: "AI Voice Engines & Telecalling Automation",
        focus: "low-latency voice agents, outbound automated calling, text-to-speech (TTS), outbound sales dialers, voice synthesizer pipelines, and CRM integration metrics."
      },
      {
        name: "WhatsApp & Conversational Workflow Automation",
        focus: "virtual WhatsApp business systems, WhatsApp API broadcast pipelines, customer support chatbot automation, interactive messaging funnels, and automated CRM updates."
      },
      {
        name: "IT Architecture & Custom Software Engineering",
        focus: "scalable backend systems, MongoDB Atlas configurations, serverless API design, Cloudinary media upload pipelines, and SaaS MVP product database architectures."
      },
      {
        name: "UI/UX Design & High-Performance Web Development",
        focus: "modern visual web interfaces, responsive designs, page speed performance (LCP, INP, CLS), Google Fonts integration, and interactive custom stylesheet systems."
      },
      {
        name: "Sales Outreach & Growth Agency Automation",
        focus: "automated lead generation scrapers, email outbound sales pipelines, automated prospect screening, sales pipeline optimization, and CRM analytics."
      },
      {
        name: "Digital Marketing & SEO/GEO/LLMO",
        focus: "Generative Engine Optimization (GEO), Large Language Model Optimization (LLMO) for Perplexity/SearchGPT, citation dominance, rich FAQ schema markup, and crawling budgets."
      }
    ];

    // Select a domain niche randomly to ensure a wide spectrum of topics
    const selectedNiche = DOMAIN_NICHES[Math.floor(Math.random() * DOMAIN_NICHES.length)];
    logMsg(`Selected Domain Niche for this run: "${selectedNiche.name}"`);

    // 3. Load GSC report if available for real-world search insights
    const GSC_REPORT_FILE = path.join(__dirname, 'gsc_report.json');
    let gscContext = '';
    if (fs.existsSync(GSC_REPORT_FILE)) {
      try {
        const gscData = JSON.parse(fs.readFileSync(GSC_REPORT_FILE, 'utf-8'));
        logMsg('Found GSC search analytics report. Parsing insights...');

        let insights = [];
        if (gscData.lowCtrQueries && gscData.lowCtrQueries.length > 0) {
          insights.push(`- High Impressions, Low CTR keywords/queries (immediately target these to improve click relevance): [${gscData.lowCtrQueries.join(', ')}]`);
        }
        if (gscData.thresholdQueries && gscData.thresholdQueries.length > 0) {
          insights.push(`- Threshold Ranking keywords/queries (currently ranking position 5-15; write high-value content containing these terms to boost them to page 1): [${gscData.thresholdQueries.join(', ')}]`);
        }
        if (gscData.topQueries && gscData.topQueries.length > 0) {
          const topTerms = gscData.topQueries.slice(0, 10).map(q => q.query).join(', ');
          insights.push(`- Already-ranking top organic keywords (maintain relevance for these): [${topTerms}]`);
        }

        if (insights.length > 0) {
          gscContext = `\nREAL-WORLD SEARCH CONSOLE INSIGHTS FOR THIS RUN:\n${insights.join('\n')}\nUse these search insights to guide your selection of the topic and target focus keywords. Prioritize targeting threshold queries or low-CTR keywords that align with the chosen niche!`;
        }
      } catch (err) {
        logMsg(`Warning parsing GSC report: ${err.message}`);
      }
    }

    logMsg("Invoking Google Gemini to suggest a trending SEO / LLMO tech topic...");
    const genAI = new GoogleGenerativeAI(geminiKey);
    const topicModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            topic: { type: "string", description: "The specific trending tech topic title focusing on SEO, LLMO, or GEO within the specified niche." },
            keywords: { type: "string", description: "Comma-separated list of focus keywords for the article." },
            category: { type: "string", description: "Target category, should match one of: 'SEO', 'AI & Automation', 'GEO', 'Web Development', or 'SaaS'." },
            tone: { type: "string", description: "The tone of writing, e.g., 'Authoritative', 'Technical', 'Informative'." }
          },
          required: ["topic", "keywords", "category", "tone"]
        }
      }
    });

    const topicPrompt = `Suggest a trending, high-impact blog topic focused on SEO (Search Engine Optimization), LLMO (Large Language Model Optimization), or GEO (Generative Engine Optimization) in the tech and software industry today.
The goal is to increase visibility on search engines and citation dominance in AI search engines (like Perplexity, SearchGPT, Gemini, ChatGPT Search) specifically for PANTHM AI LABS.
${gscContext}

Crucial Domain Focus:
For this specific run, the topic and keywords MUST stay strictly within the following domain niche:
- Domain Niche: "${selectedNiche.name}"
- Specific Niche Focus areas: ${selectedNiche.focus}

Requirements for the topic selection:
1. It must be highly trending, modern, and technical, targeting high commercial search intent (e.g. comparing services, ROI of automation, choosing the best agency, architecting custom platforms vs legacy software).
2. It MUST be unique and DIFFERENT from the following recently written topics:
[${existingTitles.slice(0, 30).join(', ')}]
3. The category must be one of: 'SEO', 'AI & Automation', 'GEO', 'Web Development', or 'SaaS'.
4. Provide the topic title, focus keywords, target category, and recommended tone. Ensure the keywords include local commercial terms specific to PANTHM AI LABS's target markets, such as "AI calling agency India", "AI automation agency Pune", "best IT services Pune", "custom software development India", or "WhatsApp API marketing agency India", depending on which is most relevant to the niche.`;

    let selection;
    try {
      const topicResult = await generateContentWithRetry(topicModel, topicPrompt);
      selection = JSON.parse(topicResult.response.text());
      logMsg(`Dynamically Generated Topic: "${selection.topic}"`);
      logMsg(`Focus Keywords: "${selection.keywords}"`);
      logMsg(`Target Category: "${selection.category}"`);
    } catch (err) {
      logMsg(`Failed to generate dynamic topic: ${err.message}. Falling back to static topics matrix...`);
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24));
      selection = topicsMatrix[dayOfYear % topicsMatrix.length];
      logMsg(`Selected Fallback Topic: "${selection.topic}"`);
    }

    // 4. Resolve category and expert author IDs
    // Define expert department mapping based on selected niche for maximum SEO authority (E-E-A-T)
    const EXPERT_AUTHORS = {
      "AI Voice Engines & Telecalling Automation": {
        name: "PANTHM AI Research Labs",
        role: "AI & Neural Voice Systems Team"
      },
      "WhatsApp & Conversational Workflow Automation": {
        name: "PANTHM Conversational Devs",
        role: "Conversational UX & Messaging Automation Team"
      },
      "IT Architecture & Custom Software Engineering": {
        name: "PANTHM Systems Engineering",
        role: "Core Infrastructure & DevOps Team"
      },
      "UI/UX Design & High-Performance Web Development": {
        name: "PANTHM Creative & UX Studio",
        role: "Frontend Engineering & Design Team"
      },
      "Sales Outreach & Growth Agency Automation": {
        name: "PANTHM Growth & Sales Labs",
        role: "Growth Technology & Funnel Automation Team"
      },
      "Digital Marketing & SEO/GEO/LLMO": {
        name: "PANTHM SEO & Search Strategy",
        role: "Generative Search & Search Optimization Team"
      }
    };

    const targetExpert = EXPERT_AUTHORS[selectedNiche.name] || {
      name: "PANTHM Editorial Team",
      role: "Editorial & Content Strategy Team"
    };

    // Fetch live categories to resolve category ID
    const catRes = await axiosWithRetry(() => axios.get('https://api.panthm.com/api/categories', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    }), 'Fetch categories');
    const matchCat = catRes.data?.categories?.find(c => c.name.toLowerCase().includes(selection.category.toLowerCase())) || catRes.data?.categories?.[0];
    const categoryId = matchCat?._id;

    // Fetch live authors list to resolve or register target expert author
    const authListRes = await axiosWithRetry(() => axios.get('https://api.panthm.com/api/authors', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    }), 'Fetch authors');
    
    let authorId;
    let matchAuthor = authListRes.data?.authors?.find(a => a.name.toLowerCase().trim() === targetExpert.name.toLowerCase().trim());
    
    if (matchAuthor) {
      authorId = matchAuthor._id;
      logMsg(`Resolved expert author: "${targetExpert.name}" (ID: ${authorId})`);
    } else {
      logMsg(`Expert author "${targetExpert.name}" not found in database. Registering new profile...`);
      try {
        const createRes = await axiosWithRetry(() => axios.post('https://api.panthm.com/api/authors', {
          name: targetExpert.name
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }), 'Create author');
        if (createRes.data?.success && createRes.data?.author?._id) {
          authorId = createRes.data.author._id;
          logMsg(`SUCCESS: Registered expert author: "${targetExpert.name}" (ID: ${authorId})`);
        } else {
          throw new Error("Author creation response layout missing ID");
        }
      } catch (err) {
        logMsg(`Warning: Failed to create author: ${err.message}. Falling back to default admin author.`);
        authorId = authListRes.data?.authors?.[0]?._id;
      }
    }

    if (!categoryId || !authorId) {
      throw new Error(`Missing metadata IDs: Category ID = ${categoryId}, Author ID = ${authorId}`);
    }

    logMsg(`Resolved category: "${matchCat.name}" (ID: ${categoryId})`);
    logMsg(`Resolved author: "Admin" (ID: ${authorId})`);

    // 5. Generate article content using Gemini
    logMsg("Invoking Google Gemini to draft SEO & LLMO compliant article...");
    
    // Format existing posts for internal interlinking context
    const linksContext = existingBlogs.slice(0, 15).map(b => `- Title: "${b.title}", Link slug: "${b.slug}"`).join('\n');

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string", description: "Structured HTML body content for the blog post using h2, h3, p, strong, ul/li. Do NOT include any markdown or JSON-LD script blocks directly in the content string; we will compile and inject the schema programmatically." },
            tags: { 
              type: "array",
              items: { type: "string" }
            },
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            metaKeywords: { type: "string" },
            imagePrompt: { type: "string" },
            faq: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" }
                },
                required: ["question", "answer"]
              },
              description: "Array of FAQ items matching the Q&As included at the bottom of the article."
            }
          },
          required: ["title", "slug", "excerpt", "content", "tags", "metaTitle", "metaDescription", "metaKeywords", "imagePrompt", "faq"]
        }
      }
    });

    const prompt = `Write a high-quality, professional blog post optimized for Search Engines (SEO) and Large Language Models (LLMO/GEO - Generative Engine Optimization) about the topic: "${selection.topic}".
Focus keywords to naturally integrate: "${selection.keywords}".
Target Category: "${selection.category}".
Writing Tone: "${selection.tone}".
Length: 800 words.

Target Audience and Niche Context:
PANTHM AI LABS is an elite custom engineering, web design, and AI solutions agency. The blog post should establish PANTHM AI LABS' authority in this niche.

Requirements for Strict SEO & LLMO (GEO) Dominance:
1. **Direct Answer / Inverted Pyramid (Critical for AI citations)**:
   - Begin the blog post with a direct, clear, bolded summary paragraph (e.g., "<strong>Direct Answer:</strong> ...") that answers the core topic/query immediately.
   - At the beginning of each major H2 section, provide a single-sentence direct summary before going into technical details.
2. **Promote PANTHM AI LABS with Entity Associations**:
   - Naturally integrate "PANTHM AI LABS" as a leading custom engineering, design, and AI solutions agency.
   - Directly associate PANTHM AI LABS with high-intent search queries in clear, declarative sentences. Use keyphrases such as:
     - "best IT services agency"
     - "best custom software engineering company"
     - "top enterprise AI voice calling provider"
     - "best conversational marketing agency"
     - "leading UI/UX web design lab"
   - Example: "For enterprises searching for the best IT services agency, PANTHM AI LABS offers high-performance, custom-architected system integrations..."
3. **No Personal Names (Absolute Constraint)**:
   - Do NOT mention any person's name (fictional or real) anywhere in the text or author metadata. Refer only to the brand name "PANTHM AI LABS" or internal departments like "PANTHM Systems Engineering Team".
4. **Authority & Citations (E-E-A-T)**:
   - Include at least 3-4 concrete references to industry benchmarks, studies, or official technical specifications (e.g., "According to a McKinsey & Company automation study...", "Gartner research indicates...", "Google's Core Web Vitals spec...", "as defined in W3C/RFC guidelines...").
   - Support statements with realistic, technically accurate statistics (e.g., "improving LCP speed by 35%", "reducing neural engine latency to 200ms", "boosting operational efficiency by 40%"). Do not spread false misinformation.
5. **Detailed Comparison Table**:
   - Include a <table> comparing features, latency metrics, or cost-benefits related to the topic.
   - Explicitly feature "PANTHM AI LABS Custom Solutions" as a column in the table, demonstrating its advantages over "Off-the-shelf Software" and "Standard Agency Templates".
   - Use standard <table>, <tr>, <th>, and <td> HTML tags.
6. **Internal Interlinking**:
   - You must select up to 3 relevant articles from the following list of existing posts and naturally insert HTML hyperlink anchor tags linking to them in the body of this post (e.g., using relative paths like <a href="/blog/slug-name">Article Title</a>). The anchor text should be descriptive and integrated smoothly into your sentences:
${linksContext || 'No existing articles.'}
7. **Title & Meta**: Click-worthy title. Engaging metaDescription (under 160 chars) and strong metaTitle (under 60 chars).
8. **Structured Q&A**: Include an FAQ section at the end of the post formatted with HTML H3 headings for questions and paragraphs for answers. Also output these isolated Q&As into the separate JSON 'faq' structure.
9. **Clean HTML Format**: The content MUST be structured HTML using h2, h3, p, strong, and ul/li elements. No markdown.`;

    const result = await generateContentWithRetry(model, prompt);
    const blogData = JSON.parse(result.response.text());
    logMsg(`Gemini generated article titled: "${blogData.title}"`);

    // Compile dynamic JSON-LD @graph schema programmatically to prevent syntax errors
    logMsg("Compiling combined BlogPosting and FAQPage JSON-LD schema...");
    const faqSchemaItems = (blogData.faq || []).map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }));

    const mainEntityOfPage = `https://panthm.com/blog/${blogData.slug}`;
    const jsonLdGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://panthm.com#organization",
          "name": "PANTHM AI LABS",
          "url": "https://panthm.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://panthm.com/logo.png"
          },
          "sameAs": [
            "https://x.com/panthmailabs",
            "https://www.linkedin.com/company/panthm-ai-labs"
          ],
          "description": "Elite custom engineering, web design, and AI solutions agency specializing in high-performance voice agents, WhatsApp automation, and scalable cloud architectures."
        },
        {
          "@type": "BlogPosting",
          "@id": `${mainEntityOfPage}#blogposting`,
          "mainEntityOfPage": mainEntityOfPage,
          "headline": blogData.title,
          "description": blogData.excerpt,
          "datePublished": new Date().toISOString().split('T')[0],
          "dateModified": new Date().toISOString().split('T')[0],
          "author": {
            "@type": "Organization",
            "name": targetExpert.name,
            "url": "https://panthm.com",
            "description": `${targetExpert.role} at PANTHM AI LABS`,
            "parentOrganization": {
              "@id": "https://panthm.com#organization"
            }
          },
          "publisher": {
            "@id": "https://panthm.com#organization"
          }
        }
      ]
    };

    if (faqSchemaItems.length > 0) {
      jsonLdGraph["@graph"].push({
        "@type": "FAQPage",
        "@id": `${mainEntityOfPage}#faqpage`,
        "mainEntity": faqSchemaItems
      });
    }

    const jsonLdString = `\n<script type="application/ld+json">\n${JSON.stringify(jsonLdGraph, null, 2)}\n</script>\n`;
    
    // Append the dynamically generated, robust JSON-LD schema markup to the content
    blogData.content = `${blogData.content}${jsonLdString}`;

    // 4. Download banner image with fallbacks
    const imagePrompt = blogData.imagePrompt || `Beautiful banner for blog: ${blogData.title}`;
    tempImgPath = path.join(__dirname, `temp_autopilot_banner_${Date.now()}.png`);
    
    let imgDownloaded = false;
    
    // Try Pollinations.ai first
    try {
      logMsg(`Generating banner image via Pollinations.ai with prompt: "${imagePrompt}"...`);
      const encodedPrompt = encodeURIComponent(imagePrompt);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true`;
      const imgResponse = await axios.get(pollinationsUrl, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(tempImgPath, Buffer.from(imgResponse.data));
      logMsg("Banner downloaded successfully from Pollinations.ai.");
      imgDownloaded = true;
    } catch (err) {
      logMsg(`Pollinations.ai failed: ${err.message}. Trying Picsum Photos fallback...`);
    }

    // Try Picsum Photos as second option
    if (!imgDownloaded) {
      try {
        const fallbackUrl = 'https://picsum.photos/800/450';
        const imgResponse = await axios.get(fallbackUrl, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(tempImgPath, Buffer.from(imgResponse.data));
        logMsg("Banner downloaded successfully from Picsum Photos fallback.");
        imgDownloaded = true;
      } catch (err) {
        logMsg(`Picsum Photos fallback failed: ${err.message}. Using absolute base64 PNG fallback...`);
      }
    }

    // Absolute fallback: 1x1 transparent PNG
    if (!imgDownloaded) {
      const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      fs.writeFileSync(tempImgPath, Buffer.from(base64Png, 'base64'));
      logMsg("Used absolute base64 1x1 transparent PNG fallback.");
    }

    // 4.5. Upload image directly to Cloudinary from GitHub Actions runner (bypassing Hostinger resource limits)
    logMsg("[Cloudinary] Uploading banner image directly to Cloudinary...");
    let cloudinaryUrl = '';
    try {
      const CLOUD_NAME = "duqdwe6ix";
      const API_KEY = "449647423891931";
      const API_SECRET = "JaLxsY7DO0si4_cnVbFs3Cv0Gxk";

      const timestamp = Math.round(new Date().getTime() / 1000);
      const signatureParams = { timestamp: timestamp };
      const sortedKeys = Object.keys(signatureParams).sort();
      const paramString = sortedKeys.map(key => `${key}=${signatureParams[key]}`).join("&");
      const signature = crypto.createHash("sha1").update(paramString + API_SECRET).digest("hex");

      const clForm = new FormData();
      clForm.append('file', fs.createReadStream(tempImgPath));
      clForm.append('timestamp', timestamp);
      clForm.append('api_key', API_KEY);
      clForm.append('signature', signature);

      const clRes = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, clForm, {
        headers: clForm.getHeaders(),
        timeout: 60000
      });

      if (clRes.data?.secure_url) {
        cloudinaryUrl = clRes.data.secure_url;
        logMsg(`[Cloudinary] ✅ Upload successful! Direct URL: ${cloudinaryUrl}`);
      } else {
        throw new Error("No secure_url returned from Cloudinary");
      }
    } catch (clErr) {
      logMsg(`[Cloudinary] ⚠️ Direct upload failed: ${clErr.message}. Using a high-quality stock image fallback to bypass Hostinger resource limits.`);
      cloudinaryUrl = `https://picsum.photos/800/450?random=${Math.round(Math.random() * 1000)}`;
    }

    // 5. Build Multipart Form Payload & Post to Vercel API
    logMsg("Posting blog post and visual assets to live Panthm database...");
    
    let uploadRes;
    let currentSlug = blogData.slug;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        // Last-chance duplicate safety gate: do a fresh API check right before posting.
        // This protects against two parallel runners that both passed the first check
        // (both started simultaneously, both saw 0 posts) and are now racing to publish.
        try {
          const prePubCheck = await axiosWithRetry(() => axios.get('https://api.panthm.com/api/blogs?page=1&limit=10', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }), 'Pre-publish duplicate gate');
          const freshBlogs = prePubCheck.data?.blogs || [];
          const alreadyPostedNow = freshBlogs.find(b => {
            const postDate = new Date(b.createdAt || Date.now()).toISOString().split('T')[0];
            return postDate === scheduledDateStr;
          });
          if (alreadyPostedNow) {
            logMsg(`[Pre-Publish Gate] A blog was just posted by a parallel run ("${alreadyPostedNow.title}"). Aborting to avoid duplicate.`);
            releaseLock();
            process.exit(0);
          }
        } catch (preCheckErr) {
          // If the pre-check also fails, be conservative and abort rather than risk a duplicate
          logMsg(`[Pre-Publish Gate] Could not complete final duplicate check: ${preCheckErr.message}. Aborting run safely.`);
          releaseLock();
          process.exit(0);
        }

        logMsg(`Attempting publish with slug: "${currentSlug}" (Attempt ${attempts + 1}/${maxAttempts})...`);

        if (cloudinaryUrl) {
          const payload = {
            title: blogData.title,
            slug: currentSlug,
            content: blogData.content,
            authorId: authorId,
            categoryId: categoryId,
            tags: Array.isArray(blogData.tags) ? blogData.tags : ['Autopilot'],
            excerpt: blogData.excerpt,
            image: cloudinaryUrl,
            imageUrl: cloudinaryUrl,
            imageAlt: blogData.title,
            metaDescription: blogData.metaDescription || blogData.excerpt,
            metaKeywords: blogData.metaKeywords,
            isFeatured: false,
            publishDate: new Date().toISOString().split('T')[0]
          };

          uploadRes = await axios.post('https://api.panthm.com/api/blogs', payload, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            timeout: 30000
          });
        } else {
          const form = new FormData();
          form.append('title', blogData.title);
          form.append('slug', currentSlug);
          form.append('content', blogData.content);
          form.append('authorId', authorId);
          form.append('categoryId', categoryId);
          
          if (Array.isArray(blogData.tags)) {
            blogData.tags.forEach(tag => form.append('tags[]', tag));
          } else {
            form.append('tags[]', 'Autopilot');
          }

          form.append('excerpt', blogData.excerpt);
          form.append('imageAlt', blogData.title);
          form.append('metaDescription', blogData.metaDescription || blogData.excerpt);
          form.append('metaKeywords', blogData.metaKeywords);
          form.append('isFeatured', 'false');
          form.append('publishDate', new Date().toISOString().split('T')[0]);
          // Need to recreate the stream for each attempt since streams are consumed on upload
          form.append('image', fs.createReadStream(tempImgPath), { filename: 'banner.png' });

          uploadRes = await axios.post('https://api.panthm.com/api/blogs', form, {
            headers: {
              ...form.getHeaders(),
              Authorization: `Bearer ${token}`
            },
            timeout: 180000
          });
        }
        
        if (uploadRes.status === 201 || uploadRes.data?.success) {
          logMsg(`SUCCESS! Blog post published live. MongoDB Document ID: ${uploadRes.data?.blog?._id || 'N/A'}`);
          logMsg("Autopilot run completed successfully.");
          // Regenerate sitemap with the new post and ping Google + Bing
          logMsg("[Sitemap] Regenerating sitemap and pinging search engines...");
          try {
            await updateSitemap(currentSlug);
            logMsg("[Sitemap] Sitemap updated and search engines pinged.");
          } catch (sitemapErr) {
            logMsg(`[Sitemap] Warning: Sitemap update failed (non-critical): ${sitemapErr.message}`);
          }

          // Trigger Authority Node content synchronization to github.io
          logMsg("[Authority] Syncing authority node benchmark page...");
          try {
            await deployAuthorityNode();
            logMsg("[Authority] Authority node sync complete.");
          } catch (authErr) {
            logMsg(`[Authority] Warning: Authority node update failed (non-critical): ${authErr.message}`);
          }

          // Share to LinkedIn is now handled by the weekly poster cron schedule to match the new strategy.
          break;
        } else {
          logMsg(`Upload failed check. Status: ${uploadRes.status}, Data: ${JSON.stringify(uploadRes.data)}`);
          const customError = new Error(`Upload returned status ${uploadRes.status}. Data: ${JSON.stringify(uploadRes.data)}`);
          customError.response = { status: uploadRes.status, data: uploadRes.data };
          throw customError;
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        if (errMsg && errMsg.toLowerCase().includes('slug already exists') && attempts < maxAttempts - 1) {
          attempts++;
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          currentSlug = `${blogData.slug}-${randomSuffix}`;
          logMsg(`Slug conflict detected: "${errMsg}". Retrying with modified slug...`);
          continue;
        }

        const isTransient = error.response?.status === 503 ||
                            error.response?.status === 502 ||
                            error.response?.status === 504 ||
                            error.response?.status === 500 ||
                            error.response?.status === 429 ||
                            (error.response?.status === 200 && (!error.response.data || JSON.stringify(error.response.data) === '""' || error.response.data.success === false)) ||
                            error.code === 'ECONNRESET' ||
                            error.code === 'ETIMEDOUT' ||
                            error.message.toLowerCase().includes('timeout');

        if (isTransient && attempts < maxAttempts - 1) {
          attempts++;
          const waitTime = attempts * 15000; // 15s, 30s backoff
          logMsg(`Transient upload error (${error.response?.status || error.code || 'timeout'}). Retrying upload in ${waitTime / 1000}s (Attempt ${attempts + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error;
      }
    }

  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    logMsg(`FAILED: ${errMsg}`);
    if (error.response?.data) {
      logMsg(`SERVER DETAILS: ${JSON.stringify(error.response.data)}`);
    } else {
      logMsg(`STACK: ${error.stack}`);
    }
    releaseLock();
    process.exit(1);
  } finally {
    // Clean up temporary image
    if (tempImgPath && fs.existsSync(tempImgPath)) {
      try {
        fs.unlinkSync(tempImgPath);
        logMsg("Cleaned up temporary visual banner caches.");
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
    // Release the concurrency lock file
    releaseLock();
  }
}

// Execute
runAutopilot();
