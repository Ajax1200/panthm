const fs = require("fs");
const path = require("path");

const BRAIN_DIR = "/Users/AJ/.gemini/antigravity/brain/43c4374c-c28a-4201-acf3-b4decdfb81f7";

async function run() {
    console.log("Launching Puppeteer in interactive mode (headless: false)...");
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
    
    const page = (await browser.pages())[0] || await browser.newPage();
    
    try {
        console.log("Navigating to Hostinger hPanel...");
        await page.goto("https://hpanel.hostinger.com/", { waitUntil: "networkidle2" }).catch(err => console.log("Navigation error:", err.message));
        
        let credentialsFilled = false;
        let counter = 0;
        
        while (counter < 24) { // run for 2 minutes (24 * 5 seconds)
            counter++;
            const url = page.url();
            const title = await page.title().catch(() => "");
            
            console.log(`[${counter * 5}s] Title: "${title}" | URL: ${url}`);
            
            // Take screenshot
            const screenshotPath = path.join(BRAIN_DIR, "hostinger_interactive_live.png");
            await page.screenshot({ path: screenshotPath }).catch(err => console.log("Screenshot error:", err.message));
            
            // Check if we reached the dashboard
            if (url.includes("hpanel.hostinger.com/dashboard") || url.includes("/hosting") || url.includes("/home")) {
                console.log("SUCCESS: Reached dashboard!");
                break;
            }
            
            // Try to fill credentials if input fields are present
            if (!credentialsFilled) {
                const emailInput = await page.$("input[type='email']").catch(() => null);
                const passwordInput = await page.$("input[type='password']").catch(() => null);
                
                if (emailInput && passwordInput) {
                    console.log("Autofilling credentials...");
                    await page.click("input[type='email']", { clickCount: 3 });
                    await page.keyboard.press("Backspace");
                    await page.type("input[type='email']", "ajayshelkeofficial@gmail.com", { delay: 50 });
                    
                    await page.click("input[type='password']", { clickCount: 3 });
                    await page.keyboard.press("Backspace");
                    await page.type("input[type='password']", "Panthm@0050", { delay: 50 });
                    
                    credentialsFilled = true;
                    console.log("Autofill complete. Solve any captcha if visible and click Log In.");
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
    } catch (err) {
        console.error("Interactive login error:", err);
    } finally {
        await browser.close();
        console.log("Browser closed.");
    }
}

run();
