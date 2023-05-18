const Joi = require('joi');

module.exports.parkingLotJOI = Joi.object({
	parkingLot: Joi.object({
		name: Joi.string().required(),
		city: Joi.string().required(),
		province: Joi.string().required(),
		pictureLink: Joi.string().required(),
		floors: Joi.string().regex(/^\s*\d+\s*-\s*\d+(?:,\s*\d+\s*-\s*\d+)*\s*$/),
		priceTable: Joi.string().regex(/^\s*\d+\s*-\s*\d+\s*=\s*\d+(?:,\s*\d+\s*-\s*\d+\s*=\s*\d+)*\s*$/)
	}).required(),
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
		profilePicLink: Joi.string().required(),
		phoneNumber: Joi.string().regex(/^[0-9]+$/).required(),
		citizenID: Joi.string().regex(/^[0-9]{11}$/).required(),
	}).required()
});