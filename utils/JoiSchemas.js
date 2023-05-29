const Joi = require('joi');

module.exports.parkingLotJOI = Joi.object({
	parkingLot: Joi.object({
		name: Joi.string().required(),
		city: Joi.string().required(),
		province: Joi.string().required(),
		floors: Joi.array().items(Joi.number().min(1).max(300)).required(),
		startHours: Joi.array().items(Joi.number().min(0)).required(),
		endHours: Joi.array().items(Joi.number().min(1)).required(),
		prices: Joi.array().items(Joi.number().min(0).max(1000)).required(),
	}).required(),
	
	deleteImages: Joi.array()
});

module.exports.reviewJOI = Joi.object({
	review: Joi.object({
		rating: Joi.number().min(1).max(5).required(),
		title: Joi.string().required(),
		body: Joi.string().required()
	}).required()
});

const currentDate = new Date();
const highDateLimit = new Date().setFullYear(currentDate.getFullYear() - 18);
const lowDateLimit = new Date().setFullYear(currentDate.getFullYear() - 80);

module.exports.userJOI = Joi.object({
	user: Joi.object({
		username: Joi.string().required(),
		email: Joi.string().required(),
		password: Joi.string().required(),
		birthDate: Joi.date().less(highDateLimit).greater(lowDateLimit).required(),
		// profilePicLink: Joi.string().required(),
		phoneNumber: Joi.string().regex(/^[0-9]+$/).required(),
		citizenID: Joi.string().regex(/^[0-9]{11}$/).required(),
	}).required()
});

module.exports.carJOI = Joi.object({
	car: Joi.object({
		brand: Joi.string().required(),
		model: Joi.string().required(),
		hasLPG: Joi.string().valid('on', ''),
		description: Joi.string().allow('')
	}).required()
});

module.exports.reservationJOI = Joi.object({
	reservation: Joi.object({
		pricePairId: Joi.string().required(),
		slotId: Joi.string().required(),
		carId: Joi.string().required(),
		time: Joi.string().required(),
	}).required()
});