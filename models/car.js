const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carsSchema = new Schema({
    brand: {
        type: String,
        required: true,
    },

    model: {
        type: String,
        required: true,
    },

    hasLPG: {
        type: Boolean,
        required: true
    },

    description: {
        type: String,
    },

    listedAt: {
        type: Date,
        default: Date.now(),
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    parkedIn: {
        type: Schema.Types.ObjectId,
        ref: 'ParkingLot',
    },

    parkedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Car', carsSchema);