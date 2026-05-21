const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const { buildInfoEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Enable or disable specific notification types for an account')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('TikTok username (without @)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('What to toggle')
        .setRequired(true)
        .addChoices(
          { name: '📹 Posts', value: 'post' },
          { name: '🔴 Lives', value: 'live' },
          { name: '📖 Stories', value: 'story' },
        )),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const username = interaction.options.getString('username').replace('@', '').toLowerCase().trim();
    const type = interaction.options.getString('type');

    const account = db.getAccount(username);
    if (!account || account.guildId !== interaction.guildId) {
      return interaction.editReply({ content: `❌ **@${username}** is not being tracked in this server.` });
    }

    const fieldMap = { post: 'trackPost', live: 'trackLive', story: 'trackStory' };
    const labelMap = { post: '📹 Posts', live: '🔴 Lives', story: '📖 Stories' };
    const field = fieldMap[type];
    const newValue = !account[field];

    db.updateAccount(username, { [field]: newValue });

    const embed = buildInfoEmbed(
      `${newValue ? '✅ Enabled' : '⏸️ Disabled'} — ${labelMap[type]}`,
      `**${labelMap[type]}** notifications for **@${username}** are now **${newValue ? 'ON' : 'OFF'}**.`
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
