const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
const FormData = require("form-data");
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
    
    // Cloudinary raw upload parameters
    const params = {
        timestamp: timestamp
    };
    
    const signature = generateSignature(params, API_SECRET);
    
    const form = new FormData();
    form.append("file", fs.createReadStream(localZipPath));
    form.append("timestamp", timestamp);
    form.append("api_key", API_KEY);
    form.append("signature", signature);
    
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;
    
    console.log("Uploading build.zip to Cloudinary (raw resource)...");
    try {
        const response = await axios.post(url, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log("SUCCESS! Uploaded to Cloudinary.");
        console.log("Secure URL:", response.data.secure_url);
        fs.unlinkSync(localZipPath);
        process.exit(0);
    } catch (err) {
        console.error("Cloudinary upload failed:", err.response ? err.response.data : err.message);
        if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
        process.exit(1);
    }
}

run();
