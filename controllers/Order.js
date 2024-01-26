const Order = require('../model/Order');
const Product = require('../model/Product');
const User = require('../model/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const moment = require('moment');
const dotenv = require('dotenv')
dotenv.config()
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY)

// const fakeStripeAPI = async({amount, currency}) => {
//     const client_secret = "sk_test_51NsAtgG1KNUw5YzwYim2hEz8LRWIowEp9GMZCfO6uE9SOO5sgSsMpvVe4Yx7PwxXPilwDkOT7orZ5jt6PaWpoTK2005y4iuCNQ"
//     return {client_secret, amount};
// };


const createOrder = async(req, res) => {
    const { items : cartItems, tax, shippingFee } = req.body;

    // if (!cartItems || cartItems.length < 1) {
    //     throw new CustomError.BadRequestError('No cart items provided');
    // };

    // if (!tax || !shippingFee) {
    //     throw new CustomError.BadRequestError(
    //       'Please provide tax and shipping fee'
    //     );
    // };

    let orderItems = [];
    let subtotal = 0;


    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.productID });
        if (!dbProduct) {
          throw new CustomError.NotFoundError(
            `No product with id : ${item.productID}`
          );
        }
        const { name, price, images, _id } = dbProduct;
        const singleOrderItem = {
          amount: item.amount,
          name,
          price,
          image : images[0].src,
          product: _id,
        };
        // add item to order
        orderItems = [...orderItems, singleOrderItem];
        // calculate subtotal
        subtotal += item.amount * price;
      }
      // calculate total
      const calculateOrderAmount = () => {
        
        return tax + shippingFee + subtotal;
      }
      // const total = tax + shippingFee + subtotal;
      // get client secret


      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(calculateOrderAmount() * 100),
        currency: 'usd',
      })
      // const paymentIntent = await fakeStripeAPI({
      //   amount: total,
      //   currency: 'usd',
      // });
      const amount = calculateOrderAmount()
    
      const order = await Order.create({
        orderItems,
        total : amount,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId,
      });
    
      res
        .status(StatusCodes.CREATED)
        .json({order,  clientSecret: paymentIntent.client_secret });
};


const getAllOrders = async (req, res) => {
  const { sort } = req.query;
  console.log(sort, );
  const queryObject = {};



  // if (name) {
  //   queryObject.name = { $regex: name, $options: 'i' };
  // }
  let result = Order.find(queryObject);
  // sort
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }


const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const skip = (page - 1) * limit;

result = result.skip(skip).limit(limit);

  req.body.user = req.user.userId;
    const user = await User.findOne({_id : req.user.userId})
    const isAdmin = (user.role === 'admin' ? true : false)
    if(!isAdmin){
      throw new CustomError.UnAuthorizeError("Admin routes only")
    }


    const orders = await result;


    const totalOrders = await Order.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalOrders / limit);
    res.status(200).json({ orders, totalOrders, numOfPages });
  };


  const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }
    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
  };
  const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId });
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
  };
  const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    // const { paymentIntentId } = req.body;
  
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }
    // console.log(order);
  
    // order.paymentIntentId = paymentIntentId;
    const paid = "paid"
    order.status = paid;
    await order.save();
  console.log(
    order
  );
    res.status(StatusCodes.OK).json({ order });
  };


  const showStatsOrders = async(req, res) => {

    // let stats = await Product.aggregate([
    //   {$match : {createdBy : mongoose.Types.ObjectId(req.user.userId)}},
    //   {$group:{_id:'$status', count : {$sum : 1}}}
    // ])
  
  
    // stats = stats.reduce((acc, curr) => {
    //   const { _id: title, count } = curr;
    //   acc[title] = count;
    //   return acc;
    // }, {});
  
    // const defaultStats = {
    //   pending: stats.pending || 0,
    //   interview: stats.interview || 0,
    //   declined: stats.declined || 0,
    // };
  
    let monthlyApplications = await Order.aggregate([
      // { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
      
    ]);
  
    monthlyApplications = monthlyApplications
      .map((item) => {
        const {
          _id: { year, month },
          count,
        } = item;
        const date = moment()
          .month(month - 1)
          .year(year)
          .format('MMM Y');
        return { date, count };
      })
      .reverse();
  
  
  
    res.status(StatusCodes.OK).json({
      monthlyApplications
    })
  }




  module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
    showStatsOrders
  };
  