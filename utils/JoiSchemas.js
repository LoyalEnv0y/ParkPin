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