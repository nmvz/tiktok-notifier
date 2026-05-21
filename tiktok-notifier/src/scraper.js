const https = require('https');

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

const RAPID_HEADERS = {
  'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com',
  'x-rapidapi-key': process.env.RAPIDAPI_KEY,
};

async function getUserInfo(username) {
  try {
    const url = `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${encodeURIComponent(username)}`;
    console.log(`[scraper] Fetching: ${url}`);
    console.log(`[scraper] API Key present: ${!!process.env.RAPIDAPI_KEY}`);
    const res = await get(url, RAPID_HEADERS);
    console.log(`[scraper] Status: ${res.status}`);
    console.log(`[scraper] Raw response: ${res.raw?.slice(0, 500)}`);
    if (res.status !== 200 || !res.body) return null;
    const user = res.body?.userInfo?.user;
    const stats = res.body?.userInfo?.stat
