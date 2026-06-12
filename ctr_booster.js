import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Initialize the stealth plugin to override bot fingerprints
puppeteer.use(StealthPlugin());

// Emulate human typing speed variations
async function humanType(page, selector, text) {
  const element = await page.$(selector);
  if (!element) return;
  await element.focus();
  for (const char of text) {
    await page.keyboard.sendCharacter(char);
    // Random pause between keystrokes to simulate natural typing speed (50ms - 150ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  }
}

// Emulate human page reading and scrolling behavior
async function humanScroll(page) {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = Math.floor(Math.random() * 80) + 40; // Random scroll intervals
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          // Stop when we reach the bottom or after a certain depth
          if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 3000) {
            clearInterval(timer);
            resolve();
          }
        }, 150 + Math.random() * 150); // Random scroll timing
      });
    });
    console.log('[CTR Booster] Completed human scroll simulation.');
  } catch (err) {
    console.warn('[CTR Booster] Scroll simulation warning:', err.message);
  }
}

async function runGoogleSearch(page) {
  console.log('[CTR Booster] Navigating to Google...');
  await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 20000 });

  // Handle cookie consent if visible (often visible in EU runners)
  const consentButton = await page.$('button[id="L2AGLb"]');
  if (consentButton) {
    console.log('[CTR Booster] Accepting Google consent policy...');
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Search for PANTHM AI Labs
  console.log('[CTR Booster] Searching on Google with human typing delays...');
  await humanType(page, 'textarea[name="q"]', 'PANTHM AI Labs');
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

  // CHECK: Look for "Search instead for" correction link (either text match OR nfpr=1 / spell=0 url parameters)
  console.log('[CTR Booster] Analyzing Google search results page...');
  const correctionLink = await page.evaluateHandle(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.find(a => 
      (a.textContent && a.textContent.includes('Search instead for')) || 
      (a.href && (a.href.includes('nfpr=1') || a.href.includes('spell=0')))
    );
  });

  if (correctionLink && correctionLink.asElement()) {
    console.log('[CTR Booster] 🎯 Spelling override link matched. Clicking override...');
    await correctionLink.asElement().click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
  } else {
    console.log('[CTR Booster] No spelling correction link detected. Spelling is already recognized.');
  }

  // Locating panthm.com in organic results
  let resultLink = null;
  let pageNum = 1;
  const maxPages = 3;

  while (pageNum <= maxPages) {
    console.log(`[CTR Booster] Scanning Google page ${pageNum} for panthm.com...`);
    resultLink = await page.evaluateHandle(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.find(a => a.href && (a.href.includes('panthm.com') || a.href.includes('panthm.com/')));
    });

    if (resultLink && resultLink.asElement()) {
      console.log('[CTR Booster] 🎯 Found organic target result on Google!');
      break;
    }

    const nextButton = await page.$('a[id="pnnext"]');
    if (!nextButton) break;

    await nextButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
    pageNum++;
  }

  if (resultLink && resultLink.asElement()) {
    console.log('[CTR Booster] Clicking target link on Google...');
    await resultLink.asElement().click();
    return true;
  }

  throw new Error('Target result not found on Google results pages.');
}

async function runBingSearch(page) {
  console.log('[CTR Booster] 🔄 Fallback: Navigating to Bing...');
  await page.goto('https://www.bing.com', { waitUntil: 'networkidle2', timeout: 20000 });

  // Handle cookie consent if visible on Bing
  const consentButton = await page.$('button[id="bnp_btn_accept"]');
  if (consentButton) {
    console.log('[CTR Booster] Accepting Bing consent policy...');
    await consentButton.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('[CTR Booster] Searching on Bing with human typing delays...');
  await humanType(page, 'input[name="q"]', 'PANTHM AI Labs');
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

  // Click spelling correction override if present on Bing (usually "Showing results for... Search instead for...")
  const correctionLink = await page.evaluateHandle(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.find(a => a.textContent && a.textContent.toLowerCase().includes('search instead for'));
  });

  if (correctionLink && correctionLink.asElement()) {
    console.log('[CTR Booster] 🎯 Bing spelling override link found. Clicking...');
    await correctionLink.asElement().click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
  }

  // Scanning Bing search pages
  let resultLink = null;
  let pageNum = 1;
  const maxPages = 3;

  while (pageNum <= maxPages) {
    console.log(`[CTR Booster] Scanning Bing page ${pageNum} for panthm.com...`);
    resultLink = await page.evaluateHandle(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.find(a => a.href && (a.href.includes('panthm.com') || a.href.includes('panthm.com/')));
    });

    if (resultLink && resultLink.asElement()) {
      console.log('[CTR Booster] 🎯 Found organic target result on Bing!');
      break;
    }

    const nextButton = await page.$('a[title="Next page"]');
    if (!nextButton) break;

    await nextButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
    pageNum++;
  }

  if (resultLink && resultLink.asElement()) {
    console.log('[CTR Booster] Clicking target link on Bing...');
    await resultLink.asElement().click();
    return true;
  }

  throw new Error('Target result not found on Bing results pages.');
}

async function runCTRBooster() {
  console.log('[CTR Booster] Starting organic search session (Bulletproof Failsafe Mode)...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage', 
        '--disable-accelerated-2d-canvas', 
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
      console.warn('[CTR Booster] Google Search failed or was blocked:', googleErr.message);
      
      // 2. Fallback to Bing Search if Google fails
      try {
        clickedLink = await runBingSearch(page);
      } catch (bingErr) {
        console.warn('[CTR Booster] Bing Search fallback failed or was blocked:', bingErr.message);
      }
    }

    // 3. Ultimate Fallback: Direct Navigation
    if (!clickedLink) {
      console.log('[CTR Booster] 🔄 Ultimate Fallback: Simulating direct navigation to https://panthm.com...');
      await page.goto('https://panthm.com', { waitUntil: 'networkidle2', timeout: 30000 });
    }

    // Reading engagement simulation
    console.log('[CTR Booster] Simulating page scroll & reading engagement...');
    await humanScroll(page);
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Internal navigation loop
    try {
      console.log('[CTR Booster] Simulating internal page navigation...');
      const internalLinks = await page.$$eval('a', anchors => 
        anchors
          .map(a => a.href)
          .filter(href => href.startsWith('https://panthm.com/') && !href.includes('#'))
      );

      if (internalLinks.length > 0) {
        const randomLink = internalLinks[Math.floor(Math.random() * internalLinks.length)];
        console.log(`[CTR Booster] Navigating internally to: ${randomLink}`);
        await page.goto(randomLink, { waitUntil: 'networkidle2', timeout: 20000 });
        
        await humanScroll(page);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (navErr) {
      console.warn('[CTR Booster] Internal site navigation simulation failed:', navErr.message);
    }

    console.log(`[CTR Booster] Completed session on: ${page.url()}`);

  } catch (err) {
    console.error('[CTR Booster] ❌ System Error:', err.message);
    // Exit with code 1 to alert GitHub Actions on critical system failure (e.g. library crash)
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('[CTR Booster] Search session completed and browser closed.');
  }
}

runCTRBooster().catch(() => process.exit(1));
