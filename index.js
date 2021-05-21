require('dotenv').config()
require('./app/cron')
require('./app/puppeteer')

const cron = require('node-cron')
const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const path = require('path')
const client = require('./app/client')
const axios = require('axios').default

const PREFIX = "!"

client.on('ready', () => {
    console.log('Haurchefant has arrived')
})

client.on('message', (message) => {
    //Ignorar mensajes de otros bots
    if (message.author.bot || !message.content.startsWith(PREFIX)) return

    const [command, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/)

    //Commands
    switch(command) {
        case "hello":
        case "hi":
            handleHello(message)
            break
        case "fashion":
            handleNotifications(message, "fashionChannelId")
            break
        case "notifications":
            handleNotifications(message, "notificationChannelId")
            break
        case "news":
            handleNotifications(message, "newsChannelId")
            break
        case "gif":
            handleGif(message, args[0])
            break
        case "help":
            handleHelp(message)
            break
        case "latestreport":
            handleLatestReport(message)
            break
    }
})

//Command Hello/Hi
function handleHello(message) {
    getGifUrl('hi').then(url => {
        message.channel.send(new MessageEmbed().setImage(url))
    })
}

//Command Help
function handleHelp(message){
    const embed = new MessageEmbed()
        .setTitle("These are the commands I know how to use!")
        .setDescription(':kopa:')
        .setColor(9464465)
        .addFields(
            {name: '!hello / !hi', value: 'I will answer a Gif saying hi back'},
            {name: '!gif (tag)', value: 'I will send a Gif of the topic of the tag'},
            {name: '!notifications', value: 'It activates a message whenever there is a Daily Reset'},
            {name: '!news', value: 'It activates a message whenever there is a new Lodestone News'},
            {name: '!fashion', value: 'It activates a message whenever there is a new fashion report! (updates every friday)'},
            {name: '!latestreport', value: 'Shows this weeks fashion report!'}
        )
    message.channel.send(embed)
}

//Command LatestReport
function handleLatestReport(message) {
    let file = path.resolve(__dirname + "/updates/latestFashionReport")
    let url = fs.readFileSync(file, 'utf8')
    message.channel.send(url)
}

//Notifications Command
function handleNotifications(message, topic){
    const guildId = message.guild.id
    const channelId = message.channel.id
    const fileName = path.resolve(__dirname + "/storage/" + guildId)

    
    let data = JSON.parse(fs.readFileSync(fileName))

    let enabled = channelId != data[topic]

    if (enabled) {
        data[topic] = channelId
    } else {
        delete data[topic]
    }

    message.channel.send("notifications " + (enabled ? "enabled in this channel" : "disabled"))

    fs.writeFileSync(fileName, JSON.stringify(data))
}

//Command Gif
function handleGif(message, tag) {
    getGifUrl(tag).then(url => {
        message.channel.send(new MessageEmbed().setImage(url))
    })
}
async function getGifUrl(tag) {
    let response = await axios.get('https://api.giphy.com/v1/gifs/random?tag=' + tag + '&limit=1&api_key=' + process.env.GIPHY_API_KEY)
    let images = response.data.data.images
    if (!images) throw ""

    return images.fixed_height.url
}


//Cuando entra alguien nuevo al servidor
client.on("guildMemberAdd", (member) => {
    const channel = member.guild.channels.cache.find(channel => channel.name === 'general')
    channel.send(`Welcome our new user! ${member.user}`)
})

//Cuando me agregan a un servidor
client.on("guildCreate", (guild) => {
    const guildId = guild.id
    fs.writeFileSync(path.resolve(__dirname + "/storage/" + guildId), '{}')
    const channel = guild.channels.cache.find(channel => channel.name === 'general')
    if (channel) channel.send(new MessageEmbed()
    .setTitle('Thanks for having me \\o/')
    .setDescription(`
    Hello there! My name is Haurchefant, I'm a bot designed to be of help on FFXIV communities with my cool commands.
    You can use the !help to lear more about them!
    `)
    .setThumbnail('https://64.media.tumblr.com/31a795a6ce07d7b4d061cef8ed62ea79/tumblr_paptsfioBh1qbqs2do1_500.jpg')
    )
})

//Cuando me borran a un servidor
client.on("guildDelete", (guild) => {
    const guildId = guild.id
    try {
        fs.unlinkSync(path.resolve(__dirname + "/storage/" + guildId))
    } catch (error){
        console.error(error)
    }
})



