const HourPricePair = require('../models/hourPricePair');
const AppError = require('./AppError');

/*
Creates new pricePairs with the given arrays. Saves the pairs and returns them.
*/
module.exports.createPrices = async (startHours, endHours, prices) => {
	const length = startHours.length;
	if (endHours.length != length || prices.length != length) {
		throw new AppError('All sets of prices must be filled');
	}

	const priceTables = [];

	for (let i = 0; i < length; i++) {
		const newHourPricePair = new HourPricePair({
			start: startHours[i],
			end: endHours[i],
			price: prices[i]
		});

		priceTables.push(newHourPricePair.save());
	}

	return await Promise.all(priceTables);
}