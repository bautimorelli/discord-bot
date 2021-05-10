const cron = require('node-cron')
const client = require('./client')
const path = require('path')
const fs = require('fs')

cron.schedule('0 12 * * *', () => {
    sendNotificationToEveryone("Beast Tribe and Duty's have been reset \\o'/")
})

cron.schedule('0 17 * * *', () => {
    sendNotificationToEveryone("Grand Company have reset \\o'/")
})

cron.schedule('0 5 * * 2', () => {
    sendNotificationToEveryone("The weekly reset is here \\o'/")
})

function sendNotificationToEveryone(message) {
    let dir = path.resolve(__dirname + "/../storage/")
    fs.readdirSync(dir).forEach(file => {
        try {
            let data = JSON.parse(fs.readFileSync(dir + '/' + file))
            if (data.notificationChannelId) client.channels.cache.get(data.notificationChannelId).send(message)    
        } catch (error) {
            console.error(error)
        }
    })
}

//setTimeout(() => sendNotificationToEveryone("Hola"), 5000)