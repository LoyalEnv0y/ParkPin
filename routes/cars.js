// Express
const express = require('express');
const router = express.Router();

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn, isCarOwner, validateCar } = require('../middleware')

// Controllers
const cars = require('../controllers/cars');

router.route('/')
	.get(
		isLoggedIn,
		catchAsync(cars.renderIndex)
	)
	.post(
		isLoggedIn,
		catchAsync(cars.createCar)
	)

router.route('/new')
	.get(
		isLoggedIn,
		cars.renderNew
	)

router.route('/:id')
	.put(
		isLoggedIn,
		catchAsync(isCarOwner),
		validateCar,
		cars.updateCar
	)
	.delete(
		isLoggedIn,
		validateCar,
		catchAsync(cars.deleteCar)
	)

router.route('/:id/edit')
	.get(
		isLoggedIn,
		catchAsync(isCarOwner),
		cars.renderEdit
	)

module.exports = router;