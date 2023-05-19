const HourPricePair = require('../models/hourPricePair')

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
module.exports.parseAndCreateHourPricePairs = async (data, parkingLot) => {
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