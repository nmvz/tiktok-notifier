const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const { buildInfoEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Stop tracking a TikTok account')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('TikTok username to remove (without @)')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const username = interaction.options.getString('username').replace('@', '').toLowerCase().trim();

    const account = db.getAccount(username);
    if (!account || account.guildId !== interaction.guildId) {
      return interaction.editReply({ content: `❌ **@${username}** is not being tracked in this server.` });
    }

    db.removeAccount(username);

    const embed = buildInfoEmbed(
      '🗑️ Account Removed',
      `Stopped tracking **@${username}**. No more notifications will be sent.`
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
