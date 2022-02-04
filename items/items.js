const mongoose = require('mongoose')
const { itemSchem } = require('../schema/data.js')
const itemdb = mongoose.model('items', itemSchem)

const items = [
    // new itemdb ({
    //     name: 'sword',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 14,
    //         m_atk: 6,
    //         acc: 17,
    //     },
    // }),
    // new itemdb ({
    //     name: 'wand',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 6,
    //         m_atk: 14,
    //         acc: 20,
    //     },
    // }),
    // new itemdb ({
    //     name: 'fishrod',
    //     weight: 20,
    //     stack: false,
    //     type: 3,
    //     stat: {
    //         luc: 1
    //     },
    // }),
    // new itemdb ({
    //     name: 'dual',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 20,
    //         m_atk: 6,
    //         acc: 10,
    //     },
    // }),
    // new itemdb ({
    //     name: 'bow',
    //     weight: 20,
    //     stack: false,
    //     type: 1,
    //     char: {
    //         f_atk: 30,
    //         m_atk: 10,
    //         acc: 6,
    //     },
    // }),
    // new itemdb ({
    //     name: 'enchScroll',
    //     weight: 20,
    //     stack: true,
    //     type: -1,
    // }),
    new itemdb({
        name: 'vinteum',
        weight: 0.1,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'lumen',
        weight: 0.1,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'herbs',
        weight: 0.5,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'rareHerbs',
        weight: 0.5,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'sand',
        weight: 2,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'rareSand',
        weight: 2,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'ore',
        weight: 3,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'rareOre',
        weight: 3,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'wood',
        weight: 1,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'rareWood',
        weight: 1,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'fish',
        weight: 10,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'rareFish',
        weight: 10,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'bait',
        weight: 0.2,
        stack: true,
        type: -1,
    }),
    new itemdb({
        name: 'energyPotion',
        weight: 1,
        stack: true,
        type: -1,
    }),
]

module.exports = items
