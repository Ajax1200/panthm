const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";
const keyPath = path.join(__dirname, "temp_ssh_key");

const chunks = fs.readdirSync(__dirname)
    .filter(file => file.startsWith("build_chunk_"))
    .sort();

console.log(`Found ${chunks.length} build chunks to upload.`);

function cleanLocalChunks() {
    chunks.forEach(chunk => {
        const p = path.join(__dirname, chunk);
        if (fs.existsSync(p)) {
            fs.unlinkSync(p);
        }
    });
    console.log("Cleaned up local chunks.");
}

async function main() {
    if (chunks.length === 0) {
        console.error("No build chunks found!");
        process.exit(1);
    }

    console.log("Connecting to Hostinger SSH...");
    const conn = new Client();
    const keepAlive = setInterval(() => {}, 1000);

    conn.on("ready", () => {
        console.log("SSH Connection established.");
        
        conn.sftp(async (sftpErr, sftp) => {
            if (sftpErr) {
                console.error("SFTP failed:", sftpErr.message);
                clearInterval(keepAlive);
                conn.end();
                process.exit(1);
            }

            console.log(`Starting sequential upload of ${chunks.length} chunks...`);
            for (let i = 0; i < chunks.length; i++) {
                const chunkName = chunks[i];
                const localPath = path.join(__dirname, chunkName);
                console.log(`Uploading ${chunkName} (${i + 1}/${chunks.length})...`);
                
                await new Promise((resolve, reject) => {
                    sftp.fastPut(localPath, chunkName, { concurrency: 1 }, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                await new Promise(r => setTimeout(r, 200));
            }

            console.log("All chunks uploaded successfully. Concatenating and deploying remotely...");
            const remoteCmd = [
                `cat ${chunks.join(" ")} > build.zip`,
                "rm -f build_chunk_*",
                "mkdir -p ~/domains/panthm.com/public_html",
                "rm -f ~/domains/panthm.com/public_html/client.js ~/domains/panthm.com/public_html/style.css ~/domains/panthm.com/public_html/sw.js",
                "unzip -o ~/build.zip -d ~/domains/panthm.com/public_html/",
                "rm -f ~/build.zip"
            ].join(" && ");

            conn.exec(remoteCmd, (execErr, stream) => {
                if (execErr) {
                    console.error("Remote exec failed:", execErr.message);
                    clearInterval(keepAlive);
                    conn.end();
                    process.exit(1);
                }

                stream.on("close", () => {
                    console.log("\n✅ PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!");
                    cleanLocalChunks();
                    clearInterval(keepAlive);
                    conn.end();
                    process.exit(0);
                })
                .on("data", (data) => {
                    console.log("[Remote]: " + data);
                })
                .stderr.on("data", (data) => {
                    console.error("[Remote Error]: " + data);
                });
            });
        });
    }).on("error", (err) => {
        console.error("SSH connection error:", err.message);
        clearInterval(keepAlive);
        process.exit(1);
    }).connect({
        host: SSH_HOST,
        port: SSH_PORT,
        username: SSH_USER,
        privateKey: fs.readFileSync(keyPath),
        readyTimeout: 60000,
        keepaliveInterval: 10000
    });
}

main();
