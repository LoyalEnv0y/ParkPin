const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const HourPricePair = require('./hourPricePair');
const Floor = require('./floor');
const Slot = require('./slot');
const Review = require('./review');


const parkingLotSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },

    location: {
        type: String,
        required: true,
    },

    floors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Floor'
        }
    ],

    available: {
        type: Boolean,
        default: true
    },

    priceTable: [
        {
            type: Schema.Types.ObjectId,
            ref: 'HourPricePair'
        },
    ],

    pictureLink: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        },
    ]
});

parkingLotSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Floor.deleteMany({ _id: { $in: data.floors } });
        await Slot.deleteMany({ locatedAt: { $in: data._id } })
        await HourPricePair.deleteMany({ _id: { $in: data.priceTable } });
        await Review.deleteMany({ _id: { $in: data.reviews } });
    }
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
