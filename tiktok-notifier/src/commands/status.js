const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const scraper = require('../scraper');
const { buildInfoEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the current status of a tracked TikTok account')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('TikTok username (without @)')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const username = interaction.options.getString('username').replace('@', '').toLowerCase().trim();

    const account = db.getAccount(username);
    if (!account || account.guildId !== interaction.guildId) {
      return interaction.editReply({ content: `❌ **@${username}** is not being tracked in this server.` });
    }

    await interaction.editReply({ content: `⏳ Fetching live status for @${username}...` });

    const userInfo = await scraper.getUserInfo(username);

    const fields = [
      { name: '📢 Channel', value: `<#${account.channelId}>`, inline: true },
      { name: '🔴 Live Now', value: userInfo?.isLive ? '✅ Yes' : '❌ No', inline: true },
      { name: '👥 Followers', value: userInfo?.followers?.toLocaleString() ?? 'N/A', inline: true },
      { name: '📹 Track Posts', value: account.trackPost ? '✅' : '❌', inline: true },
      { name: '🔴 Track Lives', value: account.trackLive ? '✅' : '❌', inline: true },
      { name: '📖 Track Stories', value: account.trackStory ? '✅' : '❌', inline: true },
      { name: '📅 Added', value: new Date(account.addedAt).toLocaleDateString('en-US'), inline: true },
    ];

    const embed = buildInfoEmbed(
      `📊 Status — @${username}`,
      `**[${userInfo?.nickname || username}](https://www.tiktok.com/@${username})**${userInfo?.verified ? ' ✓' : ''}`,
      fields
    );

    if (userInfo?.avatar) embed.setThumbnail(userInfo.avatar);

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};
