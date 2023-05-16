const Joi = require('joi');

module.exports.parkingLotSchema = Joi.object({
	parkingLot: Joi.object({
		name: Joi.string().required(),
		city: Joi.string().required(),
		province: Joi.string().required(),
		pictureLink: Joi.string().required(),
		floors: Joi.string().regex(/^\s*\d+\s*-\s*\d+\s*$/),
		priceTable: Joi.string().regex(/^\s*\d+\s*-\s*\d+\s*=\s*\d+\s*$/)
	}).required(),
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		rating: Joi.number().min(1).max(5).required(),
		title: Joi.string().required(),
		body: Joi.string().required()
	}).required()
});

const currentDate = new Date();
const highDateLimit = new Date().setFullYear(currentDate.getFullYear() - 18);
const lowDateLimit = new Date().setFullYear(currentDate.getFullYear() - 80);

module.exports.userSchema = Joi.object({
	user: Joi.object({
		username: Joi.string().required(),
		email: Joi.string().required(),
		password: Joi.string().required(),
		birthDate: Joi.date().less(highDateLimit).greater(lowDateLimit).required(),
		profilePicLink: Joi.string().required(),
		phoneNumber: Joi.string().required(),
		citizenID: Joi.string().required(),
	}).required()
});