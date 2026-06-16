import { Client } from "ssh2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";
const keyPath = path.join(__dirname, "temp_ssh_key");
const targetDir = "domains/rosybrown-peafowl-184610.hostingersite.com/public_html";

async function main() {
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("Connected to Hostinger via SSH. Reading remote .htaccess...");
        
        conn.exec(`cat ~/${targetDir}/.htaccess`, (err, stream) => {
            if (err) {
                console.error("Exec failed:", err);
                conn.end();
                return;
            }
            
            let output = "";
            stream.on("close", () => {
                console.log("\n--- REMOTE .HTACCESS CONTENT ---");
                console.log(output);
                console.log("--------------------------------");
                conn.end();
            }).on("data", (data) => {
                output += data.toString();
            }).stderr.on("data", (data) => {
                console.error("[Stderr]:", data.toString());
            });
        });
    }).on("error", (err) => {
        console.error("SSH connection error:", err);
    }).connect({
        host: SSH_HOST,
        port: SSH_PORT,
        username: SSH_USER,
        privateKey: fs.readFileSync(keyPath)
    });
}

main();
