const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Car = require('./car');
const ParkingLot = require('./parkingLot');

const slotsSchema = new Schema({
    isFull: {
        type: Boolean,
        default: false,
    },

    occupierCar: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        default: null,
    },

    floorNum: {
        type: Number,
        default: 0
    },

    locatedAt: {
        type: Schema.Types.ObjectId,
        ref: 'ParkingLot',
    }
})

module.exports = mongoose.model('Slot', slotsSchema)