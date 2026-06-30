import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_FILE = path.join(__dirname, 'service_account.json');

// Base64URL encoding helper
function base64url(str, encoding = 'utf8') {
  return Buffer.from(str, encoding)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Generate Google JWT Assertion Token using native crypto (no dependencies)
function generateJWT(clientEmail, privateKey) {
  const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // Token expires in 1 hour
  
  const payload = JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: exp,
    iat: iat
  });
  
  const unsignedToken = `${base64url(header)}.${base64url(payload)}`;
  
  const signer = crypto.createSign('RSA-SHA256');
  signer.write(unsignedToken);
  signer.end();
  
  const signature = signer.sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${unsignedToken}.${signature}`;
}

// Get OAuth2 Access Token from Google
async function getAccessToken(clientEmail, privateKey) {
  const jwt = generateJWT(clientEmail, privateKey);
  
  const res = await axios.post('https://oauth2.googleapis.com/token', 
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  
  return res.data.access_token;
}

// Submit URL to Google Indexing API
export async function submitToGoogleIndexing(targetUrl, actionType = 'URL_UPDATED') {
  console.log(`[Google Indexing] Preparing submission for: ${targetUrl}`);
  
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log('[Google Indexing] ⚠️ service_account.json key missing — skipping Google Indexing API submission.');
    console.log('[Google Indexing] ℹ️ Download service account JSON from Google Cloud Console and place it as: automation/service_account.json');
    return false;
  }
  
  try {
    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
    const accessToken = await getAccessToken(creds.client_email, creds.private_key);
    
    const res = await axios.post('https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        url: targetUrl,
        type: actionType
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (res.status === 200 || res.data) {
      console.log(`[Google Indexing] ✅ Successfully submitted URL indexing request. Notification ID: ${res.data.urlNotificationMetadata?.latestUpdate?.notifyTime || 'N/A'}`);
      return true;
    }
  } catch (err) {
    const errDetail = err.response?.data?.error?.message || err.message;
    console.error(`[Google Indexing] ❌ Submission failed: ${errDetail}`);
  }
  return false;
}
