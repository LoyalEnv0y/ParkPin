const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Car = require('./car');
const ParkingLot = require('./parkingLot');

const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    let thumbnail = this.url && this.url.replace('/upload', '/upload/w_100')
    return thumbnail;
});

ImageSchema.virtual('avatar').get(function() {
    let thumbnail = this.url && this.url.replace('/upload', '/upload/w_50')
    return thumbnail;
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    birthDate: {
        type: Date,
        required: true
    },

    image: ImageSchema,

    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    citizenID: {
        type: String,
        required: true,
        unique: true
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },

    cars: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Car'
        }
    ],

    parkingLots: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ParkingLot'
        }
    ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);