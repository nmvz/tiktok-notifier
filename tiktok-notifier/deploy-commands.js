const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'src/commands')).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Registering ${commands.length} slash commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered globally! (May take up to 1 hour to appear)');
    console.log('Commands registered:', commands.map(c => `/${c.name}`).join(', '));
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
