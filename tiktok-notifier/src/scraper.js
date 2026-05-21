const https = require('https');

// Headers that mimic a real browser/app to avoid blocks
const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.tiktok.com/',
  'Origin': 'https://www.tiktok.com',
};

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { ...BASE_HEADERS, ...headers } }, res => {
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

async function getUserInfo(username) {
  try {
    const url = `https://www.tiktok.com/api/user/detail/?uniqueId=${username}&aid=1988&app_language=en&device_platform=web_pc`;
    const res = await get(url);
    if (res.status !== 200 || !res.body) return null;
    const user = res.body?.userInfo?.user;
    const stats = res.body?.userInfo?.stats;
    if (!user) return null;
    return {
      id: user.id,
      username: user.uniqueId,
      nickname: user.nickname,
      avatar: user.avatarThumb || user.avatarMedium,
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
    const url = `https://www.tiktok.com/api/post/item_list/?uniqueId=${username}&count=${count}&cursor=0&aid=1988&app_language=en&device_platform=web_pc`;
    const res = await get(url);
    if (res.status !== 200 || !res.body) return [];
    const items = res.body?.itemList || [];
    return items.map(item => ({
      id: item.id,
      description: item.desc || '',
      createTime: item.createTime,
      thumbnailUrl: item.video?.cover || item.video?.dynamicCover,
      playUrl: item.video?.playAddr,
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
  try {
    if (!userId) return [];
    const url = `https://www.tiktok.com/api/story/item_list/?secUid=${userId}&count=10&cursor=0&aid=1988&app_language=en`;
    const res = await get(url);
    if (res.status !== 200 || !res.body) return [];
    const items = res.body?.itemList || [];
    return items.map(item => ({
      id: item.id,
      description: item.desc || '',
      createTime: item.createTime,
      thumbnailUrl: item.video?.cover || item.imagePost?.images?.[0]?.imageURL?.urlList?.[0],
      isVideo: !!item.video?.playAddr,
      isImage: !!item.imagePost,
      shareUrl: `https://www.tiktok.com/@${username}`,
      isStory: true,
    }));
  } catch (err) {
    console.error(`[scraper] getStories error for ${username}:`, err.message);
    return [];
  }
}

async function getLiveInfo(username, roomId) {
  try {
    if (!roomId || roomId === '0') return null;
    const url = `https://webcast.tiktok.com/webcast/room/info/?room_id=${roomId}&aid=1988`;
    const res = await get(url);
    if (res.status !== 200 || !res.body) return null;
    const room = res.body?.data;
    if (!room) return null;
    return {
      roomId,
      title: room.title || `${username} is live!`,
      viewerCount: room.user_count || 0,
      startTime: room.create_time,
      shareUrl: `https://www.tiktok.com/@${username}/live`,
    };
  } catch (err) {
    console.error(`[scraper] getLiveInfo error for ${username}:`, err.message);
    return null;
  }
}

module.exports = { getUserInfo, getLatestVideos, getStories, getLiveInfo };
