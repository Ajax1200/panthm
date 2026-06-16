const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const CLOUD_NAME = "duqdwe6ix";
const API_KEY = "449647423891931";
const API_SECRET = "JaLxsY7DO0si4_cnVbFs3Cv0Gxk";

const localZipPath = path.join(__dirname, "../build.zip");

function generateSignature(params, apiSecret) {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join("&");
    return crypto.createHash("sha1").update(paramString + apiSecret).digest("hex");
}

async function run() {
    console.log("Creating build.zip...");
    try {
        if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
        execSync('cd build && zip -r ../build.zip * -x "sitemap*" -x "*.map" > /dev/null', { cwd: path.join(__dirname, "..") });
        console.log("Local build.zip created.");
    } catch (err) {
        console.error("Failed to create build.zip:", err.message);
        process.exit(1);
    }
    
    console.log("Preparing Cloudinary signed upload...");
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const params = {
        timestamp: timestamp
    };
    
    const signature = generateSignature(params, API_SECRET);
    
    // Construct the curl command
    // Using -k to ignore SSL certificate validation issues
    const curlCmd = `curl -k -s -X POST "https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload" \
        -F "file=@${localZipPath}" \
        -F "timestamp=${timestamp}" \
        -F "api_key=${API_KEY}" \
        -F "signature=${signature}"`;
        
    console.log("Uploading build.zip to Cloudinary via curl...");
    try {
        const stdout = execSync(curlCmd).toString().trim();
        const response = JSON.parse(stdout);
        
        if (response.secure_url) {
            console.log("SUCCESS! Uploaded to Cloudinary.");
            console.log("Secure URL:", response.secure_url);
            fs.writeFileSync(path.join(__dirname, "../cloudinary_url.txt"), response.data ? response.data.secure_url : response.secure_url);
            fs.unlinkSync(localZipPath);
            process.exit(0);
        } else {
            console.error("Cloudinary upload returned error response:", response);
            fs.unlinkSync(localZipPath);
            process.exit(1);
        }
    } catch (err) {
        console.error("Curl command execution failed:", err.message);
        if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
        process.exit(1);
    }
}

run();
