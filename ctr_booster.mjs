import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, 'ctr_booster.log');

puppeteer.use(StealthPlugin());

function logMsg(msg) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
  console.log(`[CTR Booster] ${msg}`);
}

async function getSearchQueries() {
  const queries = [];
  const defaultNicheQueries = [
    'PANTHM AI Labs',
    'PANTHM AI',
    'outbound sales voice automation',
    'AI calling agency India',
    'custom text-to-speech pipelines',
    'programmatic SEO agency Pune',
    'WhatsApp Business API automation',
    'low latency voice agents'
  ];

  // 1. Try reading Google Search Console queries (Threshold queries ranking 3 to 20)
  const gscReportPath = path.join(__dirname, 'automation', 'gsc_report.json');
  try {
    if (fs.existsSync(gscReportPath)) {
      const gscData = JSON.parse(fs.readFileSync(gscReportPath, 'utf-8'));
      const topQueries = gscData.topQueries || [];
      
      // Filter for queries ranking in threshold position (3 to 20)
      const thresholdQueries = topQueries.filter(q => q.position >= 3 && q.position <= 20);
      if (thresholdQueries.length > 0) {
        thresholdQueries.forEach(q => queries.push(q.query));
        logMsg(`Loaded ${thresholdQueries.length} threshold queries (pos 3-20) from GSC report.`);
      }
      
      // Fallback to general top queries if none matched position threshold
      if (queries.length === 0 && topQueries.length > 0) {
        topQueries.slice(0, 5).forEach(q => queries.push(q.query));
        logMsg(`Loaded ${queries.length} top queries from GSC report.`);
      }
    }
  } catch (err) {
    logMsg(`GSC report audit skipped: ${err.message}`);
  }

  // 2. Fetch live published blogs keywords fallback
  try {
    const res = await axios.get('https://api.panthm.com/api/blogs/published?limit=6', { timeout: 8000 });
    if (res.data && res.data.blogs) {
      res.data.blogs.forEach(blog => {
        if (blog.metaKeywords) {
          const kwList = blog.metaKeywords.split(',').map(k => k.trim()).filter(Boolean);
          if (kwList.length > 0) {
            queries.push(kwList[0]);
            if (kwList[1]) queries.push(kwList[1]);
          }
        }
      });
    }
  } catch (err) {
    logMsg(`Skipping API keywords fallback: ${err.message}`);
  }

  // 3. Merge with default high-value target keywords to ensure query list is never empty
  defaultNicheQueries.forEach(q => queries.push(q));

  // Deduplicate and filter out empty strings
  const finalQueries = [...new Set(queries)].filter(Boolean);
  logMsg(`Total query pool: [${finalQueries.join(', ')}]`);
  return finalQueries;
}

async function humanType(page, selector, text) {
  const element = await page.$(selector);
  if (!element) return;
  await element.focus();
  for (let i = 0; i < text.length; i++) {
    if (Math.random() < 0.04 && i > 0 && i < text.length - 1) {
      const typoChar = String.fromCharCode(text.charCodeAt(i) + 1);
      await page.keyboard.sendCharacter(typoChar);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 80));
      await page.keyboard.press('Backspace');
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 80));
    }
    await page.keyboard.sendCharacter(text[i]);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 40));
  }
}

async function humanScroll(page) {
  try {
    // Advanced scroll loop representing human reading/skimming habits
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const maxScroll = Math.min(document.body.scrollHeight - window.innerHeight, 3000);
        
        const scrollStep = async () => {
          if (totalHeight >= maxScroll) {
            resolve();
            return;
          }
          
          // Randomize scroll distance (skimming vs reading)
          const distance = Math.random() < 0.2 
            ? Math.floor(Math.random() * 400) + 200 // fast skim
            : Math.floor(Math.random() * 80) + 40;   // slow read
            
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          // 15% chance to scroll back up slightly (re-reading)
          if (Math.random() < 0.15 && totalHeight > 300) {
            const backDistance = Math.floor(Math.random() * 60) + 20;
            window.scrollBy(0, -backDistance);
            totalHeight -= backDistance;
          }
          
          // Variable delay simulating reading speed
          const delay = Math.random() < 0.3 
            ? Math.random() * 1500 + 800 // deep reading pause
            : Math.random() * 250 + 100; // standard scroll delay
            
          setTimeout(scrollStep, delay);
        };
        
        scrollStep();
      });
    });
  } catch (err) {}
}

