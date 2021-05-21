const cron = require('node-cron')
const client = require('./client')
const path = require('path')
const fs = require('fs')
const scrapper = require('./puppeteer')
const fashionImage = require('./twitter')
const { MessageEmbed } = require('discord.js')

//Duty Reset (Every day at 12)
cron.schedule('0 12 * * *', () => {
    sendNotificationToEveryone("Beast Tribe and Duty's have been reset \\o'/", "notificationChannelId")
})

//Grand Company Reset (Everyday at 17)
cron.schedule('0 17 * * *', () => {
    sendNotificationToEveryone("Grand Company have reset \\o'/", "notificationChannelId")
})

//Weekly Reset(Tuesday's at 2)
cron.schedule('0 5 * * 2', () => {
    sendNotificationToEveryone("The weekly reset is here \\o'/", "notificationChannelId")
})

//Fashion Report (Every 2 hours)
cron.schedule(('0 */2 * * *'), async () => {
    let imageURL = await fashionImage()
    if(!imageURL) return

    const embed = new MessageEmbed()
        .setTitle("I present to you an update on this week's Fashion Report")
        .setDescription('Go make me proud my friend, show them how FABULOUS you are')
        .setColor(9464465)
        .setThumbnail('https://64.media.tumblr.com/31a795a6ce07d7b4d061cef8ed62ea79/tumblr_paptsfioBh1qbqs2do1_500.jpg')
        .setImage(imageURL)
        .setFooter('by Kaiyoko Star💫 || https://twitter.com/KaiyokoStar')
    sendNotificationToEveryone(embed, "fashionChannelId")
})

//Check if new news are available (Every 2 hours)
cron.schedule('0 */2 * * *', async () => {
    let news = await scrapper()
    if (!news) return

    const embed = new MessageEmbed()
        .setTitle(news.title)
        .setDescription(news.description)
        .setColor(9464465)
        .setImage(news.img)
        .setURL(news.href)
    sendNotificationToEveryone(embed, "newsChannelId")
})


function sendNotificationToEveryone(message, topic) {
    let dir = path.resolve(__dirname + "/../storage/")
    fs.readdirSync(dir).forEach(file => {
        try {
            let data = JSON.parse(fs.readFileSync(dir + '/' + file))
            if (data[topic]) client.channels.cache.get(data[topic]).send(message)    
        } catch (error) {
            console.error(error)
        }
    })
}

//setTimeout(() => sendNotificationToEveryone("Hola"), 5000)