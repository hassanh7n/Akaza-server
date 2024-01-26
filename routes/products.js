const express = require('express');
const router = express.Router();



const {
    getAllProducts,
    singleProduct,
} = require('../controllers/Product');


router.route('/').get( getAllProducts);
router.route('/:id').get( singleProduct);





module.exports = router;