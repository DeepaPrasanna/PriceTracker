let puppeteer = require('puppeteer')
let $ = require('cheerio')
let CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');


const URL = "https://www.amazon.in/HP-Pavilion-15-cs3006tx-15-6-inch-i5-1035G1/dp/B081JZTVWZ/"


async function configureBrowser() {
    const browser = await puppeteer.launch();
    const page = browser.newPage();

    await (await page).goto(URL, { waitUntil: "networkidle2", timeout: 0 })
    return page;
}

async function checkPrice(page) {
    await page.reload()

    let html = await page.evaluate(() => document.body.innerHTML)
    // console.log(html)
    $('#priceblock_ourprice', html).each(function () {
        let itemPrice = $(this).text();
        // console.log(itemPrice)

        var itemCurrentPrice = Number(itemPrice.replace(/[^0-9.-]+/g, ""))
        // console.log(itemCurrentPrice)
        if (itemCurrentPrice < 66000) {
            sendNotification(itemCurrentPrice)
        }
    })
}


async function start() {
    let page = await configureBrowser();
    var job = new CronJob('*/15 * * * * *', function () {
        checkPrice(page)

    }, null, true, null, null, true);
    job.start();

}

async function sendNotification(price) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'anneraj73@gmail.com',
            pass: 'praise123thelord1'
        }
    });
    const mailOptions = {
        from: '"Deepa "<anneraj73@gmail.com>',

        to: 'biswajeetdas18@gmail.com',
        subject: 'Price dropped to ' + price,
        html: `<a href=\" ${URL}\"> This is the link</a>`,
        text: 'Price dropped to ' + price,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}
start();
