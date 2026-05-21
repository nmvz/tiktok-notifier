const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const scraper = require('../scraper');
const { buildInfoEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Track a TikTok account')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('TikTok username (without @)')
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Discord channel to send notifications to')
        .setRequired(true))
    .addBooleanOption(opt =>
      opt.setName('posts')
        .setDescription('Track new posts? (default: yes)')
        .setRequired(false))
    .addBooleanOption(opt =>
      opt.setName('lives')
        .setDescription('Track live streams? (default: yes)')
        .setRequired(false))
    .addBooleanOption(opt =>
      opt.setName('stories')
        .setDescription('Track stories? (default: yes)')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const username = interaction.options.getString('username').replace('@', '').toLowerCase().trim();
    const channel = interaction.options.getChannel('channel');
    const trackPost = interaction.options.getBoolean('posts') ?? true;
    const trackLive = interaction.options.getBoolean('lives') ?? true;
    const trackStory = interaction.options.getBoolean('stories') ?? true;

    const existing = db.listAccounts(interaction.guildId);
    if (existing.length >= 20) {
      return interaction.editReply({ content: '❌ You can track a maximum of 20 accounts.' });
    }

    const alreadyTracked = db.getAccount(username);
    if (alreadyTracked && alreadyTracked.guildId === interaction.guildId) {
      return interaction.editReply({ content: `❌ **@${username}** is already being tracked.` });
    }

    await interaction.editReply({ content: `⏳ Verifying @${username} on TikTok...` });
    const userInfo = await scraper.getUserInfo(username);
    if (!userInfo) {
      return interaction.editReply({ content: `❌ Could not find TikTok account **@${username}**. Make sure the username is correct.` });
    }

    db.addAccount(username, channel.id, interaction.guildId, { trackLive, trackStory, trackPost });

    const tracking = [];
    if (trackPost) tracking.push('📹 Posts');
    if (trackLive) tracking.push('🔴 Lives');
    if (trackStory) tracking.push('📖 Stories');

    const embed = buildInfoEmbed(
      '✅ Account Added',
      `Now tracking **[${userInfo.nickname || username}](https://www.tiktok.com/@${username})** (@${username})`,
      [
        { name: '📢 Channel', value: `<#${channel.id}>`, inline: true },
        { name: '📊 Tracking', value: tracking.join(', '), inline: true },
        { name: '👥 Followers', value: userInfo.followers?.toLocaleString() ?? 'N/A', inline: true },
      ]
    );

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};
