const ParkingLot = require('./models/parkingLot');
const Review = require('./models/review');
const Car = require('./models/car');
const { parkingLotJOI, reviewJOI, userJOI, carJOI, reservationJOI } = require('./utils/JoiSchemas');
const AppError = require('./utils/AppError');

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must be signed in');
		res.redirect('/login');
		return;
	};

	next();
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;

	const foundParkingLot = await ParkingLot.findById(id);

	if (!foundParkingLot.owner.equals(req.user._id)) {
		req.flash('error', 'You do not have the permission to do that!');
		return res.redirect(`/parkingLots/${id}`);
	}

	next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;

	const foundReview = await Review.findById(reviewId);

	if (!foundReview.author.equals(req.user._id)) {
		req.flash('error', 'You do not have the permission to do that!');
		return res.redirect(`/parkingLots/${id}`);
	}

	next();
}

module.exports.isCarOwner = async (req, res, next) => {
	const { id } = req.params;
	const foundCar = await Car.findById(id);

	if (!foundCar.owner.equals(req.user._id)) {
		req.flash('error', 'You do not have the permission to do that!');
		return res.redirect(`/cars`);
	}

	next();
}

module.exports.validate = (modelName) => {
	return (req, res, next) => {
		let error = "";

		switch (modelName) {
			case 'Car':
				error = carJOI.validate(req.body).error;
				break;
			case 'ParkingLot':
				error = parkingLotJOI.validate(req.body).error;
				break;
			case 'Review':
				error = reviewJOI.validate(req.body).error;
				break;
			case 'User':
				error = userJOI.validate(req.body).error;
				break;
			case 'Reservation':
				error = reservationJOI.validate(req.body).error;
				break;
		}

		if (error) {
			const msg = error.details.map(el => el.message).join(',');
			throw new AppError(msg, 400);
		} else {
			next();
		}
	}
}