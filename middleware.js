const ParkingLot = require('./models/parkingLot');
const Review = require('./models/review');
const { parkingLotJOI, reviewJOI, userJOI } = require('./utils/JoiSchemas');

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
	const {id, reviewId} = req.params;
	
	const foundReview = await Review.findById(reviewId);

	if (!foundReview.author.equals(req.user._id)) {
		req.flash('error', 'You do not have the permission to do that!');
		return res.redirect(`/parkingLots/${id}`);
	}

	next();
}

module.exports.validateParkingLot = (req, res, next) => {
	const { error } = parkingLotJOI.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new AppError(msg, 400);
	} else {
		next();
	}
}

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewJOI.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new AppError(msg, 400);
	} else {
		next();
	}
}

module.exports.validateUser = (req, res, next) => {
	const { error } = userJOI.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new AppError(msg, 400);
	} else {
		next();
	}
}