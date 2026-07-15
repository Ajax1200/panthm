const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "public", "canvas", "index.html");
const jsPath = path.join(__dirname, "..", "public", "canvas", "canvas.js");

function main() {
    console.log("Reading public/canvas/index.html...");
    const content = fs.readFileSync(htmlPath, "utf8");
    
    const lines = content.split(/\r?\n/);
    
    // Find the <script> and </script> tags near the end
    let scriptStartIdx = -1;
    let scriptEndIdx = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("<script>") && i > 1200) {
            scriptStartIdx = i;
        }
        if (lines[i].includes("</script>") && i > 1200) {
            scriptEndIdx = i;
            break;
        }
    }
    
    if (scriptStartIdx === -1 || scriptEndIdx === -1) {
        console.error("Could not locate script tags in index.html");
        process.exit(1);
    }
    
    console.log(`Found script tag from line ${scriptStartIdx + 1} to ${scriptEndIdx + 1}`);
    
    // Extract script lines (excluding the tags themselves)
    const scriptLines = lines.slice(scriptStartIdx + 1, scriptEndIdx);
    const scriptContent = scriptLines.join("\n");
    
    console.log(`Writing canvas.js (${scriptLines.length} lines)...`);
    fs.writeFileSync(jsPath, scriptContent, "utf8");
    
    // Replace script block with external link in HTML
    const newLines = [
        ...lines.slice(0, scriptStartIdx),
        '  <script src="canvas.js"></script>',
        ...lines.slice(scriptEndIdx + 1)
    ];
    
    console.log("Saving index.html with externalized script link...");
    fs.writeFileSync(htmlPath, newLines.join("\n"), "utf8");
    console.log("Success!");
}

main();
