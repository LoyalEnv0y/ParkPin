const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('../models/user');
const ParkingLot = require('../models/parkingLot');
const Car = require('../models/car');

const staySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    place: {
        type: Schema.Types.ObjectId,
        ref: 'ParkingLot',
    },

    car: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
    },

    isActive: {
        type: Boolean,
        default: false,
    },

    fee: {
        type: Number,
		required: true
    },

    bookedAt: {
        type: Date,
		default: Date.now(),
    },

	reservedFor: {
		type: Date,
	},

    enteredAt: {
        type: Date,
    },

    departureAt: {
        type: Date,
    },


});

module.exports = mongoose.model('Stay', staySchema);