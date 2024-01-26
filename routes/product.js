const express = require('express');
const router = express.Router();



const {
    createProduct,
    getAllProducts,
    singleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    uploadImage1,
    showStats,
    uploadImage3,
    uploadImage4,
    uploadImage5
} = require('../controllers/Product');
const {showStatsOrders} = require('../controllers/Order')


router.route('/').get( getAllProducts);
router.route('/').post( createProduct);
router.route('/uploadImage1').post(uploadImage);
router.route('/uploadImage2').post(uploadImage1);
router.route('/uploadImage3').post(uploadImage3);
router.route('/uploadImage4').post(uploadImage4);
router.route('/uploadImage5').post(uploadImage5);
router.route('/showStats').get( showStats);
router.route('/:id').get( singleProduct);
router.route('/:id').patch(updateProduct);
router.route('/:id').delete( deleteProduct);





module.exports = router;