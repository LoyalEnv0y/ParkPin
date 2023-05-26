// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Middleware
const { isLoggedIn, validate } = require('../middleware');

// Controller
const reservation = require('../controllers/reservations');

// Utils
const catchAsync = require('../utils/catchAsync');

router.route('/')
	.get(
		isLoggedIn,
		catchAsync(reservation.renderIndex)
	)
	.post(
		isLoggedIn,
		validate('Reservation'),
		catchAsync(reservation.createReservation)
	)

module.exports = router;