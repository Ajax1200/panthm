const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });
  page.on('response', response => {
    if (response.url().includes('/api/blogs/published')) {
      console.log(`RESPONSE: ${response.url()} - Status: ${response.status()}`);
    }
  });

  await page.goto('https://www.panthm.com/blogs', { waitUntil: 'networkidle2' });
  
  await browser.close();
})();
