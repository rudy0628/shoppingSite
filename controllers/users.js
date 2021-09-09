const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
	res.render('users/register');
};

module.exports.createNewUser = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		//using register form passport module to create the hash password
		const registeredUser = await User.register(user, password);
		//create an user, after that, login in it
		req.login(registeredUser, err => {
			if (err) return next(err);
			req.flash('success', 'Welcome to ShoppingSite!');
			res.redirect('/items');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

module.exports.renderLoginPage = (req, res) => {
	res.render('users/login');
};

module.exports.login = async (req, res) => {
	req.flash('success', 'welcome back');
	const redirectUrl = req.session.returnTo || '/items';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye!');
	res.redirect('/items');
};

module.exports.renderShoppingCart = async(req, res) => {
	const {userId} = req.params;
	const user = await User.findById(userId)
	.populate({
		path: 'shoppingCart',
		populate:{
			path: 'item',
		}
	});
	res.render('users/shoppingCart', { user });
}

module.exports.checkOutShoppingCart = async(req ,res) => {
	const {userId} = req.params;
	const user = await User.findById(userId);
	user.shoppingCart = [];
	user.save();
	req.flash('success', 'successfully checkOut');
	res.redirect('/items');
}

module.exports.updateShoppingCart = async(req ,res) => {
	const {userId ,cartId} = req.params;
	const {amount} = req.body;
	const user = await User.findById(userId);
	for(let cartItem of user.shoppingCart){
		if(cartItem._id.equals(cartId)){
			cartItem.amount = amount;
			user.save();
		}
	}
	res.redirect(`/shoppingCart/${userId}`);
}

module.exports.deleteShoppingCart = async(req ,res) => {
	const {userId, cartId} = req.params;
	await User.findByIdAndUpdate(userId, {$pull : {shoppingCart : { _id : cartId}}});
	req.flash('successfully remove item from shopping cart');
	res.redirect(`/shoppingCart/${userId}`);
}