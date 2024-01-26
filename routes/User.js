const express = require('express');
const router = express.Router();

const {
    getAllUser,
    getSingleUser,
    updateUser,
    updatePassword,
    showCurrentUser,
    resetPassword
} = require('../controllers/User');


router.route('/').get( getAllUser);
router.route('/showMe').get(showCurrentUser);
router.route('/:id').get(getSingleUser);
router.route('/updateUser').patch(updateUser);
router.route('/updateUserPassword').patch( updatePassword);


module.exports = router;
