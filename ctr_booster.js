import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
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

// Emulate human typing speed variations
async function humanType(page, selector, text) {
  const element = await page.$(selector);
  if (!element) return;
  await element.focus();
  for (const char of text) {
    await page.keyboard.sendCharacter(char);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 40));
  }
}

// Emulate human reading and scrolling behavior
async function humanScroll(page) {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = Math.floor(Math.random() * 70) + 30;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 2500) {
            clearInterval(timer);
            resolve();
          }
        }, 120 + Math.random() * 120);
      });
    });
    logMsg('Completed human scroll simulation.');
  } catch (err) {
    logMsg(`Scroll simulation warning: ${err.message}`);
  }
}

// Locates panthm.com in organic results
async function findAndClickTarget(page, maxPages = 5) {
  let resultLink = null;
  let pageNum = 1;

  while (pageNum <= maxPages) {
    logMsg(`Scanning page ${pageNum} for panthm.com link...`);
    resultLink = await page.evaluateHandle(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.find(a => a.href && (a.href.includes('panthm.com') || a.href.includes('panthm.com/')));
    });

    if (resultLink && resultLink.asElement()) {
      logMsg('🎯 Organic target result found!');
      break;
    }

    // Try finding Google's next page button
    const nextButton = await page.$('a[id="pnnext"]');
    if (!nextButton) {
      // Try Bing next page button
      const bingNextButton = await page.$('a[title="Next page"]');
      if (!bingNextButton) break;
      await bingNextButton.click();
    } else {
      await nextButton.click();
    }
    
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    pageNum++;
  }

  if (resultLink && resultLink.asElement()) {
    logMsg('Clicking target link...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(err => {
        logMsg(`Target navigation load timeout (soft limit), continuing: ${err.message}`);
      }),
      resultLink.asElement().click()
    ]);
    return true;
  }
  return false;
}

// Perform Google Search with Failsafe Escalation
async function runGoogleSearch(page) {
  logMsg('Navigating to Google...');
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  // Handle Cookie consent
  const consentButton = await page.$('button[id="L2AGLb"]');
  if (consentButton) {
    logMsg('Accepting Google consent policy...');
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const query = 'PANTHM AI Labs';
  logMsg(`Searching Google for: "${query}"`);
  await humanType(page, 'textarea[name="q"]', query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

  // Handle spellcheck corrections (e.g. did you mean: phantom)
  const correctionLink = await page.evaluateHandle(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.find(a => 
      (a.textContent && a.textContent.includes('Search instead for')) || 
      (a.href && (a.href.includes('nfpr=1') || a.href.includes('spell=0')))
    );
  });

  if (correctionLink && correctionLink.asElement()) {
    logMsg('🎯 Spelling override detected. Clicking override...');
    await correctionLink.asElement().click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  // Phase 1: Pure Organic Click search
  let clicked = await findAndClickTarget(page, 5);
  
  // Phase 2: Escalation (Brand + Domain match to force position #1)
  if (!clicked) {
    const escalatedQuery = 'PANTHM AI Labs panthm.com';
    logMsg(`⚠️ Pure search failed to locate link in top pages. Escalating query to: "${escalatedQuery}"`);
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'textarea[name="q"]', escalatedQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    clicked = await findAndClickTarget(page, 2);
  }

  if (clicked) return true;
  throw new Error('Target result not found on Google results even after escalation.');
}

// Perform Bing Search with Failsafe Escalation
async function runBingSearch(page) {
  logMsg('Navigating to Bing...');
  await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="bnp_btn_accept"]');
  if (consentButton) {
    logMsg('Accepting Bing consent policy...');
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const query = 'PANTHM AI Labs';
  logMsg(`Searching Bing for: "${query}"`);
  await humanType(page, 'input[name="q"]', query);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

  const correctionLink = await page.evaluateHandle(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.find(a => a.textContent && a.textContent.toLowerCase().includes('search instead for'));
  });

  if (correctionLink && correctionLink.asElement()) {
    logMsg('🎯 Bing spelling override detected. Clicking...');
    await correctionLink.asElement().click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
  }

  let clicked = await findAndClickTarget(page, 5);

  if (!clicked) {
    const escalatedQuery = 'PANTHM AI Labs panthm.com';
    logMsg(`⚠️ Bing pure search failed. Escalating query to: "${escalatedQuery}"`);
    await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanType(page, 'input[name="q"]', escalatedQuery);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    clicked = await findAndClickTarget(page, 2);
  }

  if (clicked) return true;
  throw new Error('Target result not found on Bing results even after escalation.');
}

async function runCTRBooster() {
  logMsg('Starting Failsafe Adaptive search session...');
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
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let clickedLink = false;

    // 1. Try Google Search first
    try {
      clickedLink = await runGoogleSearch(page);
    } catch (googleErr) {
      logMsg(`Google Search failed: ${googleErr.message}`);
      
      // 2. Fallback to Bing Search if Google fails
      try {
        clickedLink = await runBingSearch(page);
      } catch (bingErr) {
        logMsg(`Bing Search fallback failed: ${bingErr.message}`);
      }
    }

    // 3. Direct Navigation fallback (if both search engines fail, navigate directly to keep impressions high)
    if (!clickedLink) {
      logMsg('🔄 Ultimate Fallback: Simulating direct navigation to https://panthm.com...');
      try {
        await page.goto('https://panthm.com', { waitUntil: 'load', timeout: 15000 });
      } catch (e) {
        logMsg(`Direct navigation timeout: ${e.message}`);
        await page.goto('https://panthm.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
      }
    }

    // engagement simulation on landing page
    logMsg('Simulating landing page scroll & reading engagement...');
    await humanScroll(page);
    await new Promise(resolve => setTimeout(resolve, 8000 + Math.random() * 4000));

    // Internal page deep traversal
    try {
      logMsg('Simulating deep internal site navigation...');
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
          logMsg(`Internal navigation timeout: ${e.message}`);
          await page.goto(randomLink, { waitUntil: 'domcontentloaded', timeout: 10000 });
        }
        
        await humanScroll(page);
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
    } catch (navErr) {
      logMsg(`Internal site navigation warning: ${navErr.message}`);
    }

    logMsg(`Successfully completed search session on: ${page.url()}`);

  } catch (err) {
    logMsg(`❌ Critical System Error: ${err.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    logMsg('Search session completed and browser closed.');
  }
}

runCTRBooster().catch(() => process.exit(1));
