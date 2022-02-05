const mongoose = require("mongoose")
const timestamp = Date.now() + 10800000

const itemSchem = new mongoose.Schema({
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    stack: { type: Boolean, required: true },
    type: { type: Number, required: true },
    char: {
        hpMax: { type: Number, default: 0 },
        mpMax: { type: Number, default: 0 },
        f_atk: { type: Number, default: 0 },
        m_atk: { type: Number, default: 0 },
        f_def: { type: Number, default: 0 },
        m_def: { type: Number, default: 0 },
        acc: { type: Number, default: 0 },
        ev: { type: Number, default: 0 },
    },
    stat: {
        str: { type: Number, default: 0 },
        int: { type: Number, default: 0 },
        con: { type: Number, default: 0 },
        luc: { type: Number, default: 0 },
        chr: { type: Number, default: 0 },
    },
})

const accountSchem = new mongoose.Schema({
    tgid: { type: Number, required: true, unique: true },
    username: { type: String },
    first_name: { type: String, required: true },
    lang: { type: String, default: "en" },
    alert: { type: Number, default: 0 },
    acclvl: { type: Number, default: 0 },
    char: [
        {
            charid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "characters",
                required: true,
            },
            equiped: { type: Boolean, default: false },
        },
    ],
    _bm: { type: Number, default: 1, min: 0, max: 1 },
})

const charSchem = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    balance: {
        type: Number,
        default: 0,
        get: (v) => Math.floor(v),
        set: (v) => Math.floor(v),
    },
    timers: {
        mainWork: { type: String, default: null },
        timeWork: { type: Number, default: 0 },
        hasWorked: { type: Boolean, default: false },
        bonus: { type: Boolean, default: false },
        eFullAlert: { type: Boolean, default: true },
        buffNewByAlert: { type: Boolean, default: false },
        buffVipAlert: { type: Boolean, default: true },
        buffBanAlert: { type: Boolean, default: true },
        buffRate1St: { type: Boolean, default: true },
        buffRate2St: { type: Boolean, default: true },
        buffRate3St: { type: Boolean, default: true },
        buffRate9St: { type: Boolean, default: true },
        buffEnergyWell: { type: Boolean, default: true },
    },
    skils: {
        harv: { type: Number, default: 0 },
        log: { type: Number, default: 0 },
        mine: { type: Number, default: 0 },
        dig: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
    },
    skilsExp: {
        harv: { type: Number, default: 0 },
        log: { type: Number, default: 0 },
        mine: { type: Number, default: 0 },
        dig: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
    },
    invent: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "items",
                required: true,
            },
            quantity: { type: Number, default: 0 },
            ench: { type: Number, default: 0, min: -1, max: 20 },
            equiped: { type: Boolean, default: false },
        },
    ],
    boosters: {
        energyCount: { type: Number, default: 1 },
        energyRegen: { type: Number, default: 1 },
        harvest: { type: Number, default: 0 },
        exp: { type: Number, default: 1 },
    },
    buffs: {
        newby: { type: Number, default: +timestamp + 168 * 60 * 60 * 1000 },
        vip: { type: Number, default: null },
        ban: { type: Number, default: null },
        rate1st: { type: Number, default: null },
        rate2st: { type: Number, default: null },
        rate3st: { type: Number, default: null },
        rate9st: { type: Number, default: null },
        energyWell: { type: Number, default: null },
    },
    char: {
        hpMax: { type: Number, default: 100, min: 0 },
        mpMax: { type: Number, default: 100, min: 0 },
        hp: { type: Number, default: 100, min: 0 },
        mp: { type: Number, default: 100, min: 0 },
        f_atk: { type: Number, default: 1, min: 0 },
        m_atk: { type: Number, default: 1, min: 0 },
        f_def: { type: Number, default: 1, min: 0 },
        m_def: { type: Number, default: 1, min: 0 },
        acc: { type: Number, default: 1, min: 0 },
        ev: { type: Number, default: 1, min: 0 },
    },
    equip: {
        armor: {
            item: { type: mongoose.Schema.Types.ObjectId, auto: true },
            equiped: { type: Boolean, default: false },
        },
        weap: {
            item: { type: mongoose.Schema.Types.ObjectId, auto: true },
            equiped: { type: Boolean, default: false },
        },
        ring: {
            item: { type: mongoose.Schema.Types.ObjectId, auto: true },
            equiped: { type: Boolean, default: false },
        },
        fishRod: {
            item: { type: mongoose.Schema.Types.ObjectId, auto: true },
            equiped: { type: Boolean, default: false },
        },
    },
    stat: {
        str: { type: Number, default: 1 },
        int: { type: Number, default: 1 },
        con: { type: Number, default: 1 },
        luc: { type: Number, default: 1 },
        chr: { type: Number, default: 1 },
    },
    plot: {
        own: { type: Boolean, default: false },
        size: { type: Number, default: 0 },
        house: { type: Number, default: 0 },
        wh: { type: Number, default: 0 },
        temple: { type: Number, default: 0 },
        mc: { type: Number, default: 0 },
        well: { type: Number, default: 0 },
    },
    invWeight: { type: Number, default: 30000 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    race: { type: Number, default: 0 },
})

const bankSchem = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: String,
    balance: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    inv: {
        vinmt: { type: Number, default: 0 },
        herbs: { type: Number, default: 0 },
        rareHerbs: { type: Number, default: 0 },
        sand: { type: Number, default: 0 },
        rareSand: { type: Number, default: 0 },
        ore: { type: Number, default: 0 },
        rareOre: { type: Number, default: 0 },
        wood: { type: Number, default: 0 },
        rareWood: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
        rareFish: { type: Number, default: 0 },
    },
    dpi: {
        vinmt: { type: Number, default: 0 },
        herbs: { type: Number, default: 0 },
        sand: { type: Number, default: 0 },
        ore: { type: Number, default: 0 },
        wood: { type: Number, default: 0 },
        fish: { type: Number, default: 0 },
        rareHerbs: { type: Number, default: 0 },
        rareSand: { type: Number, default: 0 },
        rareOre: { type: Number, default: 0 },
        rareWood: { type: Number, default: 0 },
        rareFish: { type: Number, default: 0 },
        lumen: { type: Number, default: 0 },
    },
})

module.exports = { accountSchem, charSchem, itemSchem, bankSchem }
