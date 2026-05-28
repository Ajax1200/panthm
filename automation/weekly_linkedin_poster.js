import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MAKE_WEBHOOK_URL = process.env.LINKEDIN_MAKE_WEBHOOK_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const VERCEL_API_BASE = 'https://blogplatform-backend-cloudinary-tau.vercel.app/api';
const VERCEL_ADMIN_EMAIL = 'admin@panthm.com';
const VERCEL_ADMIN_PASS = 'admin@123';

const STATE_FILE = path.join(__dirname, 'last_linkedin_post.json');

// Log message helper
function logMsg(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[LinkedIn Scheduler] [${timestamp}] ${msg}`);
}

// Authenticate and get JWT token from Vercel Backend
async function getAuthToken() {
  try {
    const response = await axios.post(`${VERCEL_API_BASE}/auth/login`, {
      email: VERCEL_ADMIN_EMAIL,
      password: VERCEL_ADMIN_PASS
    });
    if (response.data && response.data.success && response.data.token) {
      return response.data.token;
    }
    throw new Error("Invalid response format");
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    throw new Error(`Authentication failed: ${errorMsg}`);
  }
}

// Fetch latest blogs
async function fetchLatestBlogs() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${VERCEL_API_BASE}/blogs?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data?.blogs || [];
  } catch (error) {
    logMsg(`Warning: Failed to fetch latest blogs: ${error.message}`);
    return [];
  }
}

// Helper to get the start of the week (most recent Monday at 00:00:00 local time)
function getStartOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Load scheduling state
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      logMsg(`Error reading state file, starting fresh: ${e.message}`);
    }
  }
  return {
    currentWeekStart: null,
    caseStudyPostedAt: null,
    recapPostedAt: null,
    recapDelayDays: 3,
    caseStudyTargetDay: 0 // 0 = Monday, 1 = Tuesday
  };
}

// Save scheduling state
function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    logMsg(`Error saving state file: ${e.message}`);
  }
}

// Generate Case Study via Gemini
async function generateCaseStudy() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const themes = [
    "Neural voice agent outbound calling pipelines with sub-500ms latency replacing human lead qualification teams.",
    "Custom low-level Node.js scrapers bypassing advanced Cloudflare turnstile protection to harvest high-intent outbound leads.",
    "Automated B2B cold-email infrastructure sending 50k hyper-personalized messages monthly with custom domains, automated SPF/DKIM rotation, and CRM synchronization.",
    "Next.js pre-rendering and static page generation overhaul for an enterprise client, boosting Largest Contentful Paint (LCP) and organic crawl budget by 400%.",
    "High-throughput WhatsApp Business API broadcast architectures with dynamic customer segmentation, personalized video generation, and real-time interaction logs synced to MongoDB.",
    "Mongoose and MongoDB Atlas synchronization layer with custom change-stream listeners to drive real-time executive dashboard analytics."
  ];

  const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
  logMsg(`Generating Case Study for theme: "${selectedTheme}"`);

  const prompt = `You are a system that generates a LinkedIn case study post for PANTHM AI Labs.

First, silently generate a raw, messy voice transcript from the founder (AJ) describing a case study about: "${selectedTheme}".
It should sound like a real voice-to-text transcript: full of filler words, repetitions, and fragmented thoughts, but contains real technical details.

Second, act as an elite B2B technical copywriter and growth architect for PANTHM AI Labs, a high-end business automation and custom software development firm. Your audience consists of ruthless, high-net-worth international CEOs, founders, and CTOs (primarily in Europe, Australia, and the UAE) who have zero tolerance for marketing fluff.
Transform the voice transcript you generated in step one into a highly authoritative LinkedIn case study post.

Silently and randomly select ONLY ONE of the following 6 formatting styles. Do not announce which style you chose. Just output the final post according to its exact rules.

STYLE 1: The Autopsy
- Hook: Start with a harsh truth or a major technical/operational mistake founders make.
- Body: Diagnose *why* that mistake bleeds cash. Introduce how PANTHM overhauled the architecture to stop the bleeding. 

STYLE 2: Architecture Breakdown
- Hook: Start with a bold statement about the operational bottleneck.
- Body: Break down the solution into a numbered 3-step technical teardown. Focus heavily on custom software, automation, or outbound systems.

STYLE 3: Before & After
- Hook: Contrast the industry standard vs. the PANTHM standard.
- Body: Paragraph 1 (The Chaos) - Describe the fragmented, multi-agency mess. Paragraph 2 (The Unified Ecosystem) - Describe the end-to-end PANTHM deployment. 

STYLE 4: The Airport Brain Dump
- Structure: Abandon all standard formatting. No bullet points. No bold text. 
- Style: Write 4 to 5 short, slightly fragmented sentences that read like a raw, urgent text message sent from a founder between flights. 

STYLE 5: The Contrarian One-Liner
- Structure: Condense the entire transcript into a maximum of two sentences. 
- Style: Sentence one states the massive industry problem. Sentence two states the exact technical infrastructure PANTHM deployed to solve it. Output absolutely nothing else.

STYLE 6: The Asymmetrical Story
- Structure: Introduce intentional formatting asymmetry. 
- Style: Start with one long paragraph detailing the operational chaos. Follow it with a single, standalone punchy sentence. End with exactly two (not three) bulleted metrics or outcomes. 

CRITICAL OVERRIDES & ANTI-AI GUARDRAILS (APPLIES TO ALL STYLES):
- NO AI BUZZWORDS: Banned words include "delve," "tapestry," "unlock," "unleash," "navigate," "revolutionary," "supercharge," "seamless," or "synergy."
- EMOJIS: Maximum of 1 minimal emoji in the entire post (e.g., ⚙️, 📊, or 🏢). Zero emojis is preferred.
- NO DESPERATE CTA: End the post with a single, authoritative statement. Never end with a question like "What do you think?" or "Agree?". 
- OUTPUT RULE: Output ONLY the final LinkedIn copywriting post. Do NOT output the raw voice transcript, do NOT output introductions, pleasantries, hashtags, or explanations of which style you chose. Under no circumstances should the raw voice transcript or the '---' divider be visible in your output.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text;
}

