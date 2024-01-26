const express = require('express');
const router = express.Router();


const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
    showStatsOrders
  } = require('../controllers/Order');


router.route('/').post( createOrder);

router.route('/').get(getAllOrders);


router.route('/showstats').get( showStatsOrders);


router.route('/showAllMyOrders').get( getCurrentUserOrders);

router.route('/:id').get(getSingleOrder);

router.route('/:id').patch( updateOrder);


module.exports = router;