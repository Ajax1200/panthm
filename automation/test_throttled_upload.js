const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

const SSH_CONFIG = {
    host: "145.79.213.125",
    port: 65002,
    username: "u586129197",
    privateKey: fs.readFileSync(path.join(__dirname, "../temp_ssh_key"))
};

const localPath = path.join(__dirname, "../test_large.dat");
const remotePath = "test_large.dat";

async function run() {
    console.log("Creating 5MB test file...");
    const buffer = Buffer.alloc(5 * 1024 * 1024, 'A');
    fs.writeFileSync(localPath, buffer);
    
    console.log("Connecting to SSH...");
    const conn = new Client();
    
    conn.on("ready", () => {
        console.log("SSH Ready. Opening remote writer...");
        
        conn.exec(`cat > ~/${remotePath}`, (err, stream) => {
            if (err) {
                console.error("Exec failed:", err.message);
                conn.end();
                process.exit(1);
            }
            
            const fileStream = fs.createReadStream(localPath, { highWaterMark: 64 * 1024 });
            let bytesWritten = 0;
            const totalBytes = buffer.length;
            
            fileStream.on("data", (chunk) => {
                fileStream.pause();
                stream.write(chunk);
                bytesWritten += chunk.length;
                
                const percent = ((bytesWritten / totalBytes) * 100).toFixed(0);
                process.stdout.write(`Uploading: ${percent}% (${(bytesWritten / (1024*1024)).toFixed(1)} MB)\r`);
                
                setTimeout(() => {
                    fileStream.resume();
                }, 50);
            });
            
            fileStream.on("end", () => {
                console.log("\nAll data written. Closing SSH writer stream...");
                stream.end();
            });
            
            stream.on("close", () => {
                console.log("Remote SSH writer stream closed.");
                conn.exec(`ls -lh ~/${remotePath} && rm -f ~/${remotePath}`, (lsErr, lsStream) => {
                    lsStream.on("close", () => {
                        fs.unlinkSync(localPath);
                        conn.end();
                        console.log("Test completed successfully!");
                    })
                    .on("data", (data) => console.log("STDOUT: " + data));
                });
            });
        });
    }).on("error", (err) => {
        console.error("SSH error:", err.message);
        process.exit(1);
    }).connect(SSH_CONFIG);
}

run();
