import puppeteer from 'puppeteer';

async function runCTRBooster() {
  console.log('[CTR Booster] Starting organic search session...');
  
  let browser;
  try {
    // Launch headless browser with args optimized for GitHub Actions Linux environment
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage', 
        '--disable-accelerated-2d-canvas', 
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set realistic viewport and User-Agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let clickedLink = false;

    try {
      // 1. Go to Google
      console.log('[CTR Booster] Navigating to Google...');
      await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 20000 });

      // Handle cookie consent if visible (often visible in EU runners)
      const consentButton = await page.$('button[id="L2AGLb"]');
      if (consentButton) {
        console.log('[CTR Booster] Accepting Google consent policy...');
        await consentButton.click();
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // 2. Search for PANTHM AI Labs
      console.log('[CTR Booster] Searching for "PANTHM AI Labs"...');
      await page.type('textarea[name="q"]', 'PANTHM AI Labs');
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

      // 3. Look for "Search instead for" correction link
      console.log('[CTR Booster] Analyzing search results page...');
      
      const searchInsteadForText = 'Search instead for';
      const linkToClick = await page.evaluateHandle((text) => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors.find(a => a.textContent && a.textContent.includes(text));
      }, searchInsteadForText);

      if (linkToClick && linkToClick.asElement()) {
        console.log('[CTR Booster] 🎯 Did-you-mean correction found. Clicking "Search instead for PANTHM AI Labs"...');
        await linkToClick.asElement().click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
      } else {
        console.log('[CTR Booster] No "Did you mean" spell correction visible. Spelling is already recognized.');
      }

      // 4. Click the link to our website (panthm.com) in search results (paginated)
      console.log('[CTR Booster] Locating organic search result for panthm.com...');
      let resultLink = null;
      let pageNum = 1;
      const maxPages = 3;

      while (pageNum <= maxPages) {
        console.log(`[CTR Booster] Scanning page ${pageNum} for panthm.com...`);
        resultLink = await page.evaluateHandle(() => {
          const anchors = Array.from(document.querySelectorAll('a'));
          return anchors.find(a => a.href && (a.href.includes('panthm.com') || a.href.includes('panthm.com/')));
        });

        if (resultLink && resultLink.asElement()) {
          console.log('[CTR Booster] 🎯 Found organic target result!');
          break;
        }

        // If not found, go to the next page
        const nextButton = await page.$('a[id="pnnext"]');
        if (!nextButton) {
          console.log('[CTR Booster] No "Next" page button found.');
          break;
        }

        console.log('[CTR Booster] Navigating to next page...');
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
        pageNum++;
      }

      if (resultLink && resultLink.asElement()) {
        console.log('[CTR Booster] Clicking link to panthm.com...');
        await resultLink.asElement().click();
        clickedLink = true;
      }
    } catch (searchErr) {
      console.warn('[CTR Booster] Google Search navigation/interaction failed:', searchErr.message);
    }

    // Fallback: If search failed or couldn't find the link, perform Direct Navigation simulation
    if (!clickedLink) {
      console.log('[CTR Booster] 🔄 Fallback: Simulating direct navigation to https://panthm.com...');
      await page.goto('https://panthm.com', { waitUntil: 'networkidle2', timeout: 30000 });
    }

    // Wait and simulate reading engagement
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Interact with the site: Click a random link (e.g. Services, About, Blogs) to simulate multi-page session
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
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
    } catch (navErr) {
      console.warn('[CTR Booster] Internal site navigation simulation failed:', navErr.message);
    }

    console.log(`[CTR Booster] Completed session on: ${page.url()}`);

  } catch (err) {
    console.error('[CTR Booster] ❌ Core Session Error:', err.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('[CTR Booster] Search session completed and browser closed.');
  }
}

runCTRBooster().catch(console.error);
