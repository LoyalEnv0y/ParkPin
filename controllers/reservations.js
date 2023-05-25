const ParkingLot = require('../models/parkingLot');

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

	console.log(foundParkingLot)

	res.render('reservation/index', {
		title: 'ParkPin | Reservation',
		parkingLot: foundParkingLot
	});
}

