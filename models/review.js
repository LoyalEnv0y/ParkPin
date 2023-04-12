const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const reviewSchema = new Schema({
    title: {
        type: String,
        default: '',
    },

    body: {
        type: String,
        required: true,
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        default: 3,
    },

    votes: {
        type: Number,
        default: 0,
    },
})

module.exports = mongoose.model('Review', reviewSchema);