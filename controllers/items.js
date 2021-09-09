const Item = require('../models/item');
const User = require('../models/user');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
	const {qCategory, qSearchBar} = req.query;
	if(qCategory){
		const search = qCategory;
		const regex = new RegExp(search, 'i');
		const items = await Item.find({category: {$regex : regex}})
			.populate({
				path: 'reviews',
				populate: {
					path: 'rating'
				}
			});
		res.render('items/index', { items , search });
	}else if(qSearchBar){
		const searchData = qSearchBar;
		const regex = new RegExp(searchData, 'i');
		const items = await Item.find({title: {$regex : regex}})
			.populate({
				path: 'reviews',
				populate: {
					path: 'rating'
				}
			});
		const search = `search result: ${searchData}`;
		res.render('items/index', { items , search });
	}else{
		const items = await Item.find({})
			.populate({
				path: 'reviews',
				populate: {
					path: 'rating'
				}
			});
		const search = "All Items"
		res.render('items/index', { items , search });
	}
};

module.exports.renderNewForm = (req, res) => {
	res.render('items/new');
};

module.exports.createNewItem = async (req, res) => {
	const item = new Item(req.body.item);
	item.images = req.files.map(f => ({url : f.path ,filename: f.filename}));
	item.author = req.user._id;
	await item.save();
	req.flash('success', 'Successfully make a new item!!');
	res.redirect(`/items/${item._id}`);
};

module.exports.renderItem = async (req, res) => {
	const { id } = req.params;
	const item = await Item.findById(id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author'
			}
		})
		.populate('author');
	if (!item) {
		req.flash('error', 'cannot find that item!!');
		return res.redirect('/items');
	}
	res.render('items/show', { item });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const item = await Item.findById(id);
	if (!item) {
		req.flash('error', 'cannot find that item!!');
		return res.redirect('/items');
	}
	res.render('items/edit', { item });
};

module.exports.updateItem = async (req, res) => {
	const { id } = req.params;
	const item = await Item.findByIdAndUpdate(id, { ...req.body.item });
	if(req.files.length > 0){
		const imgs = req.files.map(f => ({url : f.path ,filename: f.filename}));
		item.images.push(...imgs);
	}
	await item.save();
	if(req.body.deleteImages){
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename);
		}
		await item.updateOne({$pull : { images : { filename : {$in : req.body.deleteImages} } } });
	}
	req.flash('success', 'successfully update item');
	res.redirect(`/items/${item._id}`);
};

module.exports.deleteItem = async (req, res) => {
	const { id } = req.params;
	const item = await Item.findByIdAndDelete(id);
	const user = await User.updateMany( {} ,{$pull : {shoppingCart : { item : item}}});
	for(let image of item.images){
		await cloudinary.uploader.destroy(image.filename);
	}
	req.flash('success', 'Successfully deleted item!');
	res.redirect('/items');
};

module.exports.addItemToShoppingCart = async (req ,res) => {
	const {userId ,id} = req.params;
	const {amount} = req.body;
	const user = await User.findById(userId)
	const item = await Item.findById(id);
	user.shoppingCart.push({item , amount: amount});
	user.save();
	req.flash('success', 'successfully add in to shopping cart');
	res.redirect(`/items/${id}`);
}
