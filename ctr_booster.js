import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, 'ctr_booster.log');

// Initialize stealth plugin
puppeteer.use(StealthPlugin());

function logMsg(msg) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
  console.log(`[CTR Booster] ${msg}`);
}

// Fetch dynamic keywords from MongoDB backend & local GSC reports
async function getSearchQueries() {
  const queries = ['PANTHM AI Labs', 'PANTHM AI'];
  
  // 1. Fetch latest blog keywords to boost fresh content CTR
  try {
    const res = await axios.get('https://api.panthm.com/api/blogs/published?limit=6', { timeout: 8000 });
    if (res.data && res.data.blogs) {
      res.data.blogs.forEach(blog => {
        if (blog.metaKeywords) {
          const kwList = blog.metaKeywords.split(',').map(k => k.trim()).filter(Boolean);
          if (kwList.length > 0) {
            // Push top 2 keywords of each recent blog to target pool
            queries.push(kwList[0]);
            if (kwList[1]) queries.push(kwList[1]);
          }
        }
      });
      logMsg(`Fetched ${res.data.blogs.length} recent blogs for dynamic keyword targeting.`);
    }
  } catch (err) {
    logMsg(`Skipping blog API keywords: ${err.message}`);
  }

  // 2. Fetch Google Search Console keywords
  try {
    const gscPath = path.join(__dirname, 'gsc_report.json');
    if (fs.existsSync(gscPath)) {
      const gsc = JSON.parse(fs.readFileSync(gscPath, 'utf-8'));
      if (gsc.topQueries) {
        gsc.topQueries.forEach(q => {
          if (q.query) queries.push(q.query);
        });
      }
    }
  } catch (err) {
    logMsg(`Skipping GSC query pool: ${err.message}`);
  }

  const uniqueQueries = [...new Set(queries)].filter(Boolean);
  logMsg(`Dynamic keyword pool initialized with ${uniqueQueries.length} unique targets.`);
  return uniqueQueries;
}

// Emulate natural human typing speeds with backspaces/typos
async function humanType(page, selector, text) {
  const element = await page.$(selector);
  if (!element) return;
  await element.focus();
  
  for (let i = 0; i < text.length; i++) {
    // 5% chance of typo to bypass bot signatures
    if (Math.random() < 0.05 && i > 0 && i < text.length - 1) {
      const typoChar = String.fromCharCode(text.charCodeAt(i) + 1);
      await page.keyboard.sendCharacter(typoChar);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
      await page.keyboard.press('Backspace');
      await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 100));
    }
    await page.keyboard.sendCharacter(text[i]);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  }
}

// Simulate reader highlighting text on the page
async function simulateHighlighting(page) {
  try {
    await page.evaluate(() => {
      const selectors = ['p', 'h1', 'h2', 'h3', 'span'];
      let targetElements = [];
      selectors.forEach(sel => {
        targetElements = [...targetElements, ...Array.from(document.querySelectorAll(sel))];
      });
      
      const readable = targetElements.filter(el => el.textContent && el.textContent.trim().length > 30);
      if (readable.length === 0) return;
      const randomEl = readable[Math.floor(Math.random() * readable.length)];
      
      const range = document.createRange();
      range.selectNodeContents(randomEl);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Clear highlight after a brief moment
      setTimeout(() => selection.removeAllRanges(), 2500);
    });
    logMsg('Simulated human text-highlight selection.');
  } catch (err) {
    // Ignore highlighting exceptions
  }
}

// Emulate human scroll speed & intervals
async function humanScroll(page) {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = Math.floor(Math.random() * 80) + 30;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 3000) {
            clearInterval(timer);
            resolve();
          }
        }, 150 + Math.random() * 150);
      });
    });
    logMsg('Completed human scroll simulation.');
  } catch (err) {
    logMsg(`Scroll warning: ${err.message}`);
  }
}

// Scan search engine pages for panthm.com
async function findAndClickTarget(page, maxPages = 5) {
  let resultLink = null;
  let pageNum = 1;

  while (pageNum <= maxPages) {
    logMsg(`Scanning search page ${pageNum} for panthm.com...`);
    resultLink = await page.evaluateHandle(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.find(a => a.href && (a.href.includes('panthm.com') || a.href.includes('panthm.com/')));
    });

    if (resultLink && resultLink.asElement()) {
      logMsg('🎯 Target result matched on search page.');
      break;
    }

    // Try Google pagination
    const nextGoogle = await page.$('a[id="pnnext"]');
    if (nextGoogle) {
      await nextGoogle.click();
    } else {
      // Try Bing pagination
      const nextBing = await page.$('a[title="Next page"]');
      if (!nextBing) break;
      await nextBing.click();
    }
    
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    pageNum++;
  }

  if (resultLink && resultLink.asElement()) {
    logMsg('Clicking search result to navigate to panthm.com...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(err => {
        logMsg(`Target page load timeout (soft limit), continuing: ${err.message}`);
      }),
      resultLink.asElement().click()
    ]);
    return true;
  }
  return false;
}

