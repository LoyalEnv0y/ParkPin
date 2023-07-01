const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = joi => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': '{{#label}} must not include HTML!'
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHTML(value, {
					allowedTags: [],
					allowedAttributes: {},
				});

				if (clean !== value) return helpers.error('string.escapeHTML', { value });
				return clean;
			}
		}
	}
});

const Joi = BaseJoi.extend(extension);

module.exports.parkingLotJOI = Joi.object({
	parkingLot: Joi.object({
		name: Joi.string().required().escapeHTML(),
		city: Joi.string().required().escapeHTML(),
		province: Joi.string().required().escapeHTML(),
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
		title: Joi.string().required().escapeHTML(),
		body: Joi.string().required().escapeHTML()
	}).required()
});

const currentDate = new Date();
const highDateLimit = new Date().setFullYear(currentDate.getFullYear() - 18);
const lowDateLimit = new Date().setFullYear(currentDate.getFullYear() - 80);

module.exports.userJOI = Joi.object({
	user: Joi.object({
		username: Joi.string().required().escapeHTML(),
		email: Joi.string().required().escapeHTML(),
		password: Joi.string().required().escapeHTML(),
		birthDate: Joi.date().less(highDateLimit).greater(lowDateLimit).required(),
		// profilePicLink: Joi.string().required(),
		phoneNumber: Joi.string().regex(/^[0-9]+$/).required().escapeHTML(),
		citizenID: Joi.string().regex(/^[0-9]{11}$/).required().escapeHTML(),
	}).required()
});

module.exports.carJOI = Joi.object({
	car: Joi.object({
		brand: Joi.string().required().escapeHTML(),
		model: Joi.string().required().escapeHTML(),
		hasLPG: Joi.string().valid('on', '').escapeHTML(),
		description: Joi.string().allow('').escapeHTML()
	}).required()
});

module.exports.reservationJOI = Joi.object({
	reservation: Joi.object({
		pricePairId: Joi.string().required().escapeHTML(),
		slotId: Joi.string().required().escapeHTML(),
		carId: Joi.string().required().escapeHTML(),
		time: Joi.string().required().escapeHTML(),
	}).required()
});