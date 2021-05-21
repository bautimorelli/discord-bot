const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const url = 'https://na.finalfantasyxiv.com/lodestone/topics/'

async function scrapper() {
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    await page.goto(url)

    let document = await page.evaluate(() => {
        let items = document.getElementsByClassName('news__list--topics ic__topics--list')
        let title = items[0].children[0].innerText
        title = title.substring(0, title.indexOf("\n"))
        
        let description = items[0].children[1].innerText

        let href = items[0].children[1].children[0].href

        let img = items[0].children[1].children[0].children[0].src

        return { title, description, href, img }
    })
    await browser.close()

    let file = path.resolve(__dirname + "/../updates/lodestoneTopics")
    if (fs.existsSync(file)) {
        let lastTitle = fs.readFileSync(file, 'utf8')
        if (lastTitle === document.title) return null
    }
    fs.writeFileSync(file, document.title)

    return document
}

module.exports = scrapper