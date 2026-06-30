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
  const queries = ['PANTHM AI Labs', 'PANTHM AI'];
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
  return [...new Set(queries)].filter(Boolean);
}

// Fetch list of working proxy servers for unique IP distribution
async function fetchProxyList() {
  logMsg('Fetching proxy list for connection uniqueness...');
  try {
    const res = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=4000&country=all&ssl=yes&anonymity=elite', { timeout: 6000 });
    if (res.data) {
      const proxies = res.data.split('\r\n').map(p => p.trim()).filter(Boolean);
      logMsg(`Retrieved ${proxies.length} potential proxies from pool.`);
      return proxies;
    }
  } catch (err) {
    logMsg(`Proxy list API unavailable: ${err.message}`);
  }
  return [];
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
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = Math.floor(Math.random() * 60) + 30;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 2500) {
            clearInterval(timer);
            resolve();
          }
        }, 150 + Math.random() * 100);
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
    }, domain);

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

// Google Search Handler with Captcha Detection
async function runGoogleSearch(page, query) {
  logMsg('Navigating to Google...');
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="L2AGLb"]');
  if (consentButton) {
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
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

// Bing Search Handler with Captcha Detection
async function runBingSearch(page, query) {
  logMsg('Navigating to Bing...');
  await page.goto('https://www.bing.com', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const consentButton = await page.$('button[id="bnp_btn_accept"]');
  if (consentButton) {
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
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

async function launchBrowserWithProxy(proxy) {
  const args = [
    '--no-sandbox', 
    '--disable-setuid-sandbox', 
    '--disable-dev-shm-usage', 
    '--disable-gpu',
    '--window-size=1280,800'
  ];
  if (proxy) {
    args.push(`--proxy-server=http://${proxy}`);
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    args
  });
  return browser;
}

async function runCTRBooster() {
  logMsg('Initializing Distributed Residential Proxy CTR Engine...');
  const queryPool = await getSearchQueries();
  const selectedQuery = queryPool[Math.floor(Math.random() * queryPool.length)];
  logMsg(`🎯 Target Query: "${selectedQuery}"`);

  const proxyList = await fetchProxyList();
  let browser = null;
  let proxyUsed = null;

  // Shuffle and try top 10 proxies for active connection check
  const shuffledProxies = proxyList.sort(() => 0.5 - Math.random()).slice(0, 10);
  for (const testProxy of shuffledProxies) {
    try {
      browser = await launchBrowserWithProxy(testProxy);
      const page = await browser.newPage();
      
      // Strict 6s timeout for proxy connection verify
      await page.setDefaultNavigationTimeout(6000);
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
      
      logMsg(`✅ Connection verified using proxy: http://${testProxy}`);
      proxyUsed = testProxy;
      break;
    } catch (err) {
      logMsg(`❌ Proxy http://${testProxy} failed health check: ${err.message}`);
      if (browser) {
        await browser.close();
        browser = null;
      }
    }
  }

  // Cloud runner VM direct fallback
  if (!browser) {
    logMsg('⚠️ All proxies failed. Proceeding with rotated Cloud VM connection...');
    browser = await launchBrowserWithProxy(null);
  }

  try {
    const page = await browser.newPage();
    
    // Viewport & screen size randomization
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1280, height: 800 }
    ];
    await page.setViewport(viewports[Math.floor(Math.random() * viewports.length)]);

    // User agent rotation
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);

    // HTTP Headers accept-language rotation
    const languages = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU'];
    await page.setExtraHTTPHeaders({
      'Accept-Language': `${languages[Math.floor(Math.random() * languages.length)]},en;q=0.9`
    });

    let clickedLink = false;

    // 1. Google
    try {
      clickedLink = await runGoogleSearch(page, selectedQuery);
    } catch (err) {
      logMsg(`Google pathway bypassed: ${err.message}`);
      
      // 2. Bing
      try {
        clickedLink = await runBingSearch(page, selectedQuery);
      } catch (bingErr) {
        logMsg(`Bing pathway bypassed: ${bingErr.message}`);
        
        // 3. DuckDuckGo
        try {
          clickedLink = await runDuckDuckGoSearch(page, selectedQuery);
        } catch (ddgErr) {
          logMsg(`DuckDuckGo pathway bypassed: ${ddgErr.message}`);
        }
      }
    }

    // 4. Referrer Spoofed Direct Landing
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

    // Dwell Time & Scroll
    logMsg('Entering Dwell time loop...');
    await humanScroll(page);
    await new Promise(resolve => setTimeout(resolve, 8000 + Math.random() * 4000));

    // Traversing inner links (eliminate bounce)
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
        await humanScroll(page);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (e) {}

    logMsg(`SUCCESS! Dwell time satisfied on ending URL: ${page.url()}`);

  } catch (err) {
    logMsg(`❌ Critical Exception: ${err.message}`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    logMsg('Browser closed.');
  }
}

runCTRBooster().catch(() => process.exit(1));
