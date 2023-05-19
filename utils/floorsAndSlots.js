const Floor = require('../models/floor');
const Slot = require('../models/slot');

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
module.exports.parseAndCreateFloors = async (data, parkingLot) => {
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