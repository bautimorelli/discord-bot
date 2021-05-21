const axios = require('axios').default
const path = require('path')
const fs = require('fs')

//FALTA TERMINAR
async function fashionImage() {
    let options = {
        headers: {
            Authorization: process.env.TWITTER_TOKEN
        }
    }
    let response = await axios.get('https://api.twitter.com/2/users/by/username/KaiyokoStar?expansions=pinned_tweet_id', options)
    let pinnedTweet = await axios.get('https://api.twitter.com/2/tweets/' + response.data.data.pinned_tweet_id +'?expansions=attachments.media_keys&media.fields=url', options)
    let pinnedURL = pinnedTweet.data.includes.media[0].url
    let file = path.resolve(__dirname + "/../updates/latestFashionReport")
    

    if (fs.existsSync(file)) {
        let latestURL = fs.readFileSync(file, 'utf8')
        if (latestURL === pinnedURL) return null
    }

    fs.writeFileSync(file, pinnedURL)
    
    return pinnedURL
}

module.exports = fashionImage