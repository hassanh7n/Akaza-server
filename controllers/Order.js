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
const sendEmail = require("../utils/sendEmail");
const orderPlacedEmail = require("../utils/orderPlaceEmail");
// const fakeStripeAPI = async({amount, currency}) => {
//     const client_secret = "sk_test_51NsAtgG1KNUw5YzwYim2hEz8LRWIowEp9GMZCfO6uE9SOO5sgSsMpvVe4Yx7PwxXPilwDkOT7orZ5jt6PaWpoTK2005y4iuCNQ"
//     return {client_secret, amount};
// };

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided");
  }

  if (tax == null || shippingFee == null) {
    throw new CustomError.BadRequestError("Please provide tax and shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findById(item.productID);
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with id : ${item.productID}`);
    }

    const { name, price, images, _id } = dbProduct;

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image: images[0].src,
      product: _id,
    };

    orderItems.push(singleOrderItem);
    subtotal += item.amount * price;
  }

  const total = tax + shippingFee + subtotal;

  // 1️⃣ Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    metadata: {
      userId: req.user.userId,
    },
  });

  // 2️⃣ Create Order in DB
  const order = await Order.create({
    orderItems,
    subtotal,
    tax,
    shippingFee,
    total,
    status: "created",
    user: req.user.userId,

    customer: {
      name: req.body.name,
      email: req.body.email,
    },

    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });

  // 3️⃣ Send order placed email
  await sendEmail({
    to: order.customer.email,
    subject: "Your order has been placed 🎉",
    html: orderPlacedEmail(order.customer.name, order),
  });

  res.status(StatusCodes.CREATED).json({
    order,
    clientSecret: paymentIntent.client_secret,
  });
};



const getAllOrders = async (req, res) => {
  const { sort = 'latest', page = 1, limit = 10 } = req.query;

  // Admin check
  const user = await User.findById(req.user.userId);
  if (!user || user.role !== 'admin') {
    throw new CustomError.UnAuthorizeError("Admin routes only");
  }

  const queryObject = {}; // Add filters here if needed

  // Find orders and populate customer info
  let result = Order.find(queryObject).populate({
    path: 'user',         // field in Order schema
    select: 'name email', // fetch only name and email
  });

  // Sorting
  if (sort === 'latest') result = result.sort('-createdAt');
  if (sort === 'oldest') result = result.sort('createdAt');

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  result = result.skip(skip).limit(Number(limit));

  // Execute query
  const orders = await result;

  // Total count and pages
  const totalOrders = await Order.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalOrders / Number(limit));

  // Return response
  res.status(200).json({
    orders,
    totalOrders,
    numOfPages,
    page: Number(page),
  });
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
  const { status } = req.body;
  const { id: orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new CustomError.NotFoundError("Order not found");
  }

  // Your schema enum
  const allowedStatuses = [
    "created",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];

  // Validate incoming status
  if (!allowedStatuses.includes(status)) {
    throw new CustomError.BadRequestError("Invalid order status");
  }

  // Directly update (no transition rules for portfolio)
  order.status = status;
  await order.save(); // email middleware still works

  res.status(StatusCodes.OK).json({
    message: "Order status updated",
    order,
  });
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
  