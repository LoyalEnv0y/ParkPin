const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('../models/user');
const ParkingLot = require('../models/parkingLot');
const Car = require('../models/car');
const Slot = require('../models/slot');

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

    slot: {
        type: Schema.Types.ObjectId,
        ref: 'Slot'
    },

    status: {
        type: String,
        enum: ['Inactive', 'Active', 'Expired'],
        default: 'Inactive',
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

    activatedAt: {
        type: Date,
    },

    deactivatedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Stay', staySchema);