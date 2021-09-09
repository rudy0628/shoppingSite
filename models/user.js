const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	shoppingCart: [{
		item:{
			type: Schema.Types.ObjectId,
			ref: 'Item',
		},
		amount: {
			type: Number,
			min: 1, 
			max: 999,
			required: true
		}
	}],
});

//use passport Local Mongoose plugin to use extend module!
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
