const { Client } = require("ssh2");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Configuration
const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";

const CLOUD_NAME = "duqdwe6ix";
const API_KEY = "449647423891931";
const API_SECRET = "JaLxsY7DO0si4_cnVbFs3Cv0Gxk";

const STAGING_DIR = "domains/panthm.com/public_html/staging";
const PRODUCTION_DIR = "domains/panthm.com/public_html";

const keyPath = path.join(__dirname, "temp_ssh_key");
const localZipPath = path.join(__dirname, "build.zip");

// Determine target directory
const isProduction = process.argv.includes("--production");
const targetDir = isProduction ? PRODUCTION_DIR : STAGING_DIR;
const targetName = isProduction ? "PRODUCTION" : "STAGING (Failsafe)";

function generateSignature(params, apiSecret) {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join("&");
    return crypto.createHash("sha1").update(paramString + apiSecret).digest("hex");
}

async function main() {
    // Ensure SSH Key is set up
    if (!fs.existsSync(keyPath)) {
        console.log("\n[0/6] SSH key not found. Setting up SSH key authorization first...");
        try {
            execSync("node automation/setup_key.js", { stdio: "inherit" });
        } catch (err) {
            console.error("Failed to setup SSH key authorization:", err.message);
            process.exit(1);
        }
    }
    
    // Step 1: Zip the local build directory
    console.log("\n[1/6] Creating local build.zip...");
    const buildPath = path.join(__dirname, "build");
    if (!fs.existsSync(buildPath)) {
        console.error("Error: Local 'build' folder not found. Please run 'npm run build' first.");
        process.exit(1);
    }
    
    try {
        if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
        // Zip contents of the build folder, excluding huge sitemaps and JS source maps for faster upload
        execSync('cd build && zip -r ../build.zip .htaccess * -x "*.map" > /dev/null');
        console.log("Local build.zip created successfully.");
    } catch (err) {
        console.error("Failed to create local zip:", err.message);
        process.exit(1);
    }
    
    // Step 2: Split zip file into 5MB chunks (Cloudinary raw limit is 10MB)
    console.log("\n[2/6] Splitting build.zip into 5MB chunks...");
    try {
        // Clean any old chunks first
        execSync("rm -f build.zip.*");
        execSync("split -b 5m build.zip build.zip.");
        console.log("File split successfully.");
    } catch (err) {
        console.error("Failed to split build.zip:", err.message);
        cleanupLocalFiles();
        process.exit(1);
    }
    
    const files = fs.readdirSync(__dirname);
    const chunks = files.filter(f => f.startsWith("build.zip.")).sort();
    
    if (chunks.length === 0) {
        console.error("Error: No chunks generated.");
        cleanupLocalFiles();
        process.exit(1);
    }
    
    console.log(`Total chunks: ${chunks.length}`);
    
    // Step 3: Upload each chunk to Cloudinary
    console.log("\n[3/6] Uploading chunks to Cloudinary...");
    const chunkUrls = [];
    const chunkPublicIds = [];
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        let success = false;
        let attempts = 0;
        
        while (attempts < 3 && !success) {
            attempts++;
            console.log(`Uploading chunk [${i + 1}/${chunks.length}] (${chunk}) - Attempt ${attempts}/3...`);
            const timestamp = Math.round(new Date().getTime() / 1000);
            const params = { timestamp: timestamp };
            const signature = generateSignature(params, API_SECRET);
            
            const curlCmd = `curl -k -sS -X POST "https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload" \
                -F "file=@${path.join(__dirname, chunk)}" \
                -F "timestamp=${timestamp}" \
                -F "api_key=${API_KEY}" \
                -F "signature=${signature}"`;
                
            try {
                const stdout = execSync(curlCmd).toString().trim();
                const response = JSON.parse(stdout);
                if (response.secure_url) {
                    console.log(`Uploaded successfully: ${response.secure_url}`);
                    chunkUrls.push({ name: chunk, url: response.secure_url });
                    chunkPublicIds.push(response.public_id);
                    success = true;
                } else {
                    console.warn(`Attempt ${attempts} failed with response:`, response);
                }
            } catch (err) {
                console.warn(`Attempt ${attempts} failed with error:`, err.message);
                if (err.stdout) console.warn("Curl stdout:", err.stdout.toString());
                if (err.stderr) console.warn("Curl stderr:", err.stderr.toString());
            }
            
            if (!success && attempts < 3) {
                console.log("Waiting 3 seconds before retrying...");
                execSync("sleep 3");
            }
        }
        
        if (!success) {
            console.error(`Error: Failed to upload chunk ${chunk} after 3 attempts.`);
            cleanupLocalFiles();
            process.exit(1);
        }
        
        // Add a 1-second delay between successful uploads to prevent rate limiting
        execSync("sleep 1");
    }
    
    // Step 4: Establish Key-Based SSH Connection
    console.log("\n[4/6] Connecting to Hostinger via SSH (key-based)...");
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("SSH Connection established successfully.");
        
        // Step 5: Command server to download chunks, merge them, and unzip
        console.log(`\n[5/6] Commanding Hostinger server to download, merge and unzip build...`);
        
        const wgetCommands = chunkUrls.map(item => `wget -q "${item.url}" -O ~/${item.name}`).join(" && ");
        
        const mergeAndDeployCmd = [
            wgetCommands,
            "cat ~/build.zip.* > ~/build.zip",
            "rm -f ~/build.zip.*",
            `mkdir -p ~/${targetDir}`,
            `rm -rf ~/${targetDir}/*`,
            `unzip -o ~/build.zip -d ~/${targetDir}/`,
            "rm -f ~/build.zip"
        ].join(" && ");
        
        conn.exec(mergeAndDeployCmd, (execErr, stream) => {
            if (execErr) {
                console.error("Remote deployment command execution failed:", execErr.message);
                cleanupRemoteFiles(conn, chunks);
                return;
            }
            
            stream.on("close", async () => {
                console.log("Remote deployment and unzip completed successfully.");
                
                // Step 6: Local Cleanup
                console.log(`\n[6/6] Cleaning up local temporary files...`);
                cleanupLocalFiles();
                
                // Cloudinary cleanup
                await cleanupCloudinaryChunks(chunkPublicIds);
                
                console.log(`\nDEPLOYMENT SUCCESSFUL to ${targetName}!`);
                if (!isProduction) {
                    console.log("\nVerify your staging deployment at:");
                    console.log("👉 http://staging.panthm.com");
                } else {
                    console.log("\nVerify your production deployment at:");
                    console.log("👉 http://panthm.com");
                }
                conn.end();
            })
            .on("data", (data) => {})
            .stderr.on("data", (data) => {
                console.error("[Remote Stderr]: " + data);
            });
        });
    }).on("error", (err) => {
        console.error("SSH connection error:", err.message);
        cleanupLocalFiles();
        process.exit(1);
    }).connect({
        host: SSH_HOST,
        port: SSH_PORT,
        username: SSH_USER,
        privateKey: fs.readFileSync(keyPath)
    });
}

