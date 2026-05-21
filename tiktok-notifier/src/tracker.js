const db = require('./db');
const scraper = require('./scraper');
const { buildPostEmbed, buildStoryEmbed, buildLiveEmbed } = require('./embeds');

// How often to check each account (in milliseconds)
const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds per cycle

class Tracker {
  constructor(client) {
    this.client = client;
    this.running = false;
    this.userCache = {}; // username -> { id, avatar, nickname }
  }

  start() {
    if (this.running) return;
    this.running = true;
    console.log('🔄 Tracker started');
    this.loop();
  }

  stop() {
    this.running = false;
    console.log('⏹️ Tracker stopped');
  }

  async loop() {
    while (this.running) {
      try {
        await this.checkAll();
      } catch (err) {
        console.error('[tracker] Loop error:', err.message);
      }
      await sleep(CHECK_INTERVAL_MS);
    }
  }

  async checkAll() {
    const accounts = db.getAccounts();
    const usernames = Object.keys(accounts);
    if (usernames.length === 0) return;

    console.log(`[tracker] Checking ${usernames.length} account(s)...`);

    for (const username of usernames) {
      const account = db.getAccount(username);
      if (!account) continue;

      try {
        await this.checkAccount(account);
      } catch (err) {
        console.error(`[tracker] Error checking @${username}:`, err.message);
      }

      // Small delay between accounts to avoid rate limits
      await sleep(3000);
    }
  }

  async checkAccount(account) {
    const { username } = account;

    // Get user info (profile, live status)
    const userInfo = await scraper.getUserInfo(username);
    if (!userInfo) {
      console.warn(`[tracker] Could not fetch info for @${username}`);
      return;
    }

    // Cache user info for embeds
    this.userCache[username] = {
      id: userInfo.id,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
    };

    const channel = await this.getChannel(account.channelId);
    if (!channel) return;

    // ── LIVE CHECK ──────────────────────────────────────────────
    if (account.trackLive) {
      await this.checkLive(account, userInfo, channel);
    }

    // ── POST CHECK ──────────────────────────────────────────────
    if (account.trackPost) {
      await this.checkPosts(account, userInfo, channel);
    }

    // ── STORY CHECK ─────────────────────────────────────────────
    if (account.trackStory) {
      await this.checkStories(account, userInfo, channel);
    }
  }

  async checkLive(account, userInfo, channel) {
    const { username } = account;
    const wasLive = account.isLive;
    const isLive = !!userInfo.isLive;

    if (isLive && !wasLive) {
      // Just went live
      console.log(`🔴 @${username} went LIVE`);
      const liveInfo = await scraper.getLiveInfo(username, userInfo.roomId);
      const embed = buildLiveEmbed(username, userInfo.nickname, userInfo.avatar, liveInfo, false);
      await channel.send({ embeds: [embed] });
      db.updateAccount(username, { isLive: true });

    } else if (!isLive && wasLive) {
      // Live ended
      console.log(`⚫ @${username} ended live`);
      db.updateAccount(username, { isLive: false });
      // Optional: send "live ended" notification
      // const embed = buildLiveEmbed(username, userInfo.nickname, userInfo.avatar, null, true);
      // await channel.send({ embeds: [embed] });
    }
  }

  async checkPosts(account, userInfo, channel) {
    const { username } = account;
    const videos = await scraper.getLatestVideos(username, 5);
    if (!videos || videos.length === 0) return;

    const latest = videos[0];
    if (!latest) return;

    if (account.lastVideoId === null) {
      // First run — save current latest but don't notify
      db.updateAccount(username, { lastVideoId: latest.id });
      return;
    }

    if (latest.id !== account.lastVideoId) {
      // New video(s) posted — find all new ones
      const newVideos = [];
      for (const video of videos) {
        if (video.id === account.lastVideoId) break;
        newVideos.push(video);
      }

      // Send newest first (up to 3 to avoid spam)
      for (const video of newVideos.slice(0, 3).reverse()) {
        console.log(`📹 @${username} posted video ${video.id}`);
        const embed = buildPostEmbed(username, userInfo.nickname, userInfo.avatar, video);
        await channel.send({ embeds: [embed] });
        await sleep(1000);
      }

      db.updateAccount(username, { lastVideoId: videos[0].id });
    }
  }

  async checkStories(account, userInfo, channel) {
    const { username } = account;
    const stories = await scraper.getStories(username, userInfo.id);
    if (!stories || stories.length === 0) return;

    const latest = stories[0];
    if (!latest) return;

    if (account.lastStoryId === null) {
      // First run — save current latest but don't notify
      db.updateAccount(username, { lastStoryId: latest.id });
      return;
    }

    if (latest.id !== account.lastStoryId) {
      const newStories = [];
      for (const story of stories) {
        if (story.id === account.lastStoryId) break;
        newStories.push(story);
      }

      for (const story of newStories.slice(0, 3).reverse()) {
        console.log(`📖 @${username} posted story ${story.id}`);
        const embed = buildStoryEmbed(username, userInfo.nickname, userInfo.avatar, story);
        await channel.send({ embeds: [embed] });
        await sleep(1000);
      }

      db.updateAccount(username, { lastStoryId: stories[0].id });
    }
  }

  async getChannel(channelId) {
    try {
      return await this.client.channels.fetch(channelId);
    } catch {
      console.warn(`[tracker] Could not fetch channel ${channelId}`);
      return null;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Tracker;
