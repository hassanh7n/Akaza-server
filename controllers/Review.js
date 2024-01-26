const Review = require('../model/Review');
const Product = require('../model/Product');
const User = require('../model/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');



const createReview = async(req, res) => {

    const {product : productId} = req.body;

    const isvalidProduct = await Product.findOne({_id : productId});
    
    if(!isvalidProduct){
        throw new CustomError.NotFoundError(`No product with this id:${productId}`)
    };

    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
      });

      if (alreadySubmitted) {
        throw new CustomError.BadRequestError(
          'Already submitted review for this product'
        );
      }


    req.body.user = req.user.userId;
    const user = await User.findOne({_id : req.body.user});
    console.log(user.name);

    const review = await Review.create(req.body);

      const name = user.name

    res.status(StatusCodes.CREATED).json({
        review,
        name
    })
}


const getAllreviews = async(req, res) => {
    const review = await Review.find({}).populate({
        path: 'product',
        select: 'name company price',
    })

    res.status(StatusCodes.OK).json({
        review, count: review.length
    })
};


const getSingleReviews = async(req, res) => {
    const { id : reviewId } = req.params;

    const review = await Review.findOne({
        _id : reviewId
    });
    if(!review){
        throw new CustomError.NotFoundError(`No review with this id : ${reviewId}`)
    };


    res.status(StatusCodes.OK).json({
        review
    })
};

const updateReview = async(req, res) => {
    const {id : reviewId} = req.params;
    const {rating, title, comment} = req.body;

    const review = await Review.findOne({_id : reviewId});
    if(!review){
        throw new CustomError.NotFoundError(`No review with this id : ${reviewId}`)
    };
    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    res.status(StatusCodes.OK).json({ review });
};


const deleteReview = async(req, res) => {
    const { id : reviewId } = req.params;

    const review = await Review.findOne({_id : reviewId});
    if(!review){
        throw new CustomError.NotFoundError(`No review with this id : ${reviewId}`)
    };
    checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({
        msg: 'Success! Review removed'
    })


    res.status(StatusCodes.OK).json({
        msg : "deelete Review"
    })
};

const getSingleProductReview = async(req, res) => {

    res.status(StatusCodes.OK).json({
        msg : "GetSingleProductReview"
    })
};


module.exports = {
    createReview,
    getAllreviews,
    getSingleReviews,
    updateReview,
    deleteReview,
    getSingleProductReview,
}