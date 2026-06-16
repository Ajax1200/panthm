const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const publicDir = path.join(__dirname, "../public");

function compressFile(filePath) {
    return new Promise((resolve, reject) => {
        const gzip = zlib.createGzip();
        const input = fs.createReadStream(filePath);
        const output = fs.createWriteStream(`${filePath}.gz`);

        input.pipe(gzip).pipe(output);

        output.on("finish", () => {
            console.log(`Gzipped: ${path.basename(filePath)} -> ${path.basename(filePath)}.gz`);
            // Delete original uncompressed XML file
            fs.unlinkSync(filePath);
            resolve();
        });

        output.on("error", (err) => {
            reject(err);
        });
    });
}

async function run() {
    console.log("Starting sitemap compression...");
    
    // 1. Locate all sitemap_pseo_*.xml files in public/ (except sitemap_pseo_index.xml)
    const files = fs.readdirSync(publicDir);
    const sitemaps = files.filter(f => 
        f.startsWith("sitemap_pseo_") && 
        f.endsWith(".xml") && 
        f !== "sitemap_pseo_index.xml"
    );

    console.log(`Found ${sitemaps.length} sitemaps to compress.`);

    for (const file of sitemaps) {
        const filePath = path.join(publicDir, file);
        await compressFile(filePath);
    }

    // 2. Update sitemap_pseo_index.xml content
    const indexPath = path.join(publicDir, "sitemap_pseo_index.xml");
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, "utf8");
        // Replace all .xml references to .xml.gz inside <loc> tags
        content = content.replace(/sitemap_pseo_hreflang_(\d+)\.xml/g, "sitemap_pseo_hreflang_$1.xml.gz");
        fs.writeFileSync(indexPath, content, "utf8");
        console.log("Updated sitemap_pseo_index.xml to reference .xml.gz files.");
    }

    console.log("Sitemap compression complete!");
}

run().catch(console.error);
