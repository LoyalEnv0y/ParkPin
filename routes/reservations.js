// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Middleware
const { isLoggedIn, validate, isReserver, isSlotAvailable } = require('../middleware');

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

router.route('/:stayId/activate')
	.post(
		isLoggedIn,
		catchAsync(isSlotAvailable),
		catchAsync(isReserver),
		catchAsync(reservation.activate)
	)

router.route('/:stayId/deactivate')
	.post(
		isLoggedIn,
		catchAsync(isReserver),
		catchAsync(reservation.deactivate)
	)

router.route('/:stayId')
	.delete(
		isLoggedIn,
		catchAsync(isReserver),
		catchAsync(reservation.delete)
	)

module.exports = router;