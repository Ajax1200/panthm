const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";

const keyPath = path.join(__dirname, "temp_ssh_key");
const localHtmlPath = path.join(__dirname, "public", "canvas", "index.html");

async function main() {
    console.log("Reading local file...");
    const htmlContent = fs.readFileSync(localHtmlPath);

    console.log("Connecting to Hostinger via SSH...");
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("SSH Connection established.");
        
        console.log("Streaming index.html to HOME directory ~/temp_canvas_index.html...");
        conn.exec(`cat > ~/temp_canvas_index.html`, (err, stream) => {
            if (err) {
                console.error("Failed to stream:", err.message);
                conn.end();
                process.exit(1);
            }
            
            stream.on("close", () => {
                console.log("Uploaded temp file. Moving to public_html/canvas/index.html...");
                const remoteDir = "domains/panthm.com/public_html/canvas";
                
                conn.exec(`mkdir -p ~/${remoteDir} && mv ~/temp_canvas_index.html ~/${remoteDir}/index.html`, (err, moveStream) => {
                    if (err) {
                        console.error("Move failed:", err.message);
                        conn.end();
                        process.exit(1);
                    }
                    
                    moveStream.on("close", () => {
                        console.log("Move completed successfully!");
                        conn.end();
                    });
                    moveStream.resume();
                });
            });
            
            stream.write(htmlContent);
            stream.end();
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
