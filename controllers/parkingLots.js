// Models
const ParkingLot = require('../models/parkingLot');
const HourPricePair = require('../models/hourPricePair')
const Floor = require('../models/floor');
const Slot = require('../models/slot');

// Util
const AppError = require('../utils/AppError');

// Data
const CitiesAndProvinces = require('../seeds/CitiesAndProvinces.json');

/*
If there are any floors with the same number as the user inputted, 
this function will delete the floor with that number so that the floor
with the same number can be registered elsewhere.
*/
const handleDuplicateFloors = async (newFloorNum, oldFloors) => {
	for (let floor of oldFloors) {
		if (floor.floorNum == newFloorNum) {
			await Floor.findByIdAndDelete(floor._id);
		}
	}
}

/*
Takes data from the user input and normalizes it to some capacity. 
Calls createFloor() function to fill the floors and returns them.
*/
const parseAndCreateFloors = async (data, parkingLot) => {
	const floors = [];
	const chunks = data.split(',');

	for (let i = 0; i < chunks.length; i++) {
		let chunk = chunks[i];
		chunk = chunk.replace(/\s+/g, '');

		const pair = chunk.split('-');
		const createdFloor = await createFloor(pair[0], pair[1], parkingLot);

		await handleDuplicateFloors(createdFloor.floorNum, floors);

		floors.push(createdFloor);
	}

	return floors;
}

/*
Creates and returns a new floor with the given data.
Calls createSlots() function to fill in the slots of those floors.
*/
const createFloor = async (floorNum, slotCount, parkingLot) => {
	const newFloor = new Floor({
		slots: await createSlots(slotCount, floorNum, parkingLot),
		floorNum: floorNum
	})

	await newFloor.save()

	return newFloor;
}

/*
Creates and returns an array of new slots with the given data.
*/
const createSlots = async (slotCount, floorNum, parkingLot) => {
	const createdSlots = [];

	for (let i = 0; i < slotCount; i++) {
		const newSlot = new Slot({
			isFull: false,
			floorNum: floorNum,
			locatedAt: parkingLot
		});

		createdSlots.push(newSlot.save())
	}

	return await Promise.all(createdSlots);
}

/*
If there are any pricePairs with the same start or end value, this
function will delete the pair with that start or end value so that
the pair with the same values can be registered elsewhere.
*/
const handleDuplicateHourPricePairs = async (newPair, parkingLot) => {
	const currentTable = parkingLot.priceTable

	for (let pricePair of currentTable) {
		if (pricePair.start == newPair.start || pricePair.end == newPair.end) {
			await HourPricePair.findByIdAndDelete(pricePair._id);
		}
	}
}

/*
Separates the data taken by the user to chunks and for each chunk,
creates a new pricePair. It then calls handleDuplicateHourPricePairs()
to remove any old pricePairs with the same values. Finally saves the 
pairs and returns them.
*/
const parseAndCreateHourPricePairs = async (data, parkingLot) => {
	const priceTables = [];
	const chunks = data.split(',');

	for (let i = 0; i < chunks.length; i++) {
		let chunk = chunks[i];
		chunk = chunk.replace(/\s+/g, '');

		const [start, rest] = chunk.split('-');
		const [end, price] = rest.split('=');

		const newHourPricePair = new HourPricePair({
			start,
			end,
			price
		});

		await handleDuplicateHourPricePairs(newHourPricePair, parkingLot);

		priceTables.push(newHourPricePair.save());
		parkingLot.priceTable.push(newHourPricePair);
	}

	await parkingLot.save();
	return await Promise.all(priceTables);
}

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
	newLot.floors = await parseAndCreateFloors(parkingLot.floors, newLot);
	newLot.priceTable = await parseAndCreateHourPricePairs(parkingLot.priceTable, newLot)


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