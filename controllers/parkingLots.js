// Models
const ParkingLot = require('../models/parkingLot');

// Util
const AppError = require('../utils/AppError');
const floorsAndSlots = require('../utils/floorsAndSlots');
const hourPricePairs = require('../utils/hourPricePairs');

// Data
const CitiesAndProvinces = require('../seeds/CitiesAndProvinces.json');

module.exports.renderIndex = async (req, res) => {
	const allParkingLots = await ParkingLot.find({}).populate('owner');

	res.render('parkingLots/index', {
		title: 'ParkPin | All',
		ParkingLots: allParkingLots
	});
};

module.exports.renderNew = (req, res) => {
	res.render('parkingLots/new', {
		title: 'ParkPin | New',
		cities: CitiesAndProvinces
	});
}

module.exports.renderShow = async (req, res) => {
	const { id } = req.params;

	const foundParkingLot = await ParkingLot.findById(id)
		.populate('owner')
		.populate({ path: 'floors', populate: { path: 'slots', populate: { path: 'locatedAt' } } })
		.populate('priceTable')
		.populate({ path: 'reviews', populate: { path: 'author' } });

	res.render('parkingLots/show', {
		title: `ParkPin | ${foundParkingLot.location}`,
		parkingLot: foundParkingLot
	});
}

module.exports.renderEdit = async (req, res) => {
	const foundParkingLot = await ParkingLot.findById(req.params.id);
	const [oldCity, oldProvince] = foundParkingLot.location.split(' - ');

	res.render('parkingLots/edit', {
		title: 'ParkPin | New',
		parkingLot: foundParkingLot,
		cities: CitiesAndProvinces,
		oldCity,
		oldProvince
	});
}

module.exports.createParkingLot = async (req, res) => {
	const parkingLot = req.body.parkingLot;
	if (!parkingLot) throw new AppError('Invalid form data', 400);

	const location = parkingLot.city + ' - ' + parkingLot.province;

	const newLot = new ParkingLot({
		name: (parkingLot.name) ? parkingLot.name : location + ' Parking Lot',
		location: location,
		pictureLink: parkingLot.pictureLink,
		owner: req.user._id
	});
	newLot.floors = await floorsAndSlots.parseAndCreateFloors(parkingLot.floors, newLot);
	newLot.priceTable = await hourPricePairs.parseAndCreateHourPricePairs(parkingLot.priceTable, newLot)

	await newLot.save();

	req.flash('success', 'Successfully made a new parking lot!');
	res.redirect(`/parkingLots/${newLot._id}`);
}

module.exports.updateParkingLot = async (req, res) => {
	const { id } = req.params;
	const foundParkingLot = await ParkingLot.findById(id);
	const updatedLot = req.body.parkingLot;

	foundParkingLot.name = updatedLot.name;
	foundParkingLot.location = updatedLot.city + ' - ' + updatedLot.province;
	foundParkingLot.pictureLink = updatedLot.pictureLink;

	await foundParkingLot.save();

	req.flash('success', 'Successfully updated the parking lot!');
	res.redirect(`/parkingLots/${id}`);
}

module.exports.deleteParkingLot = async (req, res) => {
	await ParkingLot.findByIdAndDelete(req.params.id);

	req.flash('success', 'Successfully deleted the parking lot!');
	res.redirect('/parkingLots');
}