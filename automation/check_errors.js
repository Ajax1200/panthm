const puppeteer = require("puppeteer");
async function main() {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    page.on("console", msg => console.log("BROWSER LOG:", msg.text()));
    page.on("pageerror", err => console.error("BROWSER ERROR:", err.toString()));
    await page.authenticate({ username: "Admin", password: "PANTHM" });
    await page.goto("https://panthm.com/canvas/", { waitUntil: "networkidle0" });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
    const svgHTML = await page.evaluate(() => {
        const svg = document.getElementById('svg-connectors');
        return svg ? svg.outerHTML : 'SVG NOT FOUND';
    });
    console.log("SVG OUTER HTML:", svgHTML);
    await browser.close();
}
main();
