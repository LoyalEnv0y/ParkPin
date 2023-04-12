const express = require('express');
const router = express.Router({ mergeParams: true });

const ParkingLot = require('../models/parkingLot');
const Review = require('../models/review');

router.post('/', async (req, res) => {
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

    res.redirect(`/parkingLots/${id}`);
});

router.delete('/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;

    await ParkingLot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/parkingLots/${id}`)
});

module.exports = router;