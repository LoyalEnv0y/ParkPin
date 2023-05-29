const Floor = require('../models/floor');
const Slot = require('../models/slot');

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

		createdSlots.push(newSlot.save());
	}

	return await Promise.all(createdSlots);
}

/*
Creates and returns an array of floors with the given array of slot numbers.
Calls createSlots() function to fill in the slots of those floors.
*/
module.exports.createFloors = async (floors, parkingLot) => {
	const createdFloors = [];

	let i = 0;
	for (const floor of floors) {
		const newFloor = new Floor({
			slots: await createSlots(floor, i + 1, parkingLot),
			floorNum: i + 1
		})

		createdFloors.push(newFloor.save());
		i++;
	}

	return await Promise.all(createdFloors);
}