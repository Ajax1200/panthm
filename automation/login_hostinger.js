const fs = require("fs");
const path = require("path");

const BRAIN_DIR = "/Users/AJ/.gemini/antigravity/brain/43c4374c-c28a-4201-acf3-b4decdfb81f7";

async function run() {
    console.log("Launching standard puppeteer...");
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
        console.log("Navigating to Hostinger hPanel login...");
        await page.goto("https://hpanel.hostinger.com/", { waitUntil: "networkidle2", timeout: 60000 });
        
        console.log("Saving initial screenshot...");
        let screenshotPath = path.join(BRAIN_DIR, "hostinger_login_initial.png");
        await page.screenshot({ path: screenshotPath });
        console.log("Saved initial screenshot to:", screenshotPath);
        
        const title = await page.title();
        console.log("Page Title:", title);
        
        const content = await page.content();
        if (content.includes("Cloudflare") || content.includes("checking your browser")) {
            console.log("Detected Cloudflare protection/challenge page.");
        }
        
        // Let's check for input elements
        const inputs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("input")).map(input => ({
                type: input.type,
                name: input.name,
                id: input.id,
                placeholder: input.placeholder,
                className: input.className
            }));
        });
        console.log("Inputs found on page:", inputs);
        
        let emailSelector = "input[type='email']";
        let passSelector = "input[type='password']";
        
        const emailExists = await page.evaluate((sel) => !!document.querySelector(sel), emailSelector);
        if (emailExists) {
            console.log("Email input found. Filling credentials...");
            await page.type(emailSelector, "ajayshelkeofficial@gmail.com", { delay: 100 });
            await page.type(passSelector, "Panthm@0050", { delay: 100 });
            
            const submitSelector = "button[type='submit']";
            console.log("Clicking submit button...");
            await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(err => console.log("Navigation timeout: ", err.message)),
                page.click(submitSelector)
            ]);
            
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            console.log("Saving post-submit screenshot...");
            screenshotPath = path.join(BRAIN_DIR, "hostinger_login_post_submit.png");
            await page.screenshot({ path: screenshotPath });
            console.log("Saved post-submit screenshot to:", screenshotPath);
            
            const postTitle = await page.title();
            console.log("Post-submit Page Title:", postTitle);
            
            const postUrl = page.url();
            console.log("Post-submit URL:", postUrl);
        } else {
            console.log("Email input selector not found. Please review the screenshot.");
        }
        
    } catch (err) {
        console.error("Automation error:", err);
    } finally {
        await browser.close();
    }
}

run();
