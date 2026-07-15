const puppeteer = require("puppeteer");
const path = require("path");

async function main() {
    console.log("Launching headless browser...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport size
        await page.setViewport({ width: 1440, height: 900 });
        
        // Provide Basic Authentication credentials
        console.log("Setting basic authentication credentials...");
        await page.authenticate({
            username: "Admin",
            password: "PANTHM"
        });
        
        console.log("Navigating to https://canvas.panthm.com/ ...");
        await page.goto("https://canvas.panthm.com/", {
            waitUntil: "networkidle0",
            timeout: 60000
        });
        
        // Wait a few seconds for animations and SVG lines to draw
        console.log("Waiting for animations and dynamic assets to stabilize...");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

        // Click on the central hub node to load live server logs in the drawer
        console.log("Clicking central hub node (#node-center) to open live logs...");
        await page.click("#node-center");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
        
        const artifactsDir = "/Users/AJ/.gemini/antigravity/brain/43c4374c-c28a-4201-acf3-b4decdfb81f7";
        
        // Capture Dark Mode SEO
        const darkPath = path.join(artifactsDir, "canvas_dark_live.png");
        console.log(`Saving dark mode SEO screenshot to ${darkPath}...`);
        await page.screenshot({ path: darkPath, fullPage: false });
        
        // Toggle Theme to Light Mode SEO
        console.log("Clicking theme toggle button (#theme-toggle)...");
        await page.click("#theme-toggle");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        
        // Capture Light Mode SEO
        const lightPath = path.join(artifactsDir, "canvas_light_live.png");
        console.log(`Saving light mode SEO screenshot to ${lightPath}...`);
        await page.screenshot({ path: lightPath, fullPage: false });

        // Toggle back to Dark Mode
        console.log("Switching back to dark mode...");
        await page.click("#theme-toggle");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Click WhatsApp API Campaigns tab (tab 2)
        console.log("Clicking tab-btn-2 to switch to WhatsApp workflow...");
        await page.click("#tab-btn-2");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

        // Capture WhatsApp tab in dark mode
        const waPath = path.join(artifactsDir, "canvas_whatsapp_dark_live.png");
        console.log(`Saving WhatsApp dark mode screenshot to ${waPath}...`);
        await page.screenshot({ path: waPath, fullPage: false });
        
        console.log("Screenshots captured successfully!");
    } catch (err) {
        console.error("Error capturing screenshots:", err);
    } finally {
        await browser.close();
    }
}

main();
