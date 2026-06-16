const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(__dirname, "../temp_ssh_key");

const conn = new Client();

conn.on("ready", () => {
    console.log("Connected to server via SSH key.");
    conn.exec("ls -la domains/rosybrown-peafowl-184610.hostingersite.com/public_html", (err, stream) => {
        if (err) {
            console.error("Command error:", err.message);
            conn.end();
            return;
        }
        
        stream.on("close", () => {
            conn.end();
        })
        .on("data", (data) => {
            console.log(data.toString());
        })
        .stderr.on("data", (data) => {
            console.error("STDERR: " + data.toString());
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
