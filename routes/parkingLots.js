const express = require('express');
const router = express.Router();

const CitiesAndProvinces = require('../seeds/CitiesAndProvinces.json');

const ParkingLot = require('../models/parkingLot');
const HourPricePair = require('../models/hourPricePair')
const Floor = require('../models/floor');
const Slot = require('../models/slot');

const handleDuplicateFloors = async (newFloorNum, oldFloors) => {
	if (oldFloors.length < 1) return;

	for (let floor of oldFloors) {
		if (floor.floorNum == newFloorNum) {
			await Floor.findByIdAndDelete(floor._id);
		}
	}
}

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

const createFloor = async (floorNum, slotCount, parkingLot) => {
	const newFloor = new Floor({
		slots: await createSlots(slotCount, floorNum, parkingLot),
		floorNum: floorNum
	})

	await newFloor.save()

	return newFloor;
}

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

const handleDuplicateHourPricePairs = async (newPair, parkingLot) => {
	const currentTable = parkingLot.priceTable

	if (currentTable.length < 1) return;

	for (let pricePair of currentTable) {
		if (pricePair.start == newPair.start && pricePair.end == newPair.end) {
			await HourPricePair.findByIdAndDelete(pricePair._id);
		}
	}
}

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

router.get('/', async (req, res) => {
	const allParkingLots = await ParkingLot.find({})
		.populate('owner');

	res.render('parkingLots/index', { title: 'ParkPin | All', ParkingLots: allParkingLots });
});

router.get('/new', (req, res) => {
	res.render('parkingLots/new', {
		title: 'ParkPin | New',
		cities: CitiesAndProvinces
	});
});

router.get('/:id', async (req, res) => {
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
});

router.get('/:id/edit', async (req, res) => {
	const foundParkingLot = await ParkingLot.findById(req.params.id);
	const [oldCity, oldProvince] = foundParkingLot.location.split(' - ');

	res.render('parkingLots/edit', {
		title: 'ParkPin | New',
		parkingLot: foundParkingLot,
		cities: CitiesAndProvinces,
		oldCity,
		oldProvince
	});
});

router.post('/', async (req, res) => {
	const parkingLot = req.body.parkingLot;
	const location = parkingLot.city + ' - ' + parkingLot.province;

	const newLot = new ParkingLot({
		name: (parkingLot.name) ? parkingLot.name : location + ' Parking Lot',
		location: location,
		pictureLink: parkingLot.pictureLink,
	});
	newLot.floors = await parseAndCreateFloors(parkingLot.floors, newLot);
	newLot.priceTable = await parseAndCreateHourPricePairs(parkingLot.priceTable, newLot)


	await newLot.save();

	res.redirect('/parkingLots');
});

router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const foundParkingLot = await ParkingLot.findById(id);
	const updatedLot = req.body.parkingLot;

	foundParkingLot.name = updatedLot.name;
	foundParkingLot.location = updatedLot.city + ' - ' + updatedLot.province;
	foundParkingLot.pictureLink = updatedLot.pictureLink;

	await foundParkingLot.save();
	res.redirect(`/parkingLots/${id}`);
});

router.delete('/:id', async (req, res) => {
	await ParkingLot.findByIdAndDelete(req.params.id);
	res.redirect('/parkingLots');
});

module.exports = router;