// Google Search Handler with Escalation
async function runGoogleSearch(page, query) {
  logMsg(`Navigating to Google to search query: "${query}"`);
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="L2AGLb"]');
  if (consentButton) {
    logMsg('Accepting Google cookie policy...');
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await humanType(page, 'textarea[name="q"]', query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

  // Spelling correction override
  const correctionLink = await page.evaluateHandle(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.find(a => 
      (a.textContent && a.textContent.includes('Search instead for')) || 
      (a.href && (a.href.includes('nfpr=1') || a.href.includes('spell=0')))
    );
  });

  if (correctionLink && correctionLink.asElement()) {
    logMsg('🎯 Clicked Google spelling correction override.');
    await correctionLink.asElement().click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  let clicked = await findAndClickTarget(page, 5);
  
  // Escalation: Force result if page 1-5 scan fails
  if (!clicked) {
    const escalatedQuery = `${query} panthm.com`;
    logMsg(`⚠️ Keyword not visible on page 1-5. Escalating search query to: "${escalatedQuery}"`);
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'textarea[name="q"]', escalatedQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    clicked = await findAndClickTarget(page, 2);
  }

  return clicked;
}

// Bing Search Handler with Escalation
async function runBingSearch(page, query) {
  logMsg(`Navigating to Bing to search query: "${query}"`);
  await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="bnp_btn_accept"]');
  if (consentButton) {
    logMsg('Accepting Bing cookie policy...');
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await humanType(page, 'input[name="q"]', query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

  const correctionLink = await page.evaluateHandle(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.find(a => a.textContent && a.textContent.toLowerCase().includes('search instead for'));
  });

  if (correctionLink && correctionLink.asElement()) {
    logMsg('🎯 Clicked Bing spelling correction override.');
    await correctionLink.asElement().click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  let clicked = await findAndClickTarget(page, 5);

  if (!clicked) {
    const escalatedQuery = `${query} panthm.com`;
    logMsg(`⚠️ Keyword not visible on Bing page 1-5. Escalating search query to: "${escalatedQuery}"`);
    await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'input[name="q"]', escalatedQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    clicked = await findAndClickTarget(page, 2);
  }

  return clicked;
}

async function runCTRBooster() {
  logMsg('Initializing Elite CTR & Page-Ranking Engine...');
  const queryPool = await getSearchQueries();
  const selectedQuery = queryPool[Math.floor(Math.random() * queryPool.length)];
  logMsg(`🎯 Target Query Selected for this run: "${selectedQuery}"`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage', 
        '--disable-gpu',
        '--window-size=1280,800'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // User-Agent rotation
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
    ];
    const selectedUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(selectedUA);

    let clickedLink = false;

    // 1. Try Google Search
    try {
      clickedLink = await runGoogleSearch(page, selectedQuery);
    } catch (err) {
      logMsg(`Google search process exception: ${err.message}`);
      
      // 2. Fallback to Bing Search
      try {
        clickedLink = await runBingSearch(page, selectedQuery);
      } catch (bingErr) {
        logMsg(`Bing search process exception: ${bingErr.message}`);
      }
    }

    // 3. Ultimate Fallback: Referrer Spoofed Direct Navigation
    if (!clickedLink) {
      logMsg('🔄 Search results unavailable. Executing Google-Referrer Spoofed Landing...');
      try {
        await page.setExtraHTTPHeaders({
          'Referer': 'https://www.google.com/'
        });
        await page.goto('https://panthm.com', { waitUntil: 'load', timeout: 15000 });
      } catch (e) {
        logMsg(`Direct navigation timeout: ${e.message}`);
        await page.goto('https://panthm.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
      }
    }

    // 4. Session Dwell & Engagement Loop (Landing Page)
    logMsg('Entering Landing Page Dwell Loop. Scrolling...');
    await humanScroll(page);
    await simulateHighlighting(page);
    await new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 5000));

    // 5. Multi-Page Deep Traversal (Select 1-2 random internal pages to eliminate bounce)
    try {
      logMsg('Traversing deep internal links...');
      const internalLinks = await page.$$eval('a', anchors => 
        anchors
          .map(a => a.href)
          .filter(href => href.startsWith('https://panthm.com/') && !href.includes('#') && href !== 'https://panthm.com/')
      );

      if (internalLinks.length > 0) {
        // Shuffle and pick up to 2 links
        const shuffled = internalLinks.sort(() => 0.5 - Math.random());
        const linksToVisit = shuffled.slice(0, Math.min(2, shuffled.length));

        for (const link of linksToVisit) {
          logMsg(`Navigating internally deep: ${link}`);
          try {
            await page.goto(link, { waitUntil: 'load', timeout: 15000 });
          } catch (e) {
            logMsg(`Page traversal timeout: ${e.message}`);
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 10000 });
          }
          
          await humanScroll(page);
          await simulateHighlighting(page);
          await new Promise(resolve => setTimeout(resolve, 8000 + Math.random() * 4000));
        }
      }
    } catch (navErr) {
      logMsg(`Deep page traversal warning: ${navErr.message}`);
    }

    logMsg(`SUCCESS! Session engagement finalized. Ending URL: ${page.url()}`);

  } catch (err) {
    logMsg(`❌ Critical System Crash: ${err.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    logMsg('Session ended and browser closed.');
  }
}

runCTRBooster().catch(() => process.exit(1));
