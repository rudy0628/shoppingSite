const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

//*********use Joi to create the clear Schema require**********
module.exports.itemSchema = Joi.object({
	item: Joi.object({
		title: Joi.string().required().escapeHTML(),
		category: Joi.string().required().escapeHTML(),
		// image: Joi.string().required(),
		price: Joi.number().required().min(0),
		description: Joi.string().required().escapeHTML()
	}).required(),
	deleteImages:Joi.array()
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		body: Joi.string().required().escapeHTML(),
		rating: Joi.number().required().min(1).max(5)
	}).required()
});

// module.exports.shoppingCartSchema = Joi.object({
// 	shoppingCart: Joi.object({
// 		amount: Joi.number().required().max(1).max(999)
// 	}).required()
// });
