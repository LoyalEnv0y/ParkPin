const express = require('express');
const router = express.Router({ mergeParams: true });

const ParkingLot = require('../models/parkingLot');
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, validateReview} = require('../middleware');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const id = req.params.id;
    const review = req.body.review;
    const foundParkingLot = await ParkingLot.findById(id);

    const newReview = new Review({
    	title: review.title,
    	body: review.body,
    	rating: review.rating,
    });

    foundParkingLot.reviews.push(newReview);

    await newReview.save();
    await foundParkingLot.save();

    req.flash('success', 'Created a new review!');
    res.redirect(`/parkingLots/${id}#comments`);
}));

router.delete('/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await ParkingLot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Deleted the review!');
    res.redirect(`/parkingLots/${id}#comments`)
}));

module.exports = router;