const ftp = require("basic-ftp");

async function testFTP(host, user, password) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log(`\nTesting FTP connection to ${host} with user ${user} and password length ${password.length}...`);
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false
        });
        console.log(`SUCCESS: Connected to ${host} using user ${user}`);
        const list = await client.list();
        console.log("Remote directory contents:", list.map(f => f.name));
        client.close();
        return true;
    } catch (err) {
        console.error(`FAILED: Connection to ${host} with user ${user} failed. Error:`, err.message);
        client.close();
        return false;
    }
}

async function run() {
    const host = "145.79.213.125";
    const user = "u586129197";
    
    // Try password from latest message
    let success = await testFTP(host, user, "Panthm@0050");
    if (!success) {
        // Try password from previous deploy script
        success = await testFTP(host, user, "Panthm@0010");
    }
    
    if (success) {
        console.log("\nFTP Connection Successful!");
    } else {
        console.log("\nFTP Connection Failed.");
    }
}

run();
