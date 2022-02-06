const { Bot, Keyboard, session, SessionFlavor } = require('grammy')
const { Menu, MenuRange } = require('@grammyjs/menu')
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

const charScreen = new Menu('charScreen', { autoAnswer: false })
    .dynamic(async (ctx) => {
        const range = new MenuRange()
        for (let i = 0; i < ctx.account.char.length; i++) {
            const char = ctx.account.char[i]
                ? await chardb.findById(ctx.account.char[i]._id)
                : null
            range
                .text(
                    `👤 ${char.name}      ${
                        ctx.account.char[i].equiped ? '✅' : '❌'
                    }`,
                    async (ctx) => {
                        if (ctx.account.char[i].equiped) {
                            ctx.account.char[i].equiped = false
                            await ctx.account.save()
                            ctx.answerCallbackQuery(
                                `Снят персонаж ${char.name}`
                            )
                            ctx.menu.update()
                            return
                        }
                        if (ctx.account.char.find((x) => x.equiped === true))
                            return ctx.answerCallbackQuery(
                                `Можно выбрать только 1 активного персонажа`
                            )
                        ctx.account.char[i].equiped = true
                        await ctx.account.save()
                        ctx.answerCallbackQuery(`Выбран персонаж ${char.name}`)
                        ctx.menu.update()
                    }
                )
                .row()
        }
        return range
    })
    .row()
    .dynamic(async (ctx) => {
        const range = new MenuRange()
        const hidebutton =
            ctx.account.char.length > ctx.account.charSlots ? 0 : 1
        for (let i = 0; i < hidebutton; i++) {
            range.submenu(
                (ctx) => getLocale(ctx.account.lang, 'create'),
                'charCreate',
                (ctx) => {
                    ctx.answerCallbackQuery(
                        'Введите имя персонажа в поле ввода'
                    )
                    ctx.editMessageText(
                        getLocale(ctx.account.lang, 'createChar')
                    )
                    ctx.session.createChar = 1
                }
            )
        }
        return range
    })

const charCreate = new Menu('charCreate').back(
    (ctx) => getLocale(ctx.account.lang, 'back'),
    async (ctx) => {
        const char = ctx.account.char[0]
            ? await chardb.findById(ctx.account.char[0]._id)
            : null
        ctx.editMessageText(getLocale(ctx.account.lang, 'charList'))
        ctx.session.createChar = 0
    }
)

charScreen.register(charCreate)

const menu = new Menu('mainMenu', { autoAnswer: false })
    .text(
        (ctx) => getLocale(ctx.account.lang, 'crafts'),
        (ctx) => ctx.answerCallbackQuery('test')
    )
    .text(
        (ctx) => getLocale(ctx.account.lang, 'market'),
        (ctx) => ctx.answerCallbackQuery('test')
    )
    .row()
    .text(
        (ctx) => getLocale(ctx.account.lang, 'inventory'),
        (ctx) => ctx.answerCallbackQuery('test')
    )
    .text(
        (ctx) => getLocale(ctx.account.lang, 'setting'),
        (ctx) => ctx.answerCallbackQuery('test')
    )
    .dynamic(async (ctx) => {
        const range = new MenuRange()
        const char = ctx.account.char.find((x) => x.equiped === true)
            ? await chardb.findById(
                  ctx.account.char.find((x) => x.equiped === true)._id
              )
            : 0
        range.text(
            (ctx) => getLocale(ctx.account.lang, 'balance', char.balance || 0),
            (ctx) => ctx.answerCallbackQuery('Ваш баланс')
        )
        return range
    })

