// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Middleware
const { isLoggedIn } = require('../middleware');

// Controller
const reservation = require('../controllers/reservations');

// Utils
const catchAsync = require('../utils/catchAsync');

router.route('/')
	.get(
		// isLoggedIn,
		catchAsync(reservation.renderIndex)
	)

module.exports = router;