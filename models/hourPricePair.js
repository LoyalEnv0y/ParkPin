const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hourPricePairSchema = new Schema({
    start: {
        type: Number,
        required: true
    },

    end: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0,
        max: 1000
    }
});

module.exports = mongoose.model('HourPricePair', hourPricePairSchema);