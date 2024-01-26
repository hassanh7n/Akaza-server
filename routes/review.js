const express = require('express');
const router = express.Router();


const {
    createReview,
    getAllreviews,
    getSingleReviews,
    updateReview,
    deleteReview,
    getSingleProductReview,
} = require('../controllers/Review');

router.route('/').post(createReview);

router.route('/').get(getAllreviews);

router.route('/:id').get(getSingleReviews);

router.route('/:id').patch(updateReview);

router.route('/:id').delete( deleteReview);


module.exports = router;