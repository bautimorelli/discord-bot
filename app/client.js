const { Client } = require('discord.js')

const client = new Client()

client.login(process.env.DISCORD_BOT_TOKEN)

module.exports = client