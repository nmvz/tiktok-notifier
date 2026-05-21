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
    const res = await get(url, RAPID_HEADERS);
    if (res.status !== 200 || !res.body) return null;
    const user = res.body?.userInfo?.user;
    const stats = res.body?.userInfo?.stats;
    if (!user) return null;
    return {
      id: user.id,
      username: user.uniqueId,
      nickname: user.nickname,
      avatar: user.avatarThumb,
      isLive: user.roomId && user.roomId !== '0',
      roomId: user.roomId,
      followers: stats?.followerCount,
      verified: user.verified,
    };
  } catch (err) {
    console.error(`[scraper] getUserInfo error for ${username}:`, err.message);
    return null;
  }
}

async function getLatestVideos(username, count = 5) {
  try {
    const url = `https://tiktok-api23.p.rapidapi.com/api/post/item_list?uniqueId=${encodeURIComponent(username)}&count=${count}&cursor=0`;
    const res = await get(url, RAPID_HEADERS);
    if (res.status !== 200 || !res.body) return [];
    const items = res.body?.itemList || [];
    return items.map(item => ({
      id: item.id,
      description: item.desc || '',
      createTime: item.createTime,
      thumbnailUrl: item.video?.cover,
      shareUrl: `https://www.tiktok.com/@${username}/video/${item.id}`,
      duration: item.video?.duration,
      isStory: false,
    }));
  } catch (err) {
    console.error(`[scraper] getLatestVideos error for ${username}:`, err.message);
    return [];
  }
}

async function getStories(username, userId) {
  return [];
}

async function getLiveInfo(username, roomId) {
  return null;
}

module.exports = { getUserInfo, getLatestVideos, getStories, getLiveInfo };
