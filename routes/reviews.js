// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn, validate, isReviewAuthor } = require('../middleware');

// Controllers
const reviews = require('../controllers/reviews');

router.route('/')
    .post(
        isLoggedIn,
        validate('Review'),
        catchAsync(reviews.createReview)
    )

router.route('/:reviewId/edit')
    .get(
        isLoggedIn,
        catchAsync(isReviewAuthor),
        catchAsync(reviews.renderEdit)
    )

router.route('/:reviewId/like')
    .post(
        isLoggedIn,
        catchAsync(reviews.toggleReview),
    );

router.route('/:reviewId/')
    .put(
        isLoggedIn,
        catchAsync(isReviewAuthor),
        validate('Review'),
        catchAsync(reviews.updateReview)
    )
    .delete(
        isLoggedIn,
        catchAsync(isReviewAuthor),
        catchAsync(reviews.deleteReview)
    );

module.exports = router;