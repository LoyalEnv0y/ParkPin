const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Car = require('./car');
const ParkingLot = require('./parkingLot');

const usersSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },

    birthDate: {
        type: Date,
        required: true
    },

    cars: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Car'
        }
    ],

    ParkingLots: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ParkingLot'
        }
    ],

    ProfilePicLink: {
        type: String
    }
});

module.exports = mongoose.model('User', usersSchema);