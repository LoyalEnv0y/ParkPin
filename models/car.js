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

    type: {
        type: String,
        enum: ['SUV',
            'Hatchback',
            'Crossover',
            'Convertible',
            'Sedan', 'Sport',
            'Coupe', 'Minivan',
            'Station Wagon',
            'Pickup'
        ],
        default: 'SUV'
    },

    hasLPG: {
        type: Boolean,
        required: true
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
    }
});

module.exports = mongoose.model('Car', carsSchema);