require('dotenv').config();
const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log("Connecting to Hostinger FTP...");
        await client.access({
            host: process.env.FTP_HOST || "panthm.com",
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log("Connected successfully!");
        
        // Hostinger's default public folder
        const remoteDir = "public_html";
        
        console.log(`Navigating to ${remoteDir}...`);
        await client.ensureDir(remoteDir);
        await client.clearWorkingDir();
        
        console.log("Uploading build folder...");
        await client.uploadFromDir(path.join(__dirname, "build"));
        
        console.log("Deployment completed successfully! Your site is live on Hostinger.");
    }
    catch(err) {
        console.error("Deployment Failed:", err);
    }
    client.close();
}

deploy();
