// Models
const ParkingLot = require('../models/parkingLot');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
	const id = req.params.id;
	const review = req.body.review;
	const foundParkingLot = await ParkingLot.findById(id);

	const newReview = new Review({
		title: review.title,
		body: review.body,
		rating: review.rating,
		author: req.user._id
	});

	foundParkingLot.reviews.push(newReview);

	await newReview.save();
	await foundParkingLot.save();

	req.flash('success', 'Created a new review!');
	res.redirect(`/parkingLots/${id}#reviews`);
}

module.exports.renderEdit = async (req, res) => {
	const { id, reviewId } = req.params;

	const foundReview = await Review.findById(reviewId);

	res.render('reviews/show.ejs', { title: 'ParkPin | Edit Review', review: foundReview, id });
}

module.exports.updateReview = async (req, res) => {
	const { id, reviewId } = req.params;

	const foundReview = await Review.findByIdAndUpdate(reviewId, { ...req.body.review }, { runValidators: true });
	await foundReview.save();

	console.log(foundReview);

	req.flash('success', 'Successfully edited your review!');
	res.redirect(`/parkingLots/${id}#reviews`);
}

module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;

	await ParkingLot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);

	req.flash('success', 'Deleted the review!');
	res.redirect(`/parkingLots/${id}#reviews`)
}