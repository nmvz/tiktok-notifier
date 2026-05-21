const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const { buildInfoEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List all tracked TikTok accounts')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const accounts = db.listAccounts(interaction.guildId);

    if (accounts.length === 0) {
      return interaction.editReply({ content: '📭 No TikTok accounts are being tracked yet. Use `/add` to start.' });
    }

    const lines = accounts.map((a, i) => {
      const types = [];
      if (a.trackPost) types.push('📹');
      if (a.trackLive) types.push('🔴');
      if (a.trackStory) types.push('📖');
      const liveTag = a.isLive ? ' **[LIVE]**' : '';
      return `${i + 1}. [@${a.username}](https://www.tiktok.com/@${a.username})${liveTag} → <#${a.channelId}> ${types.join('')}`;
    });

    const embed = buildInfoEmbed(
      `📋 Tracked Accounts (${accounts.length}/20)`,
      lines.join('\n'),
      [{ name: 'Legend', value: '📹 Posts  🔴 Lives  📖 Stories', inline: false }]
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
