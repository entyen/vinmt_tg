const { Bot, Keyboard } = require('grammy')
const { Menu } = require('@grammyjs/menu')
const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const MongoStorage = require('@satont/grammy-mongodb-storage')
// const collection = mongoose < MongoStorage.ISession > ('create_char', 'main')
// new MongoStorage.MongoDBAdapter({ collection })

const timestamp = Date.now() + 10800000

//config and Language files
const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))

const bot = new Bot(tea.TOKEN)

//userSchem
const { accountSchem, charSchem } = require('./schema/data.js')
const accdb = mongoose.model(
    'account',
    accountSchem.plugin(AutoIncrement, { inc_field: 'uid', start_seq: 527103 })
)
const chardb = mongoose.model('characters', charSchem)

//MiddleWire Test
async function middleCheck(ctx, next) {
    if (ctx.from) {
        ctx.account = await accdb.findOne({ tgid: ctx.from.id })
        if (ctx.account) {
            await next()
            return
        } else {
            if (ctx.message.text === '/start') {
                await next()
                return
            }
            ctx.reply('У вас нет аккаунта введите /start')
            await next()
            return
        }
    }
    await next()
}

const menu = new Menu('my-menu-identifier')
    .text('A', (ctx) => ctx.reply('You pressed A!'))
    .row()
    .text('B', (ctx) => ctx.reply('You pressed B!'))

const keyboard = (ctx, lang) =>
    new Keyboard()
        .text(lang.crafts)
        .text(lang.market)
        .row()
        .text(lang.create)
        .text(lang.setting)
        .text(`0 ${lang.curr}`)
        .row()
        .text(lang.land)

bot.use(menu, middleCheck)

bot.command('start', async (ctx) => {
    if (ctx.message.chat.id < 0) return
    ctx.account = await accdb.findOne({ tgid: ctx.from.id })
    let ulang = ctx.from.language_code
    if (ctx.account) {
        ulang = ctx.account.lang
    }
    if (ulang != 'en' && ulang != 'ru') {
        ulang = 'en'
    }
    let lang = JSON.parse(fs.readFileSync(`./lang/${ulang}.json`, 'utf-8'))
    if (!ctx.account) {
        await accdb.create({
            tgid: ctx.from.id,
            username: ctx.from.username,
            first_name: ctx.from.first_name,
            lang: ctx.from.language_code,
        })
        ctx.reply(lang.welcome.replace('<user>', ctx.from.first_name), {
            reply_markup: keyboard(ctx, lang),
        })
        return
    } else {
        ctx.reply(lang.welcome.replace('<user>', ctx.account.first_name), {
            reply_markup: keyboard(ctx, lang),
        })
        return
    }
})

// Handle other messages.
bot.on('message', (ctx) => {
    if (!ctx.account) return
    const date = new Date(ctx.account._id.getTimestamp())
    let lang = JSON.parse(
        fs.readFileSync(`./lang/${ctx.account.lang}.json`, 'utf-8')
    )
    console.log(ctx.message.text)
    switch (ctx.message.text) {
        case lang.crafts:
            ctx.reply(date.toTimeString())
            break
        default:
            ctx.reply('kb', {
                reply_markup: {
                    input_field_placeholder: 'КРИНЖ',
                    keyboard: keyboard(ctx, lang).build(),
                },
            })
            break
    }
})

process.on('uncaughtException', function (err) {
    console.error(err)
    bot.api.sendMessage(tea.GROUP_ID, `В боте ошибка ${err}`)
})

//Connect of DataBse
main()
    .then(() => {
        console.log('DB Connected')
        // Start the bot.
        bot.start()
        console.log('Bot Started')
    })
    .catch((err) => console.log(err))

async function main() {
    await mongoose.connect(
        `mongodb://${tea.DBUSER}:${tea.DBPASS}@${tea.SERVER}/${tea.DB}`
    )
}
