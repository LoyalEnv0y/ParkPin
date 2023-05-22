const Car = require('../models/car');
const User = require('../models/user');

const carsBrandsAndModels = require('../seeds/CarBrandsAndModels.json');


module.exports.renderIndex = async (req, res) => {
	const user = await User.findById(req.user._id)
		.populate('cars');
	res.render('cars/index', {
		title: 'ParkPin | Your Cars',
		user
	});
}

module.exports.renderNew = (req, res) => {
	res.render('cars/new', {
		title: 'ParkPin | Add a Car',
		cars: carsBrandsAndModels
	})
}

module.exports.createCar = async (req, res) => {
	const car = req.body.car;

	const newCar = new Car({
		brand: car.brand,
		model: car.model,
		hasLPG: car.hasLPG === 'on',
		description: car.description,
		owner: req.user._id
	});

	await newCar.save();

	await User.findByIdAndUpdate(
		req.user._id,
		{ $push: { cars: newCar._id } }
	);

	req.flash('success', 'Your car has successfully been added!');
	res.redirect('/cars');
}

module.exports.renderEdit = async (req, res) => {
	const { id } = req.params;
	const foundCar = await Car.findById(id);

	res.render('cars/edit', {
		title: 'ParkPin | Edit a Car',
		currentCar: foundCar,
		cars: carsBrandsAndModels
	});
}

module.exports.updateCar = async (req, res) => {
	const { id } = req.params;
	const updatedCar = req.body.car;

	await Car.findByIdAndUpdate(
		id,
		{
			brand: updatedCar.brand,
			model: updatedCar.model,
			hasLPG: updatedCar.hasLPG === 'on',
			description: updatedCar.description
		}
	);

	req.flash('Your car has been saved!');
	res.redirect('/cars');
}

module.exports.deleteCar = async (req, res) => {
	const { id } = req.params;
	const user = await User.findById(req.user._id);
	const deletedCar = await Car.findByIdAndDelete(id);

	await user.updateOne({ $pull: { cars: deletedCar._id } })

	await user.save();

	req.flash('success', 'Your car has been deleted');
	res.redirect('/cars');
}