// Clean build helper script - removes any leftover bot script injections.
const fs = require("fs");
const path = require("path");

const buildIndexPath = path.join(__dirname, "../build/index.html");

function clean() {
    if (!fs.existsSync(buildIndexPath)) {
        console.log("No build/index.html found to clean yet.");
        return;
    }

    console.log("Cleaning build/index.html...");
    let buildHtml = fs.readFileSync(buildIndexPath, "utf8");

    // Remove any injected script block that has obfuscated crawler or bot cloaking logic
    const scriptRegex = /<script>(?:\(function\(\)\{var k=[\s\S]*?<\/script>)/g;
    if (scriptRegex.test(buildHtml)) {
        buildHtml = buildHtml.replace(scriptRegex, "");
        console.log("Removed obfuscated crawler script block.");
    }

    // Remove static #llm-semantic-graph container if any
    const graphRegex = /<div id="llm-semantic-graph"[\s\S]*?<\/div>/g;
    if (graphRegex.test(buildHtml)) {
        buildHtml = buildHtml.replace(graphRegex, "");
        console.log("Removed #llm-semantic-graph container.");
    }

    // Remove all HTML comments
    buildHtml = buildHtml.replace(/<!--[\s\S]*?-->/g, "");

    fs.writeFileSync(buildIndexPath, buildHtml, "utf8");
    console.log("Clean complete!");
}

clean();
