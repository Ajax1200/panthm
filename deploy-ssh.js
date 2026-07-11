const { Client } = require("ssh2");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";

const STAGING_DIR = "domains/panthm.com/public_html/staging";
const PRODUCTION_DIR = "domains/panthm.com/public_html";

const keyPath = path.join(__dirname, "temp_ssh_key");
const localZipPath = path.join(__dirname, "build.zip");

// Determine target directory
const isProduction = process.argv.includes("--production");
const targetDir = isProduction ? PRODUCTION_DIR : STAGING_DIR;
const targetName = isProduction ? "PRODUCTION" : "STAGING (Failsafe)";

async function main() {
    // Ensure SSH Key is set up
    if (!fs.existsSync(keyPath)) {
        console.log("\n[0/4] SSH key not found. Setting up SSH key authorization first...");
        try {
            execSync("node automation/setup_key.js", { stdio: "inherit" });
        } catch (err) {
            console.error("Failed to setup SSH key authorization:", err.message);
            process.exit(1);
        }
    }
    
    // Step 1: Zip the local build directory
    console.log("\n[1/4] Creating local build.zip...");
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
    
    // Step 2: Establish Key-Based SSH Connection
    console.log("\n[2/4] Connecting to Hostinger via SSH (key-based)...");
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("SSH Connection established successfully.");
        
        // Step 3: SFTP Upload build.zip directly
        console.log("\n[3/4] Uploading build.zip via SFTP directly to remote server...");
        conn.sftp((sftpErr, sftp) => {
            if (sftpErr) {
                console.error("SFTP initialization failed:", sftpErr.message);
                cleanupLocalFiles();
                conn.end();
                process.exit(1);
            }
            
            const remoteZipPath = "/home/u586129197/build.zip";
            sftp.fastPut(localZipPath, remoteZipPath, {
                concurrency: 4,
                chunkSize: 32768
            }, (uploadErr) => {
                if (uploadErr) {
                    console.error("SFTP Upload failed:", uploadErr.message);
                    cleanupLocalFiles();
                    conn.end();
                    process.exit(1);
                }
                console.log("SFTP Upload completed successfully.");
                
                // Step 4: Unzip and deploy
                console.log(`\n[4/4] Extracting build on Hostinger server...`);
                
                const deployCmd = [
                    `mkdir -p ~/${targetDir}`,
                    `rm -rf ~/${targetDir}/*`,
                    `unzip -o ~/build.zip -d ~/${targetDir}/`,
                    `sed -i "s|/home/u586129197/domains/panthm.com/public_html/|/home/u586129197/${targetDir}/|g" ~/${targetDir}/automation-canvas/.htaccess`,
                    "rm -f ~/build.zip"
                ].join(" && ");
                
                conn.exec(deployCmd, (execErr, stream) => {
                    if (execErr) {
                        console.error("Remote deployment command execution failed:", execErr.message);
                        conn.end();
                        return;
                    }
                    
                    stream.on("close", () => {
                        console.log("Remote deployment and unzip completed successfully.");
                        
                        // Cleanup
                        cleanupLocalFiles();
                        
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
        console.log("Cleaned up local build.zip.");
    } catch (err) {
        console.error("Failed to clean up local files:", err.message);
    }
}

main();
