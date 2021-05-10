require('dotenv').config()
require('./app/cron')
const cron = require('node-cron');
const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const path = require('path')
const client = require('./app/client')
const http = require('http');
const { channels } = require('./app/client');

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
        case "fashionreport":
            handleFashionReport(message)
            break
        case "resetnotification":
            handleResetNotifications(message, args[0])
        case "gif":
            handleGif(message, args[0])
    }
})

function handleGif(message, tag) {
    getGifUrl(tag, url => {
        message.channel.send(new MessageEmbed().setImage(url))
    })
}

function handleHello(message) {
    getGifUrl('hi', url => {
        message.channel.send(new MessageEmbed().setImage(url))
    })
}

function getGifUrl(tag, callback) {
    let options = {
        host: 'api.giphy.com',
        path: '/v1/gifs/random?tag=' + tag + '&limit=1&api_key=' + process.env.GIPHY_API_KEY,
        headers: {
            accept: 'application/json'
        }
    }
    http.request(options, response => {
        let value = '';
        response.on('data', function(data) {
            value += data
        })
        response.on('end', function() {
            let images = JSON.parse(value).data.images
            if (!images) return
            callback(images.fixed_height.url)
        })
    }).end()
}

function handleFashionReport(message){
    const embed = new MessageEmbed()
        .setTitle("I present to you this week's Fashion Report")
        .setDescription('Go make me proud my friend, show them how FABULOUS you are')
        .setColor(9464465)
        .setThumbnail('https://64.media.tumblr.com/31a795a6ce07d7b4d061cef8ed62ea79/tumblr_paptsfioBh1qbqs2do1_500.jpg')
        .setImage('https://pbs.twimg.com/media/E0x8AVCUUAMW0mW?format=jpg&name=large')  
    message.channel.send(embed)
}

function handleResetNotifications(message, enabled){
    const guildId = message.guild.id
    const channelId = message.channel.id
    const fileName = path.resolve(__dirname + "/storage/" + guildId)

    if (enabled != 'true' && enabled != 'false') {
        message.channel.send("Unexpected value, please use true or false")
        return
    }

    enabled = enabled == 'true'
    let data = JSON.parse(fs.readFileSync(fileName))
    if (enabled) {
        data.notificationChannelId = channelId
    } else {
        delete data.notificationChannelId
    }
    message.channel.send("Las notificaciones se " + (enabled ? "activaron" : "desactivaron"))

    fs.writeFileSync(fileName, JSON.stringify(data))
}


//Cuando entra alguien nuevo al servidor
client.on("guildMemberAdd", (member) => {
    const guild = member.guild
    if (!newUsers[guild.id]) newUsers[guild.id] = new Discord.Collection()
    newUsers[guild.id].set(member.id, member.user)

    if (newUsers[guild.id].size > 0) {
        const userlist = newUsers[guild.id].map(u => u.toString()).join(" ")
        guild.channels.cache.find(channel => channel.name === "general").send("Welcome our new user!\n" + userlist)
        newUsers[guild.id].clear()
    }
})

//Eliminar al usuario que se va
client.on("guildMemberRemove", (member) => {
    const guild = member.guild
    if (newUsers[guild.id].has(member.id)) newUsers.delete(member.id)
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



