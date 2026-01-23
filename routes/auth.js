const express = require('express');
const router = express.Router();


const {
    register,
    logIn,
    logOut,
    forgotPassword,
    resetPassword
} = require('../controllers/auth');


router.route('/register').post(register);
router.route('/login').post(logIn);
router.route('/logout').get(logOut);
router.patch("/reset-password/:token", resetPassword);
router.post('/forgot-password', forgotPassword);
module.exports = router;