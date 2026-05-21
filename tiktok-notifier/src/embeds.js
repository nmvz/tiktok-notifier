const { EmbedBuilder } = require('discord.js');

// TikTok brand color
const TIKTOK_COLOR = 0xFE2C55;
const LIVE_COLOR = 0xFF0000;
const STORY_COLOR = 0x25F4EE;
const POST_COLOR = 0xFE2C55;

function formatTimestamp(unixTime) {
  const date = new Date((unixTime || Date.now() / 1000) * 1000);
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

/**
 * Build a "New Post" embed
 * Matches: thumbnail image, blue clickable title (caption), "TikTok • timestamp" footer
 */
function buildPostEmbed(username, nickname, avatarUrl, video) {
  const title = video.description
    ? video.description.slice(0, 256)
    : `${nickname || username} posted a new video!`;

  const embed = new EmbedBuilder()
    .setColor(POST_COLOR)
    .setAuthor({
      name: `${nickname || username} (@${username})`,
      iconURL: avatarUrl || undefined,
      url: `https://www.tiktok.com/@${username}`,
    })
    .setTitle(title)
    .setURL(video.shareUrl)
    .setFooter({
      text: `TikTok • ${new Date(video.createTime * 1000).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`,
      iconURL: 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
    })
    .setTimestamp();

  if (video.thumbnailUrl) {
    embed.setImage(video.thumbnailUrl);
  }

  return embed;
}

/**
 * Build a "New Story" embed
 * Matches: thumbnail/preview image, "TikTok Story • timestamp" footer, username as title
 */
function buildStoryEmbed(username, nickname, avatarUrl, story) {
  const isVideo = story.isVideo;
  const typeLabel = isVideo ? '📹 posted a video to their story' : '🖼️ posted a photo to their story';

  const embed = new EmbedBuilder()
    .setColor(STORY_COLOR)
    .setAuthor({
      name: `${nickname || username} (@${username})`,
      iconURL: avatarUrl || undefined,
      url: `https://www.tiktok.com/@${username}`,
    })
    .setTitle(`${nickname || username} ${isVideo ? '🎬' : '📸'}`)
    .setDescription(typeLabel)
    .setURL(`https://www.tiktok.com/@${username}`)
    .setFooter({
      text: `TikTok Story • ${new Date(story.createTime * 1000).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`,
      iconURL: 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
    })
    .setTimestamp();

  if (story.thumbnailUrl) {
    embed.setImage(story.thumbnailUrl);
  }

  return embed;
}

/**
 * Build a "Went Live" embed
 * Matches: "[username] was live on TikTok!" as clickable blue title, pfp as thumbnail, duration, "TikTok Live • timestamp" footer
 */
function buildLiveEmbed(username, nickname, avatarUrl, liveInfo, ended = false) {
  const title = ended
    ? `${nickname || username} was live on TikTok!`
    : `${nickname || username} is LIVE on TikTok! 🔴`;

  const embed = new EmbedBuilder()
    .setColor(LIVE_COLOR)
    .setAuthor({
      name: `${nickname || username} (@${username})`,
      iconURL: avatarUrl || undefined,
      url: `https://www.tiktok.com/@${username}`,
    })
    .setTitle(title)
    .setURL(`https://www.tiktok.com/@${username}/live`)
    .setFooter({
      text: `TikTok Live • ${new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`,
      iconURL: 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
    })
    .setTimestamp();

  if (liveInfo?.title && !ended) {
    embed.setDescription(liveInfo.title);
  }

  if (liveInfo?.viewerCount && !ended) {
    embed.addFields({ name: '👥 Viewers', value: liveInfo.viewerCount.toLocaleString(), inline: true });
  }

  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }

  return embed;
}

/**
 * Build a simple info embed (for /list, /status etc)
 */
function buildInfoEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor(TIKTOK_COLOR)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  for (const f of fields) {
    embed.addFields(f);
  }

  return embed;
}

module.exports = { buildPostEmbed, buildStoryEmbed, buildLiveEmbed, buildInfoEmbed };
