const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Slot = require('./slot');

const floorSchema = new Schema({
    slots: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Slot'
        }
    ],

    floorNum: {
        type: Number,
        required: true,
    },
})

floorSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Slot.deleteMany({ _id: { $in: data.slots } });
    }
});

module.exports = mongoose.model('Floor', floorSchema);