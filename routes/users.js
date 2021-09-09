const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const {isLoggedIn , isCurrentUser} = require('../middleware.js');

const users = require('../controllers/users');

//*********create register action, create register page**********
router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.createNewUser));

//*********create login page**********
//*********submit login and validation password action**********
router.route('/login')
    .get(users.renderLoginPage)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//*********logout action*********
router.get('/logout', users.logout);

//*********render shopping cart*********
router.get('/shoppingCart/:userId', isLoggedIn, isCurrentUser, catchAsync(users.renderShoppingCart));

router.delete('/shoppingCart/:userId', isLoggedIn, isCurrentUser, catchAsync(users.checkOutShoppingCart));

//*********update shopping cart amount, delete shopping cart*********
router.route('/shoppingCart/:userId/:cartId')
    .patch(isLoggedIn, isCurrentUser,catchAsync(users.updateShoppingCart))
    .delete(isLoggedIn, isCurrentUser,catchAsync(users.deleteShoppingCart));

module.exports = router;
