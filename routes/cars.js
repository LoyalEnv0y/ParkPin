// Express
const express = require('express');
const router = express.Router();

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn } = require('../middleware')

// Controllers
const cars = require('../controllers/cars');

router.route('/')
	.get(
		isLoggedIn,
		cars.renderIndex
	)

router.route('/new')
	.get(
		isLoggedIn,
		cars.renderNew
	)

module.exports = router;