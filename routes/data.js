const express = require('express');
const router = express.Router();

const data = require('../controllers/data');

const catchAsync = require('../utils/catchAsync');

router.route('/citiesAndProvinces')
	.get(data.getCityData)

router.route('/carBrandsAndModels')
	.get(data.getCarData)

router.route('/reviewLikeCheck')
	.post(catchAsync(data.reviewIsLikedBy))

module.exports = router;
