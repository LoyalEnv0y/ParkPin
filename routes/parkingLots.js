// Express
const express = require('express');
const router = express.Router();

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn, isAuthor, validateParkingLot } = require('../middleware');

// Controllers
const parkingLots = require('../controllers/parkingLots')

// Multer
const multer = require('multer')
const { storage } = require('../cloudinary/index');
const upload = multer({ storage })

router.route('/')
	.get(catchAsync(parkingLots.renderIndex))
	.post(
		isLoggedIn,
		upload.array('image'),
		validateParkingLot,
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
		isAuthor,
		validateParkingLot,
		catchAsync(parkingLots.updateParkingLot)
	)
	.delete(
		isLoggedIn,
		isAuthor,
		catchAsync(parkingLots.deleteParkingLot)
	);

router.route('/:id/edit')
	.get(
		isLoggedIn,
		isAuthor,
		catchAsync(parkingLots.renderEdit)
	);

module.exports = router;