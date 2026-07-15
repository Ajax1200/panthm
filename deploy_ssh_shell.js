const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const SSH_HOST = "145.79.213.125";
const SSH_PORT = 65002;
const SSH_USER = "u586129197";
const keyPath = path.join(__dirname, "temp_ssh_key");

const filesToDeploy = [
    { local: "public/canvas/index.html", remote: "domains/panthm.com/public_html/canvas/index.html" },
    { local: "public/canvas/canvas.js", remote: "domains/panthm.com/public_html/canvas/canvas.js" },
    { local: "public/canvas/.htaccess", remote: "domains/panthm.com/public_html/canvas/.htaccess" },
    { local: "public/canvas/.htpasswd", remote: "domains/panthm.com/public_html/canvas/.htpasswd" }
];

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Executes commands sequentially inside a single dedicated SSH connection with pacing delays
function deploySingleFile(file) {
    return new Promise((resolve, reject) => {
        const localPath = path.join(__dirname, file.local);
        if (!fs.existsSync(localPath)) {
            return reject(new Error(`Local file not found: ${file.local}`));
        }

        console.log(`\nDeploying ${file.local} to ${file.remote}...`);
        const base64Content = fs.readFileSync(localPath).toString("base64");

        const ssh = spawn("ssh", [
            "-p", SSH_PORT.toString(),
            "-i", keyPath,
            "-o", "StrictHostKeyChecking=no",
            "-o", "IdentitiesOnly=yes",
            `${SSH_USER}@${SSH_HOST}`,
            "bash"
        ]);

        let hasError = false;
        ssh.stderr.on("data", (data) => {
            const errStr = data.toString().trim();
            console.error("[SSH-Error]: " + errStr);
            if (errStr.includes("closed by remote host") || errStr.includes("Broken pipe")) {
                hasError = true;
            }
        });

        ssh.on("close", (code) => {
            if (code === 0 && !hasError) {
                console.log(`Successfully deployed ${file.local}`);
                resolve();
            } else {
                reject(new Error(`SSH exited with code ${code} (hasError: ${hasError})`));
            }
        });

        // Write content in 4KB chunks with async pacing
        const chunkSize = 4096;
        const tempFile = `~/temp_${path.basename(file.local)}.b64`;

        async function run() {
            try {
                ssh.stdin.write(`mkdir -p ~/domains/panthm.com/public_html/canvas\n`);
                ssh.stdin.write(`rm -f ${tempFile}\n`);
                await delay(300);

                for (let i = 0; i < base64Content.length; i += chunkSize) {
                    const chunk = base64Content.slice(i, i + chunkSize);
                    ssh.stdin.write(`echo -n '${chunk}' >> ${tempFile}\n`);
                    await delay(150); // 150ms delay between writes to prevent buffer overflow
                }

                ssh.stdin.write(`base64 -d ${tempFile} > ~/${file.remote}\n`);
                ssh.stdin.write(`rm -f ${tempFile}\n`);
                ssh.stdin.write(`exit\n`);
                ssh.stdin.end();
            } catch (err) {
                reject(err);
            }
        }
        
        run();
    });
}

async function main() {
    console.log("Starting paced multi-session SSH deployment...");
    
    try {
        for (const file of filesToDeploy) {
            let attempts = 3;
            while (attempts > 0) {
                try {
                    await deploySingleFile(file);
                    break;
                } catch (err) {
                    console.warn(`Deployment of ${file.local} failed: ${err.message}. Retrying...`);
                    attempts--;
                    if (attempts === 0) throw err;
                    await delay(5000); // 5s cooling delay before retry
                }
            }
            await delay(3000); // 3s pacing delay between files
        }

        // Configure htaccess paths in a final separate connection
        console.log("\nConfiguring htaccess paths...");
        const ssh = spawn("ssh", [
            "-p", SSH_PORT.toString(),
            "-i", keyPath,
            "-o", "StrictHostKeyChecking=no",
            "-o", "IdentitiesOnly=yes",
            `${SSH_USER}@${SSH_HOST}`,
            "sed -i 's|/home/u586129197/domains/panthm.com/public_html/|/home/u586129197/domains/panthm.com/public_html/canvas/|g' ~/domains/panthm.com/public_html/canvas/.htaccess"
        ]);
        ssh.on("close", (code) => {
            console.log("\nDEPLOYMENT COMPLETED SUCCESSFULLY!");
            console.log("Verify at: https://panthm.com/canvas/");
        });

    } catch (globalErr) {
        console.error("Global deployment failed:", globalErr.message);
        process.exit(1);
    }
}

main();
