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
        
        // Temporarily move large static/media folder out of build to minimize upload size (under 6MB)
        // unzipping overlays files on the remote server, keeping existing media files intact.
        const mediaPath = path.join(__dirname, "build", "static", "media");
        const tempMediaPath = path.join(__dirname, "../media_temp_deploy");
        let mediaMoved = false;
        
        if (fs.existsSync(mediaPath)) {
            console.log("ℹ️  Temporarily moving build/static/media directory to optimize upload package...");
            if (fs.existsSync(tempMediaPath)) {
                // Delete if old temp folder exists
                fs.rmSync(tempMediaPath, { recursive: true, force: true });
            }
            fs.renameSync(mediaPath, tempMediaPath);
            mediaMoved = true;
        }
        
        try {
            execSync('cd build && zip -r ../build.zip .htaccess * -x "*.map" -x "*.mp4" > /dev/null');
        } finally {
            // Always restore the media folder
            if (mediaMoved && fs.existsSync(tempMediaPath)) {
                fs.mkdirSync(path.dirname(mediaPath), { recursive: true });
                fs.renameSync(tempMediaPath, mediaPath);
                console.log("✅ Restored build/static/media directory.");
            }
        }
        
        console.log("Local build.zip created successfully.");
    } catch (err) {
        console.error("Failed to create local zip:", err.message);
        process.exit(1);
    }
    
    // Step 2: Establish SSH Connection
    console.log("\n[2/4] Connecting to Hostinger via SSH...");
    const conn = new Client();
    const keepAlive = setInterval(() => {}, 1000);
    
    conn.on("ready", () => {
        console.log("SSH Connection established successfully.");
        
        // Step 3: Open SFTP and upload build.zip
        console.log("\n[3/4] Uploading build.zip via SFTP channel...");
        conn.sftp((sftpErr, sftp) => {
            if (sftpErr) {
                console.error("Failed to open SFTP session:", sftpErr.message);
                cleanupLocalFiles();
                clearInterval(keepAlive);
                conn.end();
                process.exit(1);
            }
            
            // Clean up old remote zip if exists
            sftp.unlink("build.zip", () => {
                const readStream = fs.createReadStream(localZipPath);
                const writeStream = sftp.createWriteStream("build.zip");
                
                writeStream.on("finish", () => {
                    console.log("SFTP Upload completed successfully.");
                    
                    // Step 4: Extract build on remote server
                    console.log(`\n[4/4] Extracting build on Hostinger server...`);
                    const deployCmd = [
                        `mkdir -p ~/${targetDir}`,
                        // Guardrail: Remove loose sub-app files at root level to prevent pollution
                        `rm -f ~/${targetDir}/client.js ~/${targetDir}/style.css ~/${targetDir}/sw.js`,
                        `unzip -o ~/build.zip -d ~/${targetDir}/`,
                        `sed -i "s|/home/u586129197/domains/panthm.com/public_html/|/home/u586129197/${targetDir}/|g" ~/${targetDir}/canvas/.htaccess`,
                        "rm -f ~/build.zip"
                    ].join(" && ");
                    
                    conn.exec(deployCmd, (execErr, stream) => {
                        if (execErr) {
                            console.error("Remote deployment command execution failed:", execErr.message);
                            cleanupLocalFiles();
                            clearInterval(keepAlive);
                            conn.end();
                            process.exit(1);
                        }
                        
                        stream.on("close", () => {
                            console.log("Remote deployment and unzip completed successfully.");
                            cleanupLocalFiles();
                            console.log(`\nDEPLOYMENT SUCCESSFUL to ${targetName}!`);
                            if (!isProduction) {
                                console.log("\nVerify your staging deployment at:");
                                console.log("👉 http://staging.panthm.com");
                            } else {
                                console.log("\nVerify your production deployment at:");
                                console.log("👉 http://panthm.com");
                            }
                            clearInterval(keepAlive);
                            conn.end();
                        })
                        .on("data", (data) => {
                            console.log("[Remote Output]: " + data);
                        })
                        .stderr.on("data", (data) => {
                            console.error("[Remote Stderr]: " + data);
                        });
                });
            });

            writeStream.on("error", (err) => {
                    console.error("SFTP Write stream error:", err.message);
                    cleanupLocalFiles();
                    clearInterval(keepAlive);
                    conn.end();
                    process.exit(1);
                });

                readStream.pipe(writeStream);
            });
        });
    }).on("error", (err) => {
        console.error("SSH connection error:", err.message);
        cleanupLocalFiles();
        clearInterval(keepAlive);
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
