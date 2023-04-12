const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carsSchema = new Schema({
    Brand: {
        type: String,
        required: true,
    },

    Model: {
        type: String,
        required: true,
    },

    Type: {
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

    ListedAt: {
        type: Date,
        default: Date.now(),
    },

    Owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    ParkedIn: {
        type: Schema.Types.ObjectId,
        ref: 'ParkingLot',
    },

    ParkedAt: {
        type: Date,
    }
});

module.exports = mongoose.model('Car', carsSchema);