const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";

const keyPath = path.join(__dirname, "temp_ssh_key");
const localHtmlPath = path.join(__dirname, "public", "canvas", "index.html");
const localJsPath = path.join(__dirname, "public", "canvas", "canvas.js");
const localHtaccessPath = path.join(__dirname, "public", "canvas", ".htaccess");
const localHtpasswdPath = path.join(__dirname, "public", "canvas", ".htpasswd");

// Helper to write data in small throttled chunks to prevent firewall drops
function writeThrottled(stream, data, chunkSize = 8192, delay = 150) {
    return new Promise((resolve) => {
        let offset = 0;
        function sendNext() {
            if (offset >= data.length) {
                stream.end();
                resolve();
                return;
            }
            const chunk = data.slice(offset, offset + chunkSize);
            offset += chunkSize;
            
            stream.write(chunk);
            setTimeout(sendNext, delay);
        }
        sendNext();
    });
}

async function main() {
    if (!fs.existsSync(localHtmlPath)) {
        console.error("Error: Canvas index.html not found.");
        process.exit(1);
    }
    if (!fs.existsSync(localJsPath)) {
        console.error("Error: Canvas canvas.js not found.");
        process.exit(1);
    }

    console.log("Reading local files and encoding to Base64...");
    const htmlBase64 = fs.readFileSync(localHtmlPath).toString("base64");
    const jsBase64 = fs.readFileSync(localJsPath).toString("base64");
    const htaccessBase64 = fs.readFileSync(localHtaccessPath).toString("base64");
    const htpasswdBase64 = fs.readFileSync(localHtpasswdPath).toString("base64");

    console.log("Connecting to Hostinger via SSH...");
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("SSH Connection established.");
        const remoteDir = "domains/panthm.com/public_html/canvas";
        
        // Step 1: Create directory
        console.log("Creating remote canvas directory...");
        conn.exec(`mkdir -p ~/${remoteDir}`, (err, stream) => {
            if (err) {
                console.error("Failed to create directory:", err.message);
                conn.end();
                process.exit(1);
            }
            
            stream.on("close", () => {
                // Step 2: Stream index.html via base64 decoder
                console.log("Streaming base64 index.html (throttled)...");
                conn.exec(`base64 -d > ~/${remoteDir}/index.html`, async (err, htmlStream) => {
                    if (err) {
                        console.error("Failed to stream index.html:", err.message);
                        conn.end();
                        process.exit(1);
                    }
                    
                    htmlStream.on("close", () => {
                        console.log("index.html uploaded successfully.");
                        
                        // Step 3: Stream canvas.js via base64 decoder
                        console.log("Streaming base64 canvas.js (throttled)...");
                        conn.exec(`base64 -d > ~/${remoteDir}/canvas.js`, async (err, jsStream) => {
                            if (err) {
                                console.error("Failed to stream canvas.js:", err.message);
                                conn.end();
                                process.exit(1);
                            }
                            
                            jsStream.on("close", () => {
                                console.log("canvas.js uploaded successfully.");
                                
                                // Step 4: Stream .htaccess via base64 decoder
                                console.log("Streaming base64 .htaccess...");
                                conn.exec(`base64 -d > ~/${remoteDir}/.htaccess`, async (err, htaccessStream) => {
                                    if (err) {
                                        console.error("Failed to stream .htaccess:", err.message);
                                        conn.end();
                                        process.exit(1);
                                    }
                                    
                                    htaccessStream.on("close", () => {
                                        console.log(".htaccess uploaded successfully.");
                                        
                                        // Step 5: Stream .htpasswd via base64 decoder
                                        console.log("Streaming base64 .htpasswd...");
                                        conn.exec(`base64 -d > ~/${remoteDir}/.htpasswd`, async (err, htpasswdStream) => {
                                            if (err) {
                                                console.error("Failed to stream .htpasswd:", err.message);
                                                conn.end();
                                                process.exit(1);
                                            }
                                            
                                            htpasswdStream.on("close", () => {
                                                console.log(".htpasswd uploaded successfully.");
                                                
                                                // Step 6: Adjust .htaccess paths
                                                console.log("Configuring htaccess rules...");
                                                conn.exec(`sed -i "s|/home/u586129197/domains/panthm.com/public_html/|/home/u586129197/${remoteDir}/|g" ~/${remoteDir}/.htaccess`, (err, configStream) => {
                                                    if (err) {
                                                        console.error("Failed to configure htaccess:", err.message);
                                                        conn.end();
                                                        process.exit(1);
                                                    }
                                                    
                                                    configStream.on("close", () => {
                                                        console.log("\nDEPLOYMENT SUCCESSFUL!");
                                                        console.log("Verify at: https://panthm.com/canvas/");
                                                        conn.end();
                                                    });
                                                    configStream.resume();
                                                });
                                            });
                                            
                                            await writeThrottled(htpasswdStream, htpasswdBase64);
                                            htpasswdStream.resume();
                                        });
                                    });
                                    
                                    await writeThrottled(htaccessStream, htaccessBase64);
                                    htaccessStream.resume();
                                });
                            });
                            
                            await writeThrottled(jsStream, jsBase64);
                            jsStream.resume();
                        });
                    });
                    
                    await writeThrottled(htmlStream, htmlBase64);
                    htmlStream.resume();
                });
            });
            stream.resume();
        });
    }).on("error", (err) => {
        console.error("SSH connection error:", err.message);
        process.exit(1);
    }).connect({
        host: SSH_HOST,
        port: SSH_PORT,
        username: SSH_USER,
        privateKey: fs.readFileSync(keyPath)
    });
}

main();
