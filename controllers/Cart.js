const User = require('../model/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const Cart = require('../model/Cart');


const createItem = async(req, res) => {
    req.body.user = req.user.userId;
    const item = await Cart.create(req.body);
    res.status(StatusCodes.OK).json({ item});
}

const getAllCart = async(req, res) => {
    const cart = await Cart.find({ user: req.user.userId });

    res.status(StatusCodes.OK).json({ cart, count: cart.length });
};

const updateCartItem = async(req, res) => {

    const { id : itemId} = req.params;
    const item = await Cart.findOne({_id : itemId});
    if(!item){
        throw new CustomError.NotFoundError(`No product with this id${itemId}`);
    };
    item.amount = item.amount + 1;
    item.save();

    res.status(StatusCodes.OK).json({ item : item });
};

const downCartItem = async(req, res) => {

    const { id : itemId} = req.params;
    const item = await Cart.findOne({_id : itemId});
    if(!item){
        throw new CustomError.NotFoundError(`No product with this id${itemId}`);
    };
    item.amount = item.amount - 1;
    item.save();

    res.status(StatusCodes.OK).json({ item : item });
};


const deleteItem = async(req, res) => {
    
    const { id : itemId} = req.params;
    const item = await Cart.findOneAndDelete({_id : itemId});
    if(!item){
        throw new CustomError.NotFoundError(`No product with this id${itemId}`);
    };
    res.status(StatusCodes.OK).json({ msg : "item remove successfuly" });
}





module.exports = {
    getAllCart,
    updateCartItem,
    deleteItem,
    createItem,
    downCartItem
}