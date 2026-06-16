const { Client } = require("ssh2");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(__dirname, "../temp_ssh_key");
const pubKeyPath = keyPath + ".pub";

// Configuration
const SSH_CONFIG = {
    host: "145.79.213.125",
    port: 65002,
    username: "u586129197",
    password: "Panthm@0010"
};

async function run() {
    console.log("Generating temporary SSH key pair locally...");
    try {
        if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
        if (fs.existsSync(pubKeyPath)) fs.unlinkSync(pubKeyPath);
        
        execSync(`ssh-keygen -t rsa -b 2048 -f "${keyPath}" -N "" -q`);
        console.log("SSH Key pair generated.");
    } catch (err) {
        console.error("Failed to generate SSH keys:", err.message);
        process.exit(1);
    }
    
    const pubKey = fs.readFileSync(pubKeyPath, "utf8").trim();
    
    console.log("Connecting to Hostinger to authorize public key...");
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("Connected. Authorizing key on server...");
        
        // Command to append key to authorized_keys and set correct permissions
        const cmd = `mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "${pubKey}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`;
        
        conn.exec(cmd, (err, stream) => {
            if (err) {
                console.error("Failed to run remote authorization command:", err.message);
                conn.end();
                process.exit(1);
            }
            
            stream.on("close", () => {
                console.log("Public key successfully authorized on the server!");
                conn.end();
                process.exit(0);
            })
            .on("data", (data) => console.log("STDOUT: " + data))
            .stderr.on("data", (data) => console.error("STDERR: " + data));
        });
    }).on("error", (err) => {
        console.error("SSH connection failed:", err.message);
        process.exit(1);
    }).connect(SSH_CONFIG);
}

run();