async function findAndClickTarget(page, domain, maxPages = 5) {
  let resultLink = null;
  let pageNum = 1;

  while (pageNum <= maxPages) {
    resultLink = await page.evaluateHandle((dom) => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.find(a => a.href && (a.href.includes(dom) || a.href.includes(`${dom}/`)));
    }, dom);

    if (resultLink && resultLink.asElement()) {
      break;
    }

    const nextGoogle = await page.$('a[id="pnnext"]');
    if (nextGoogle) {
      await nextGoogle.click();
    } else {
      const nextBing = await page.$('a[title="Next page"]');
      if (!nextBing) break;
      await nextBing.click();
    }
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    pageNum++;
  }

  if (resultLink && resultLink.asElement()) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {}),
      resultLink.asElement().click()
    ]);
    return true;
  }
  return false;
}

function getBroadQueryFor(query) {
  const q = query.toLowerCase();
  if (q.includes('voice') || q.includes('calling') || q.includes('agent')) {
    return 'outbound sales voice automation';
  }
  if (q.includes('speech') || q.includes('tts') || q.includes('text')) {
    return 'custom text to speech pipeline';
  }
  if (q.includes('whatsapp') || q.includes('api')) {
    return 'whatsapp business automation tools';
  }
  if (q.includes('seo') || q.includes('programmatic') || q.includes('sitemap')) {
    return 'programmatic SEO ranking strategy';
  }
  return 'b2b sales engagement platforms';
}

