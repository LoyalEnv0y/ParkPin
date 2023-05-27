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

	const pricePair = await HourPricePair.findById(pricePairId);

	const newStay = new Stay({
		user: req.user._id,
		place: id,
		car: carId,
		slot: slotId,
		reservedFor: newDateTime,
		fee: pricePair.price
	});

	await User.findByIdAndUpdate(
		req.user._id,
		{ $push: { stays: newStay._id } }
	)


	await newStay.save();

	req.flash('success', `Booked a new reservation. Please activate it when you arrive at the parking lot`);
	res.redirect('/me');
}

module.exports.activate = async (req, res) => {
	const { id: lotId, stayId } = req.params;
	const foundStay = await Stay.findById(stayId);

	await Slot.findByIdAndUpdate(
		foundStay.slot,
		{
			isFull: true,
			occupierCar: foundStay.car._id
		}
	);

	await Car.findByIdAndUpdate(
		foundStay.car,
		{
			parkedIn: lotId,
			parkedAt: Date.now()
		}
	);

	foundStay.status = 'Active';
	foundStay.activatedAt = Date.now();

	await foundStay.save();

	req.flash('success', 'Activated the reservation.');
	res.redirect('/me');
}

module.exports.deactivate = async (req, res) => {
	const { stayId } = req.params;
	const foundStay = await Stay.findById(stayId);

	await Slot.findByIdAndUpdate(
		foundStay.slot,
		{
			isFull: false,
			occupierCar: null
		}
	);

	await Car.findByIdAndUpdate(
		foundStay.car,
		{
			parkedIn: null,
			parkedAt: null
		}
	);

	foundStay.status = 'Expired';
	foundStay.deactivatedAt = Date.now();

	await foundStay.save();

	req.flash('success', 'Deactivated the reservation.');
	res.redirect('/me');
}

module.exports.delete = async (req, res) => {
	const { stayId } = req.params;
	const foundStay = await Stay.findById(stayId);

	await User.findByIdAndUpdate(
		foundStay.user._id,
		{ $pull: { stays: stayId } }
	)

	await foundStay.deleteOne();

	req.flash('success', 'Deleted the old reservation.');
	res.redirect('/me');
}