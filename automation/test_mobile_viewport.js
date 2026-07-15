const puppeteer = require("puppeteer");
const path = require("path");

async function main() {
    console.log("Launching headless browser for mobile audit...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    try {
        const page = await browser.newPage();
        
        // Simulating iPhone 13 Pro viewport
        await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
        
        await page.authenticate({
            username: "Admin",
            password: "PANTHM"
        });
        
        console.log("Navigating to https://canvas.panthm.com/ ...");
        await page.goto("https://canvas.panthm.com/", {
            waitUntil: "networkidle0",
            timeout: 60000
        });
        
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
        
        const artifactsDir = "/Users/AJ/.gemini/antigravity/brain/43c4374c-c28a-4201-acf3-b4decdfb81f7";
        
        // Capture initial load mobile view
        const initialPath = path.join(artifactsDir, "canvas_mobile_initial.png");
        console.log(`Saving initial mobile screenshot to ${initialPath}...`);
        await page.screenshot({ path: initialPath });
        
        // Click central hub node
        console.log("Clicking central hub node (#node-center) to open details drawer...");
        await page.click("#node-center");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        
        // Capture drawer open on mobile
        const drawerPath = path.join(artifactsDir, "canvas_mobile_drawer.png");
        console.log(`Saving mobile drawer screenshot to ${drawerPath}...`);
        await page.screenshot({ path: drawerPath });
        
        // Click Tab 2
        console.log("Clicking tab-btn-2 to switch to WhatsApp workflow...");
        await page.click("#tab-btn-2");
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        
        // Capture Tab 2 mobile view
        const tab2Path = path.join(artifactsDir, "canvas_mobile_tab2.png");
        console.log(`Saving Tab 2 mobile screenshot to ${tab2Path}...`);
        await page.screenshot({ path: tab2Path });
        
        console.log("Mobile audit screenshots captured successfully!");
    } catch (err) {
        console.error("Error running mobile audit:", err);
    } finally {
        await browser.close();
    }
}

main();
