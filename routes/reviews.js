const express = require('express');
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');

const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');

//*********review post action**********
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//*********reviews post action**********
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
