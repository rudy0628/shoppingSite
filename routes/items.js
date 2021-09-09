const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, validateItem, isAuthor, isCurrentUser , isItemInShoppingCart} = require('../middleware.js');

const items = require('../controllers/items');

const { storage } = require('../cloudinary');
const multer  = require('multer');
const upload = multer({ storage });

//*********post item action, item index page**********
router.route('/')
    .get(catchAsync(items.index))
    .post(isLoggedIn, upload.array('image', 10), validateItem, catchAsync(items.createNewItem));


//*********create new item page**********
router.get('/new', isLoggedIn, items.renderNewForm);


//*********item details page ,item update action, item delete action**********
router.route('/:id')
    .get(catchAsync(items.renderItem))
    .put(isLoggedIn, isAuthor, upload.array('image', 10), validateItem, catchAsync(items.updateItem))
    .delete(isLoggedIn, isAuthor, catchAsync(items.deleteItem));


//*********item edit page**********
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(items.renderEditForm));

//*********add Item into shopping cart action**********
router.post('/:id/shoppingCart/:userId', isLoggedIn, isCurrentUser, isItemInShoppingCart, catchAsync(items.addItemToShoppingCart));


module.exports = router;
