const express = require('express');
const router = express.Router();
const {
    getAllCart,
    updateCartItem,
    deleteItem,
    createItem,
    downCartItem
} = require('../controllers/Cart');


router.route('/').post(createItem);
router.route('/').get(getAllCart);
router.route('/up/:id').patch(updateCartItem);
router.route('/down/:id').patch(downCartItem);
router.route('/:id').delete(deleteItem);



module.exports = router;