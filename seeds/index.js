const mongoose = require('mongoose');
const { items, categories } = require('./seedHelpers');
const Item = require('../models/item');

//*********mongodb connect**********
mongoose.connect('mongodb://localhost:27017/shoppingSite', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

//*********random simple to give items and categories**********
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Item.deleteMany({});
	for (let i = 0; i < 20; i++) {
		const price = Math.floor(Math.random() * 20) + 10;
		const item = new Item({
			author: '6134893c2e0e9b32995b8b6a',
			title: `${sample(items)}`,
			price: price,
			description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit iste, cum enim quo deserunt accusantium debitis at officiis eum obcaecati assumenda ex eveniet tempore soluta dolore amet laborum culpa numquam.',
			category: `${sample(categories)}`,
			images: [
				{
					url: 'https://res.cloudinary.com/dz50afcaa/image/upload/v1630907251/shoppingSite/bqjw3xfkfkqog6hduubs.jpg',
					filename: 'shoppingSite/bqjw3xfkfkqog6hduubs'
				},
				{
					url: 'https://res.cloudinary.com/dz50afcaa/image/upload/v1630907251/shoppingSite/kzccv6dwgah6z5ydeg6n.jpg',
					filename: 'shoppingSite/kzccv6dwgah6z5ydeg6n'
				}
			]
		});
		await item.save();
	}
};

//*********close mongodb connect**********
seedDB().then(() => {
	mongoose.connection.close();
});