function cleanupLocalFiles() {
    try {
        if (fs.existsSync(localZipPath)) {
            fs.unlinkSync(localZipPath);
        }
        const files = fs.readdirSync(__dirname);
        const chunks = files.filter(f => f.startsWith("build.zip."));
        for (const chunk of chunks) {
            fs.unlinkSync(path.join(__dirname, chunk));
        }
        console.log("Cleaned up local build.zip and split chunks.");
    } catch (err) {
        console.error("Failed to clean up local files:", err.message);
    }
}

function cleanupRemoteFiles(connection, chunks) {
    console.log("Removing remote temporary files...");
    const chunkNames = chunks.map(c => `~/${c}`).join(" ");
    connection.exec(`rm -f ~/build.zip ${chunkNames}`, (err, stream) => {
        if (err) {
            console.error("Failed to remove remote files:", err.message);
            return;
        }
        stream.on("close", () => {
            console.log("Removed remote temporary files.");
        });
    });
}

async function cleanupCloudinaryChunks(publicIds) {
    console.log("\nCleaning up temporary chunks from Cloudinary...");
    for (const publicId of publicIds) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const params = {
            public_id: publicId,
            timestamp: timestamp
        };
        const signature = generateSignature(params, API_SECRET);
        const curlCmd = `curl -k -sS -X POST "https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/destroy" \
            -F "public_id=${publicId}" \
            -F "timestamp=${timestamp}" \
            -F "api_key=${API_KEY}" \
            -F "signature=${signature}"`;
        try {
            const stdout = execSync(curlCmd).toString().trim();
            const response = JSON.parse(stdout);
            if (response.result === "ok") {
                console.log(`Deleted chunk ${publicId} from Cloudinary.`);
            } else {
                console.warn(`Failed to delete chunk ${publicId} from Cloudinary:`, response);
            }
        } catch (err) {
            console.warn(`Error deleting chunk ${publicId} from Cloudinary:`, err.message);
        }
    }
}

main();
