const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(__dirname, "temp_ssh_key");
const conn = new Client();

conn.on("ready", () => {
    console.log("Connected to server via SSH.");
    
    const cmd = `
        echo "=== Finding autopilot.js ==="
        find ~ -name "autopilot.js" 2>/dev/null
        echo ""
        echo "=== Finding any folder named automation ==="
        find ~ -type d -name "automation" 2>/dev/null
        echo ""
        echo "=== Listing ~/domains/panthm.com/ ==="
        ls -la ~/domains/panthm.com/
    `;
    
    conn.exec(cmd, (err, stream) => {
        if (err) {
            console.error("Command execution error:", err.message);
            conn.end();
            return;
        }
        
        stream.on("close", () => {
            conn.end();
        })
        .on("data", (data) => {
            process.stdout.write(data.toString());
        })
        .stderr.on("data", (data) => {
            process.stderr.write("STDERR: " + data.toString());
        });
    });
}).on("error", (err) => {
    console.error("SSH connection error:", err.message);
}).connect({
    host: "145.79.213.125",
    port: 65002,
    username: "u586129197",
    privateKey: fs.readFileSync(keyPath)
});
