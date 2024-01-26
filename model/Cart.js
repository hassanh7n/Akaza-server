const mongoose = require('mongoose');


const CartModel = new mongoose.Schema({
    title : {
        type : String,
        required : [true, "Please provide title"]
    },
    price : {
        type : Number,
        required : [true, "Please provide price"]
    },
    img : {
        type : String,
        required : true,
    },
    amount : {
        type : Number,
        required : true,
        default : 1
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
})



module.exports = mongoose.model('Cart', CartModel);