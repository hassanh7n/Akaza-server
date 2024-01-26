const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
    name:{
        type : String,
        trim : true,
        required : [true, 'Please provide product name'],
        maxlength : [100, 'Name cannot be more than 100 characters'],
    },
    price : {
        type : Number,
        required : [true, "Please provide product price"],
        default : 0,
    },
    discription : {
        type : String,
        required : [true, "Please provide product description"],
        maxlength : [1000, "description cannot be more than 1000 characters"],
    },
    images : [
        {
            src: String,
        },
        {
            src: String,
        },
        {
            src: String,
        },
        {
            src: String,
        },
        {
            src: String,
        },
    ],
    category: {
        type : String,
        required : [true, 'Please provide product category'],
        enum : ['clothing', 'jewellery', 'shoes', 'other'],
    },
    company : {
        type : String,
        required : [true, "please provide company name"]
    },
    colors : {
        type : [String],
        default : ['#222'],
        required : true,
    },
    featured : {
        type : Boolean,
        defalut : false,
    },
    freeShipping : {
        type : String,
        default : 'false',
    },
    inventory : {
        type : Number,
        required : true,
        default : 5,
    },
    averageRating : {
        type : Number,
        default : 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
},
{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
  });
  
  ProductSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({ product: this._id });
  });

  


  module.exports = mongoose.model('Product', ProductSchema);