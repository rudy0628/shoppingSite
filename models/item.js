const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/c_fill,w_500,h_200');
})


const ItemSchema = new Schema({
	title: String,
	images: [ImageSchema],
	price: Number,
	description: String,
	category: String,
	date: {
		type:Date,
		default: Date.now
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
});

//*********findByIdAndUpdate middleware**********
//*********delete the review, if which item was delete**********
ItemSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		});
	}
});

module.exports = mongoose.model('Item', ItemSchema);
