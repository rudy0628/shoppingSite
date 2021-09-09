const { itemSchema, reviewSchema, shoppingCartSchema } = require('./schemas.js');
const Item = require('./models/item');
const Review = require('./models/review');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');

//*********check login form for mongoose**********
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'you must be sign in!!');
		return res.redirect('/login');
	}
	next();
};

//*********validate the item form for mongoose**********
module.exports.validateItem = (req, res, next) => {
	const { error } = itemSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//*********check the author is current User**********
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const item = await Item.findById(id);
	if (!item.author.equals(req.user._id)) {
		req.flash('error', 'you do not have permission to do that!!');
		return res.redirect(`/items/${id}`);
	}
	next();
};

//*********validate review form for mongoose**********
module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//*********check the author is current User**********
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'you do not have permission to do that!!');
		return res.redirect(`/items/${id}`);
	}
	next();
};

//*********check if is current user**********
module.exports.isCurrentUser = async(req ,res ,next) => {
	const { userId } = req.params;
	const user = await User.findById(userId);
	if(!user._id.equals(res.locals.currentUser._id)){
		req.flash('error', 'you do not have permission to do that!!');
		return res.redirect('/items');
	}
	next();
}

module.exports.isItemInShoppingCart = async(req ,res ,next) => {
	const {id ,userId} = req.params;
	const item = await Item.findById(id);
	const user = await User.findById(userId);
	for(let cartItem of user.shoppingCart){
		if(cartItem.item.equals(item._id)){
			req.flash('error', 'the Item is in you shopping cart!!');
			return res.redirect(`/items/${id}`);
		}
	}
	next();
}

//*********validate review form for mongoose**********
// module.exports.validateItemAmount = (req, res, next) => {
// 	const { error } = shoppingCartSchema.validate(req.body);
// 	if (error) {
// 		const msg = error.details.map(el => el.message).join(',');
// 		throw new ExpressError(msg, 400);
// 	} else {
// 		next();
// 	}
// };
