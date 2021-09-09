const Item = require('../models/item');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
	const item = await Item.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	item.reviews.push(review);
	await review.save();
	await item.save();
	req.flash('success', 'Successfully created a review!');
	res.redirect(`/items/${item._id}`);
};

module.exports.deleteReview = async (req, res) => {
	const { reviewId, id } = req.params;
	await Item.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Successfully deleted a review!');
	res.redirect(`/items/${id}`);
};
