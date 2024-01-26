const express = require('express');
const router = express.Router();


const {
    register,
    logIn,
    logOut
} = require('../controllers/auth');
const {
    resetPassword
} = require('../controllers/User');


router.route('/register').post(register);
router.route('/login').post(logIn);
router.route('/logout').get(logOut);
router.route('/resestPassword').patch(resetPassword);

module.exports = router;