// Generate Blog Recap via Gemini
async function generateBlogRecap(blogs) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const blogsSummary = blogs.map((b, idx) => `${idx + 1}. Title: "${b.title}"\n   Excerpt: "${b.excerpt}"\n   Url: https://panthm.com/blogs/${b.slug}`).join('\n\n');

  logMsg(`Generating Blog Recap for ${blogs.length} recent blogs`);

  const prompt = `You are an elite B2B technical copywriter and growth architect for PANTHM AI Labs.
Write a short, engaging, highly authoritative LinkedIn post summarizing our latest technical and marketing insights.

Here are the recent articles published:
${blogsSummary}

Your task:
Summarize the key B2B and technical themes from these articles. Point out 2-3 critical lessons or strategic takeaways for founders, CEOs, and CTOs.
Direct readers to read the full details at the PANTHM blogs page (https://panthm.com/blogs).

CRITICAL RULES:
- Style: Elite, high-end tone. No fluff. Focus on operational leverage, scale, or architecture.
- NO AI BUZZWORDS: Banned words include "delve," "tapestry," "unlock," "unleash," "navigate," "revolutionary," "supercharge," "seamless," or "synergy."
- EMOJIS: Maximum of 1 minimal emoji (e.g. 📊 or ⚙️). Zero emojis is preferred.
- NO DESPERATE CTA: Never end with questions. End with a single, clear, authoritative statement directing them to the blogs page.
- OUTPUT RULE: Output ONLY the final LinkedIn post content. No hashtags, no intros, no pleasantries.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text;
}

// Dispatch to Make.com Webhook
async function postToMakeWebhook(content, type = 'case_study') {
  if (!MAKE_WEBHOOK_URL) {
    logMsg("Warning: LINKEDIN_MAKE_WEBHOOK_URL is not configured in .env. Logging post content below:");
    console.log("------------------------------------------");
    console.log(content);
    console.log("------------------------------------------");
    return true;
  }

  const title = type === 'case_study' 
    ? "PANTHM AI Labs: B2B Case Study Teardown" 
    : "PANTHM AI Labs: Weekly Technical Blog Recap";

  const hashtags = "#B2B #Automation #CustomSoftware #AI #PanthmAILabs";

  try {
    logMsg(`Sending payload to Make.com webhook (${type}): ${MAKE_WEBHOOK_URL}`);
    await axios.post(MAKE_WEBHOOK_URL, {
      title: title,
      excerpt: content,
      slug: type === 'case_study' ? "case-study" : "blogs",
      link: type === 'case_study' ? "https://panthm.com/blogs/case-study" : "https://panthm.com/blogs",
      hashtags: hashtags
    });
    logMsg("✅ Successfully posted to Make.com Webhook.");
    return true;
  } catch (error) {
    logMsg(`❌ Failed to send payload to Webhook: ${error.message}`);
    return false;
  }
}

// Main execution block
async function run() {
  const args = process.argv.slice(2);
  const forceCaseStudy = args.includes('--force-case-study');
  const forceRecap = args.includes('--force-recap');

  if (forceCaseStudy) {
    logMsg(`Proceeding with forced Case Study generation`);
    const content = await generateCaseStudy();
    await postToMakeWebhook(content, 'case_study');
    process.exit(0);
  }

  if (forceRecap) {
    logMsg(`Proceeding with forced Blog Recap generation`);
    const blogs = await fetchLatestBlogs();
    if (blogs.length === 0) {
      logMsg("No blogs found for recap.");
    } else {
      const content = await generateBlogRecap(blogs);
      await postToMakeWebhook(content, 'blog_recap');
    }
    process.exit(0);
  }

  const state = loadState();
  const now = new Date();
  const weekStart = getStartOfWeek(now).toISOString();

  // Reset state if it's a new week
  if (state.currentWeekStart !== weekStart) {
    logMsg(`New week detected starting ${weekStart}. Resetting week state.`);
    state.currentWeekStart = weekStart;
    state.caseStudyPostedAt = null;
    state.recapPostedAt = null;
    state.recapDelayDays = Math.random() < 0.5 ? 2 : 3;
    state.caseStudyTargetDay = Math.random() < 0.5 ? 0 : 1; // 0 = Monday, 1 = Tuesday
    saveState(state);
  }

  // Calculate day difference from Monday (0 = Monday, 1 = Tuesday, etc.)
  const diffTime = now - new Date(state.currentWeekStart);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  logMsg(`Current week status: Case Study Posted: ${state.caseStudyPostedAt ? 'Yes' : 'No'}, Recap Posted: ${state.recapPostedAt ? 'Yes' : 'No'}. Days elapsed in week: ${diffDays}`);

  // 1. Post Case Study
  if (!state.caseStudyPostedAt) {
    if (diffDays >= state.caseStudyTargetDay) {
      logMsg(`It is time to post this week's Case Study (Target day code: ${state.caseStudyTargetDay}).`);
      const content = await generateCaseStudy();
      const success = await postToMakeWebhook(content, 'case_study');
      if (success) {
        state.caseStudyPostedAt = now.toISOString();
        saveState(state);
      }
    } else {
      logMsg(`Waiting to post Case Study. Target day code: ${state.caseStudyTargetDay}, current elapsed: ${diffDays}`);
    }
    return;
  }

  // 2. Post Blog Recap
  if (state.caseStudyPostedAt && !state.recapPostedAt) {
    const lastPostDate = new Date(state.caseStudyPostedAt);
    const delayTime = now - lastPostDate;
    const delayDays = delayTime / (1000 * 60 * 60 * 24);

    if (delayDays >= state.recapDelayDays) {
      logMsg(`It is time to post this week's Blog Recap (Delay elapsed: ${delayDays.toFixed(2)} days, required: ${state.recapDelayDays}).`);
      const blogs = await fetchLatestBlogs();
      let content = '';
      if (blogs.length === 0) {
        logMsg("No blogs found. Generating a fallback Case Study instead.");
        content = await generateCaseStudy();
      } else {
        content = await generateBlogRecap(blogs);
      }
      const success = await postToMakeWebhook(content, 'blog_recap');
      if (success) {
        state.recapPostedAt = now.toISOString();
        saveState(state);
      }
    } else {
      logMsg(`Waiting to post Blog Recap. Elapsed delay: ${delayDays.toFixed(2)} days, required: ${state.recapDelayDays}`);
    }
    return;
  }

  logMsg("Both posts for this week have been completed. Waiting for next week.");
}

run().catch(err => {
  console.error("Critical failure running weekly linkedin poster:", err);
  process.exit(1);
});
