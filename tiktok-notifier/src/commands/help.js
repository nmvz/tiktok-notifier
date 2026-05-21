const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all TikTok Notifier commands and how to use them'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xfe2c55)
      .setTitle('🎵 TikTok Notifier — Help')
      .setDescription('Track TikTok accounts and get notified for lives, posts, and stories!')
      .addFields(
        {
          name: '⚙️ Setup',
          value: [
            '`/setchannel #channel` — Set where notifications are sent *(Admin only)*',
          ].join('\n'),
        },
        {
          name: '📋 Managing Accounts',
          value: [
            '`/add <username>` — Start tracking a TikTok account *(Admin only)*',
            '`/remove <username>` — Stop tracking an account *(Admin only)*',
            '`/list` — See all tracked accounts',
          ].join('\n'),
        },
        {
          name: '🔍 Checking & Testing',
          value: [
            '`/status` — Check live status of all tracked accounts',
            '`/test <username> <type>` — Send a test notification *(Admin only)*',
          ].join('\n'),
        },
        {
          name: '📬 Notification Types',
          value: [
            '🔴 **Live** — Sent when someone goes live (and when they end)',
            '📹 **Posts** — Sent when a new video is posted',
            '📖 **Stories** — Sent when a new story is posted',
          ].join('\n'),
        },
        {
          name: '💡 Quick Start',
          value: '1. `/setchannel #tiktok-notifications`\n2. `/add charlidamelio`\n3. `/test charlidamelio live`',
        }
      )
      .setFooter({ text: 'TikTok Notifier • Checks every 60 seconds' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