const setting = new Menu('setting', { autoAnswer: false })
    .text(
        (ctx) => getLocale(ctx.account.lang, 'alert'),
        async (ctx) => {
            if (ctx.account.alert === 1) {
                ctx.account.alert = 0
                await ctx.account.save()
                ctx.editMessageText(
                    getLocale(
                        ctx.account.lang,
                        'settingString',
                        ctx.account.alert == 0 ? '🔕' : '🔔',
                        ctx.account.lang == 'ru' ? '🇷🇺' : '🇺🇸'
                    )
                )
                return
            }
            ctx.account.alert = 1
            await ctx.account.save()
            ctx.editMessageText(
                getLocale(
                    ctx.account.lang,
                    'settingString',
                    ctx.account.alert == 0 ? '🔕' : '🔔',
                    ctx.account.lang == 'ru' ? '🇷🇺' : '🇺🇸'
                )
            )
        }
    )
    .text(
        (ctx) => getLocale(ctx.account.lang, 'lang'),
        async (ctx) => {
            if (ctx.account.lang == 'ru') {
                ctx.account.lang = 'en'
                await ctx.account.save()
                ctx.editMessageText(
                    getLocale(
                        ctx.account.lang,
                        'settingString',
                        ctx.account.alert == 0 ? '🔕' : '🔔',
                        ctx.account.lang == 'ru' ? '🇷🇺' : '🇺🇸'
                    )
                )
                ctx.reply(
                    getLocale(
                        ctx.account.lang,
                        'changeLang',
                        ctx.account.first_name
                    ),
                    {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: keyboardAcc(ctx).build(),
                        },
                    }
                )
                return
            }
            ctx.account.lang = 'ru'
            await ctx.account.save()
            ctx.editMessageText(
                getLocale(
                    ctx.account.lang,
                    'settingString',
                    ctx.account.alert == 0 ? '🔕' : '🔔',
                    ctx.account.lang == 'ru' ? '🇷🇺' : '🇺🇸'
                )
            )
            ctx.reply(
                getLocale(
                    ctx.account.lang,
                    'changeLang',
                    ctx.account.first_name
                ),
                {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: keyboardAcc(ctx).build(),
                    },
                }
            )
        }
    )

const keyboard = (ctx) =>
    new Keyboard()
        .text(getLocale(ctx.from.language_code, 'crafts'))
        .text(getLocale(ctx.from.language_code, 'market'))
        .row()
        .text(getLocale(ctx.from.language_code, 'char'))
        .text(getLocale(ctx.from.language_code, 'setting'))
        .text(getLocale(ctx.from.language_code, 'lang'))
        .row()
        .text(getLocale(ctx.from.language_code, 'menu'))

const keyboardAcc = (ctx) =>
    new Keyboard()
        .text(getLocale(ctx.account.lang, 'crafts'))
        .text(getLocale(ctx.account.lang, 'market'))
        .row()
        .text(getLocale(ctx.account.lang, 'char'))
        .text(getLocale(ctx.account.lang, 'setting'))
        .text(getLocale(ctx.account.lang, 'lang'))
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
    setting,
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
        ctx.reply(getLocale(ctx.account.lang, 'welcome', ctx.from.first_name), {
            reply_markup: {
                resize_keyboard: true,
                keyboard: keyboard(ctx).build(),
            },
        })
        return
    } else {
        ctx.reply(
            getLocale(ctx.account.lang, 'welcome', ctx.account.first_name),
            {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: keyboardAcc(ctx).build(),
                },
            }
        )
        return
    }
})

// Handle other messages.
bot.on('message', async (ctx) => {
    if (!ctx.account) return
    const charAll = await chardb.find()
    const char = ctx.account.char[0]
        ? await chardb.findById(ctx.account.char[0]._id)
        : null
    const date = new Date(ctx.account._id.getTimestamp())
    let lang = JSON.parse(
        fs.readFileSync(`./lang/${ctx.account.lang}.json`, 'utf-8')
    )
    if (ctx.session.createChar == 1) {
        if (ctx.message.text.length > 8 || ctx.message.text.length < 3) {
            ctx.reply(lang.ceateForb)
            return
        }
        if (!ctx.message.text.match(/^[A-Z][A-Za-z0-9]+$/)) {
            ctx.reply(lang.ceateForb)
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
                ctx.account.char.unshift({ _id: x._id })
                ctx.reply(lang.charCreated.replace('<name>', ctx.message.text))
                await ctx.account.save()
            })
        ctx.session.createChar = 0
    }
    if (ctx.message.text == getLocale(ctx.account.lang, 'char')) {
        ctx.reply(getLocale(ctx.account.lang, 'charList'), {
            reply_markup: charScreen,
        })
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
    if (ctx.message.text == getLocale(ctx.account.lang, 'setting')) {
        ctx.reply(
            getLocale(
                ctx.account.lang,
                'settingString',
                ctx.account.alert == 0 ? '🔕' : '🔔',
                ctx.account.lang == 'ru' ? '🇷🇺' : '🇺🇸'
            ),
            {
                reply_markup: setting,
            }
        )
    }
    if (ctx.message.text == lang.crafts) {
        ctx.reply(date.toTimeString(), {
            reply_markup: {
                resize_keyboard: true,
                keyboard: keyboardAcc(ctx).build(),
            },
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
