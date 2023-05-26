// Models
const ParkingLot = require('../models/parkingLot');
const User = require('../models/user');
const Slot = require('../models/slot');
const Car = require('../models/car');
const HourPricePair = require('../models/hourPricePair');
const Stay = require('../models/stay');

module.exports.renderIndex = async (req, res) => {
	const { id } = req.params;

	const foundParkingLot = await ParkingLot.findById(id)
		.populate('priceTable')
		.populate({
			path: 'floors',
			populate: {
				path: 'slots',
				populate: { path: 'locatedAt' }
			}
		});

	const user = await User.findById(req.user._id)
		.populate('cars');

	res.render('reservation/index', {
		title: 'ParkPin | Reservation',
		parkingLot: foundParkingLot,
		user
	});
}

module.exports.createReservation = async (req, res) => {
	const { id } = req.params;
	const { carId, time, slotId, pricePairId } = req.body.reservation;

	const date = new Date();
	const [hours, minutes] = time.split(':');
	const newDateTime = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		hours,
		minutes
	);

	await Slot.findByIdAndUpdate(
		slotId,
		{ isFull: true }
	);

	await Car.findByIdAndUpdate(
		carId,
		{ parkedIn: id }
	);

	const pricePair = await HourPricePair.findById(pricePairId);

	const newStay = new Stay({
		user: req.user._id,
		place: id,
		car: carId,
		reservedFor: newDateTime,
		fee: pricePair.price
	});

	await newStay.save();

	await User.findByIdAndUpdate(
		req.user._id,
		{ $push: { stays: newStay._id } }
	)

	res.redirect('/me');
}