const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const { buildInfoEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Change the notification channel for a tracked account')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('TikTok username (without @)')
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('New channel for notifications')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const username = interaction.options.getString('username').replace('@', '').toLowerCase().trim();
    const channel = interaction.options.getChannel('channel');

    const account = db.getAccount(username);
    if (!account || account.guildId !== interaction.guildId) {
      return interaction.editReply({ content: `❌ **@${username}** is not being tracked in this server.` });
    }

    db.setChannel(username, channel.id);

    const embed = buildInfoEmbed(
      '✅ Channel Updated',
      `Notifications for **@${username}** will now be sent to <#${channel.id}>.`
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
