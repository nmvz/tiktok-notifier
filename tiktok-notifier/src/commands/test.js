const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const scraper = require('../scraper');
const { buildPostEmbed, buildStoryEmbed, buildLiveEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Send a test notification for a tracked account')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('TikTok username (without @)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of notification to test')
        .setRequired(true)
        .addChoices(
          { name: '📹 Post', value: 'post' },
          { name: '🔴 Live', value: 'live' },
          { name: '📖 Story', value: 'story' },
        )),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const username = interaction.options.getString('username').replace('@', '').toLowerCase().trim();
    const type = interaction.options.getString('type');

    const account = db.getAccount(username);
    if (!account || account.guildId !== interaction.guildId) {
      return interaction.editReply({ content: `❌ **@${username}** is not being tracked in this server.` });
    }

    const userInfo = await scraper.getUserInfo(username);
    if (!userInfo) {
      return interaction.editReply({ content: `❌ Could not fetch info for @${username}.` });
    }

    const channel = await interaction.client.channels.fetch(account.channelId).catch(() => null);
    if (!channel) {
      return interaction.editReply({ content: `❌ Cannot access the notification channel. Check bot permissions.` });
    }

    let embed;

    if (type === 'post') {
      const videos = await scraper.getLatestVideos(username, 1);
      const fakeVideo = videos[0] || {
        id: 'test',
        description: '🧪 This is a test post notification! #test',
        createTime: Math.floor(Date.now() / 1000),
        thumbnailUrl: null,
        shareUrl: `https://www.tiktok.com/@${username}`,
      };
      embed = buildPostEmbed(username, userInfo.nickname, userInfo.avatar, fakeVideo);

    } else if (type === 'live') {
      embed = buildLiveEmbed(username, userInfo.nickname, userInfo.avatar, {
        title: '🧪 Test live notification',
        viewerCount: 1234,
        shareUrl: `https://www.tiktok.com/@${username}/live`,
      }, false);

    } else if (type === 'story') {
      embed = buildStoryEmbed(username, userInfo.nickname, userInfo.avatar, {
        id: 'test',
        description: '🧪 Test story',
        createTime: Math.floor(Date.now() / 1000),
        thumbnailUrl: null,
        isVideo: true,
        shareUrl: `https://www.tiktok.com/@${username}`,
      });
    }

    await channel.send({ content: '🧪 **Test notification**', embeds: [embed] });
    await interaction.editReply({ content: `✅ Test **${type}** notification sent to <#${account.channelId}>!` });
  },
};
