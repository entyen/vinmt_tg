const { Bot, Keyboard, session, SessionFlavor } = require('grammy')
const { Menu } = require('@grammyjs/menu')
const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

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

function getLocale(ulang, string, ...vars) {
    let lang = JSON.parse(fs.readFileSync(`./lang/${ulang}.json`, 'utf-8'))
    lang = lang[string]

    let count = 0
    lang = lang
        .replace(/%VAR%/, () => (vars[count] !== null ? vars[count] : '%VAR%'))
        .replace(/%VAR%/, () =>
            vars[count++] !== null ? vars[count++] : '%VAR%'
        )

    return lang
}

//MiddleWire Test
async function middleCheck(ctx, next) {
    if (ctx.from) {
        if (ctx.from.language_code != 'en' && ctx.from.language_code != 'ru') {
            ctx.from.language_code = 'en'
        }
        ctx.account = await accdb.findOne({ tgid: ctx.from.id })
        if (ctx.account) {
            await next()
            return
        } else {
            if (ctx.message.text === '/start') {
                await next()
                return
            }
            ctx.reply(getLocale(ctx.from.language_code, 'noAccount'))
            await next()
            return
        }
    }
    await next()
}

const charScreen = new Menu('charScreen')
    .text('Выбрать 1-го', async (ctx) => {
        if (ctx.account.char[0].equiped) {
            ctx.deleteMessage()
            ctx.reply(`Персонаж уже выбран`)
            return
        }
        const char = ctx.account.char[0]
            ? await chardb.findById(ctx.account.char[0].charid)
            : null
        ctx.account.char[0].equiped = true
        await ctx.account.save()
        ctx.deleteMessage()
        ctx.reply(`Выбран персонаж ${char.name}`)
    })
    .row()
    .submenu(
        (ctx) => getLocale(ctx.account.lang, 'create'),
        'charCreate',
        (ctx) => {
            if (ctx.account.char.length > 0) {
                ctx.editMessageText(getLocale(ctx.account.lang, 'haveChar'))
                return
            }
            ctx.editMessageText(getLocale(ctx.account.lang, 'createChar'))
            ctx.session.createChar = 1
        }
    )

const charCreate = new Menu('charCreate').back(
    (ctx) => getLocale(ctx.account.lang, 'back'),
    async (ctx) => {
        const char = ctx.account.char[0]
            ? await chardb.findById(ctx.account.char[0].charid)
            : null
        ctx.editMessageText(
            `${getLocale(ctx.account.lang, 'charList')}\n${
                char
                    ? `👤 ${char.name}                 ${
                          ctx.account.char[0].equiped ? 'Выбран' : 'Не Выбран'
                      }`
                    : 'Персонажей Нет'
            }`
        )
        ctx.session.createChar = 0
    }
)

charScreen.register(charCreate)

const menu = new Menu('mainMenu')
    .text(
        (ctx) => getLocale(ctx.account.lang, 'crafts'),
        (ctx) => ctx.reply('test')
    )
    .text(
        (ctx) => getLocale(ctx.account.lang, 'market'),
        (ctx) => ctx.reply('test')
    )
    .row()
    .text(
        (ctx) => getLocale(ctx.account.lang, 'char'),
        (ctx) => ctx.reply('test')
    )
    .text(
        (ctx) => getLocale(ctx.account.lang, 'setting'),
        (ctx) => ctx.reply('test')
    )
    .text(
        (ctx) => getLocale(ctx.account.lang, 'balance', 0),
        (ctx) => ctx.reply('test')
    )

const keyboard = (ctx) =>
    new Keyboard()
        .text(getLocale(ctx.from.language_code, 'crafts'))
        .text(getLocale(ctx.from.language_code, 'market'))
        .row()
        .text(getLocale(ctx.from.language_code, 'char'))
        .text(getLocale(ctx.from.language_code, 'setting'))
        .text(getLocale(ctx.from.language_code, 'balance', 0))
        .row()
        .text(getLocale(ctx.from.language_code, 'menu'))

const keyboardAcc = (ctx) =>
    new Keyboard()
        .text(getLocale(ctx.account.lang, 'crafts'))
        .text(getLocale(ctx.account.lang, 'market'))
        .row()
        .text(getLocale(ctx.account.lang, 'char'))
        .text(getLocale(ctx.account.lang, 'setting'))
        .text(getLocale(ctx.account.lang, 'balance', 0))
        .row()
        .text(getLocale(ctx.account.lang, 'menu'))

const MongoStorage = require('@satont/grammy-mongodb-storage')
const collection = mongoose.connection.collection('sessions')

function initial() {
    return { session: 0, createChar: 0 }
}

bot.use(
    middleCheck,
    session({
        initial,
        storage: new MongoStorage.MongoDBAdapter({ collection: collection }),
    }),
    menu,
    charScreen
)

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
            reply_markup: keyboard(ctx),
        })
        return
    } else {
        ctx.reply(lang.welcome.replace('<user>', ctx.account.first_name), {
            reply_markup: keyboardAcc(ctx),
        })
        return
    }
})

// Handle other messages.
bot.on('message', async (ctx) => {
    if (!ctx.account) return
    const charAll = await chardb.find()
    const char = ctx.account.char[0]
        ? await chardb.findById(ctx.account.char[0].charid)
        : null
    const date = new Date(ctx.account._id.getTimestamp())
    let lang = JSON.parse(
        fs.readFileSync(`./lang/${ctx.account.lang}.json`, 'utf-8')
    )
    if (ctx.session.createChar == 1) {
        if (ctx.message.text.length > 8 || ctx.message.text.length < 5) {
            ctx.reply(lang.ceateForb)
            ctx.session.createChar = 0
            return
        }
        if (!ctx.message.text.match(/[0-9a-zA-Z]/g)) {
            ctx.reply(lang.ceateForb)
            ctx.session.createChar = 0
            return
        }
        if (!!charAll.find((x) => x.name == ctx.message.text)) {
            ctx.reply(lang.haveCharName)
            ctx.session.createChar = 0
            return
        }
        await chardb
            .create({
                name: ctx.message.text,
            })
            .then(async (x) => {
                ctx.account.char.unshift({ charid: x._id })
                ctx.reply(lang.charCreated.replace('<name>', ctx.message.text))
                await ctx.account.save()
            })
        ctx.session.createChar = 0
    }
    if (ctx.message.text == lang.create) {
        if (ctx.account.char.length > 0) return ctx.reply(lang.haveChar)
        ctx.reply(lang.createChar)
        ctx.session.createChar++
    }
    if (ctx.message.text == getLocale(ctx.account.lang, 'char')) {
        ctx.reply(
            `${getLocale(ctx.account.lang, 'charList')}\n${
                char
                    ? `👤 ${char.name}                 ${
                          ctx.account.char[0].equiped ? 'Выбран' : 'Не Выбран'
                      }`
                    : 'Персонажей Нет'
            }`,
            {
                reply_markup: charScreen,
            }
        )
    }
    if (ctx.message.text == getLocale(ctx.account.lang, 'menu')) {
        ctx.reply(
            getLocale(
                ctx.account.lang,
                'mainMenu',
                ctx.account.uid,
                ctx.account.first_name
            ),
            { reply_markup: menu }
        )
    }
    if (ctx.message.text == lang.crafts) {
        ctx.reply(date.toTimeString(), {
            reply_markup: keyboardAcc(ctx),
        })
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