// Google Search Handler with Captcha Detection and Journey Log simulation
async function runGoogleSearch(page, query) {
  logMsg('Navigating to Google...');
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="L2AGLb"]');
  if (consentButton) {
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Journey Log Simulation (50% probability)
  const isJourney = Math.random() < 0.5;
  if (isJourney) {
    const broadQuery = getBroadQueryFor(query);
    logMsg(`[Google Journey] Initiating broad query: "${broadQuery}"`);
    await humanType(page, 'textarea[name="q"]', broadQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    if (page.url().includes('google.com/sorry/')) {
      throw new Error('Google Captcha (sorry/index) triggered.');
    }
    await humanScroll(page);
    await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 4000));

    logMsg(`[Google Journey] Refining search to target query: "${query}"`);
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  await humanType(page, 'textarea[name="q"]', query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

  if (page.url().includes('google.com/sorry/')) {
    throw new Error('Google Captcha (sorry/index) triggered.');
  }

  let clicked = await findAndClickTarget(page, 'panthm.com', 5);
  if (!clicked) {
    const escalatedQuery = `${query} panthm.com`;
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'textarea[name="q"]', escalatedQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    if (page.url().includes('google.com/sorry/')) {
      throw new Error('Google Captcha triggered on escalation.');
    }
    clicked = await findAndClickTarget(page, 'panthm.com', 2);
  }
  return clicked;
}

// Bing Search Handler with Captcha Detection and Journey Log simulation
async function runBingSearch(page, query) {
  logMsg('Navigating to Bing...');
  await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="bnp_btn_accept"]');
  if (consentButton) {
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Journey Log Simulation (50% probability)
  const isJourney = Math.random() < 0.5;
  if (isJourney) {
    const broadQuery = getBroadQueryFor(query);
    logMsg(`[Bing Journey] Initiating broad query: "${broadQuery}"`);
    await humanType(page, 'input[name="q"]', broadQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    await humanScroll(page);
    await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 4000));

    logMsg(`[Bing Journey] Refining search to target query: "${query}"`);
    await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  await humanType(page, 'input[name="q"]', query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

  let clicked = await findAndClickTarget(page, 'panthm.com', 5);
  if (!clicked) {
    const escalatedQuery = `${query} panthm.com`;
    await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'input[name="q"]', escalatedQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    clicked = await findAndClickTarget(page, 'panthm.com', 2);
  }
  return clicked;
}

// DuckDuckGo Failsafe (No Captcha walls)
async function runDuckDuckGoSearch(page, query) {
  logMsg('Navigating to DuckDuckGo...');
  await page.goto('https://html.duckduckgo.com/html/', { waitUntil: 'domcontentloaded', timeout: 20000 });

  // Journey Log Simulation (50% probability)
  const isJourney = Math.random() < 0.5;
  if (isJourney) {
    const broadQuery = getBroadQueryFor(query);
    logMsg(`[DuckDuckGo Journey] Initiating broad query: "${broadQuery}"`);
    await humanType(page, 'input[name="q"]', broadQuery);
    const searchButton = await page.$('input[type="submit"]');
    if (searchButton) {
      await searchButton.click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    }
    await humanScroll(page);
    await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 4000));

    logMsg(`[DuckDuckGo Journey] Refining search to target query: "${query}"`);
    await page.goto('https://html.duckduckgo.com/html/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  await humanType(page, 'input[name="q"]', query);
  const searchButton = await page.$('input[type="submit"]');
  if (searchButton) {
    await searchButton.click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  let clicked = await findAndClickTarget(page, 'panthm.com', 4);
  if (!clicked) {
    const escalatedQuery = `${query} site:panthm.com`;
    await page.goto('https://html.duckduckgo.com/html/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'input[name="q"]', escalatedQuery);
    const escButton = await page.$('input[type="submit"]');
    if (escButton) await escButton.click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    clicked = await findAndClickTarget(page, 'panthm.com', 2);
  }
  return clicked;
}

async function launchBrowser() {
  const args = [
    '--no-sandbox', 
    '--disable-setuid-sandbox', 
    '--disable-dev-shm-usage', 
    '--disable-gpu',
    '--window-size=1280,800'
  ];
  
  const browser = await puppeteer.launch({
    headless: true,
    args
  });
  return browser;
}

async function executeSession(browser, selectedQuery) {
  const page = await browser.newPage();
  
  // 1. Device-sliced footprint split (60% Mobile / 40% Desktop)
  const isMobile = Math.random() < 0.6;
  let userAgent, viewportWidth, viewportHeight;

  if (isMobile) {
    // Mobile Viewports and User Agents
    const mobileViewports = [
      { width: 390, height: 844 }, // iPhone 12/13/14 Pro
      { width: 412, height: 915 }, // Galaxy S20
      { width: 375, height: 667 }  // iPhone SE
    ];
    const mobileUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ];

    const vp = mobileViewports[Math.floor(Math.random() * mobileViewports.length)];
    viewportWidth = vp.width;
    viewportHeight = vp.height;
    userAgent = mobileUserAgents[Math.floor(Math.random() * mobileUserAgents.length)];

    await page.setViewport({ width: viewportWidth, height: viewportHeight, hasTouch: true, isMobile: true });
    logMsg(`[Device Slice] Simulating Mobile footprint (Viewport: ${viewportWidth}x${viewportHeight}).`);
  } else {
    // Desktop Viewports and User Agents
    const desktopViewports = [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1280, height: 800 }
    ];
    const desktopUserAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];

    const vp = desktopViewports[Math.floor(Math.random() * desktopViewports.length)];
    viewportWidth = vp.width;
    viewportHeight = vp.height;
    userAgent = desktopUserAgents[Math.floor(Math.random() * desktopUserAgents.length)];

    await page.setViewport({ width: viewportWidth, height: viewportHeight, hasTouch: false, isMobile: false });
    logMsg(`[Device Slice] Simulating Desktop footprint (Viewport: ${viewportWidth}x${viewportHeight}).`);
  }

  await page.setUserAgent(userAgent);

  // HTTP Headers accept-language rotation
  const languages = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU'];
  await page.setExtraHTTPHeaders({
    'Accept-Language': `${languages[Math.floor(Math.random() * languages.length)]},en;q=0.9`
  });

  let clickedLink = false;

  // 1. Google Search Pathway
  try {
    clickedLink = await runGoogleSearch(page, selectedQuery);
  } catch (err) {
    logMsg(`Google pathway bypassed: ${err.message}`);
  }

  // 2. Bing Search Pathway (Failsafe for Google Captchas)
  if (!clickedLink) {
    try {
      clickedLink = await runBingSearch(page, selectedQuery);
    } catch (bingErr) {
      logMsg(`Bing pathway bypassed: ${bingErr.message}`);
    }
  }

  // 3. DuckDuckGo Search Pathway
  if (!clickedLink) {
    try {
      clickedLink = await runDuckDuckGoSearch(page, selectedQuery);
    } catch (ddgErr) {
      logMsg(`DuckDuckGo pathway bypassed: ${ddgErr.message}`);
    }
  }

  // 4. Referrer Spoofed Direct Landing (Ultimate failsafe to keep traffic incoming)
  if (!clickedLink) {
    logMsg('🔄 Search pathways blocked. Executing referer-spoofed organic traffic landing...');
    try {
      await page.setExtraHTTPHeaders({ 'Referer': 'https://www.google.com/' });
      await page.goto('https://panthm.com', { waitUntil: 'load', timeout: 15000 });
      clickedLink = true;
    } catch (e) {
      await page.goto('https://panthm.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
      clickedLink = true;
    }
  }

  // Dwell Time & Scroll (Navboost Long Click Emulation)
  const dwellDuration = Math.floor(Math.random() * 25000) + 35000; // 35s to 60s
  logMsg(`Entering Dwell time loop for ${dwellDuration / 1000}s...`);
  
  const scrollPromise = humanScroll(page);
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, dwellDuration));
  await Promise.race([scrollPromise, timeoutPromise]);
  await timeoutPromise; // Ensure full dwell time is satisfied

  // Traversing inner links (eliminate bounce rate)
  try {
    const internalLinks = await page.$$eval('a', anchors => 
      anchors
        .map(a => a.href)
        .filter(href => href.startsWith('https://panthm.com/') && !href.includes('#') && href !== 'https://panthm.com/')
    );

    if (internalLinks.length > 0) {
      const randomLink = internalLinks[Math.floor(Math.random() * internalLinks.length)];
      logMsg(`Navigating internally to: ${randomLink}`);
      try {
        await page.goto(randomLink, { waitUntil: 'load', timeout: 15000 });
      } catch (e) {
        await page.goto(randomLink, { waitUntil: 'domcontentloaded', timeout: 10000 });
      }
      
      const innerDwell = Math.floor(Math.random() * 10000) + 10000; // 10s to 20s
      logMsg(`Entering inner page Dwell loop for ${innerDwell / 1000}s...`);
      const innerScroll = humanScroll(page);
      const innerTimeout = new Promise(resolve => setTimeout(resolve, innerDwell));
      await Promise.race([innerScroll, innerTimeout]);
      await innerTimeout;
    }
  } catch (e) {}

  logMsg(`SUCCESS! Dwell time satisfied on ending URL: ${page.url()}`);
}

async function runCTRBooster() {
  logMsg('Initializing Cloud VM-Direct CTR Engine (Rotated Azure IP Pool)...');
  const queryPool = await getSearchQueries();
  const selectedQuery = queryPool[Math.floor(Math.random() * queryPool.length)];
  logMsg(`🎯 Target Query: "${selectedQuery}"`);

  let browser = null;
  try {
    browser = await launchBrowser();
    logMsg('Starting search simulation session...');
    await executeSession(browser, selectedQuery);
  } catch (err) {
    logMsg(`❌ Critical Exception: ${err.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {}
    }
    logMsg('Browser closed.');
  }
}

runCTRBooster().catch((err) => {
  logMsg(`❌ Critical Exception: ${err.message}`);
  process.exit(1);
});
