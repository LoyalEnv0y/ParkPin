// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

// Controllers
const reviews = require('../controllers/reviews');

router.route('/')
    .post(
        isLoggedIn,
        validateReview,
        catchAsync(reviews.createReview)
    )

router.route('/:reviewId/edit')
    .get(
        isLoggedIn,
        catchAsync(isReviewAuthor),
        catchAsync(reviews.renderEdit)
    )

router.route('/:reviewId/')
    .put(
        isLoggedIn,
        catchAsync(isReviewAuthor),
        validateReview,
        catchAsync(reviews.updateReview)
    )
    .delete(
        isLoggedIn,
        catchAsync(isReviewAuthor),
        catchAsync(reviews.deleteReview)
    );

module.exports = router;