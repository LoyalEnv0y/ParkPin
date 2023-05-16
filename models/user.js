const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Car = require('./car');
const ParkingLot = require('./parkingLot');

const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
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

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);