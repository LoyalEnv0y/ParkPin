// Express
const express = require('express');
const router = express.Router();

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn, isAuthor, validate } = require('../middleware');

// Controllers
const parkingLots = require('../controllers/parkingLots')

// Multer
const multer = require('multer')
const { storage } = require('../cloudinary/parkingLotStorage');
const upload = multer({ storage })

router.route('/')
	.get(catchAsync(parkingLots.renderIndex))
	.post(
		isLoggedIn,
		upload.array('image'),
		validate('ParkingLot'),
		catchAsync(parkingLots.createParkingLot)
	);

router.route('/new')
	.get(
		isLoggedIn,
		parkingLots.renderNew
	);

router.route('/:id')
	.get(catchAsync(parkingLots.renderShow))
	.put(
		isLoggedIn,
		catchAsync(isAuthor),
		upload.array('image'),
		validate('ParkingLot'),
		catchAsync(parkingLots.updateParkingLot)
	)
	.delete(
		isLoggedIn,
		catchAsync(isAuthor),
		catchAsync(parkingLots.deleteParkingLot)
	);

router.route('/:id/edit')
	.get(
		isLoggedIn,
		catchAsync(isAuthor),
		catchAsync(parkingLots.renderEdit)
	);

module.exports = router;