const Product = require('../model/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const User = require('../model/User');
const  mongoose  = require('mongoose');
const moment = require('moment');

const createProduct = async(req, res) => {
    req.body.user = req.user.userId;
    const user = await User.findOne({_id : req.user.userId})
    const isAdmin = (user.role === 'admin' ? true : false)
    if(!isAdmin){
      throw new CustomError.UnAuthorizeError("Admin routes only")
    }
    const product = await Product.create(req.body);
    
  res.status(StatusCodes.CREATED).json({ product });
};


const getAllProducts = async(req, res) => {
  const { category, name, company, fields, sort, numericFilters } = req.query;
  console.log(sort);
  const queryObject = {};

  
  if (category  && category !== 'all') {
    queryObject.category = category;
  }
  // if(company && company !== 'all'){
  //   queryObject.company = company;
  // }
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (company) {
    queryObject.company = { $regex: company, $options: 'i' };
  }

  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ['price', 'rating'];
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let result = Product.find(queryObject).populate('reviews');
    // sort
    if (sort === 'latest') {
      result = result.sort('-createdAt');
    }
    if (sort === 'oldest') {
      result = result.sort('createdAt');
    }
  if(sort === 'a-z'){
      result = result.sort('name');
  }
  if(sort === 'z-a'){
      result = result.sort('-name');
  }
  
    if (fields) {
      const fieldsList = fields.split(',').join(' ');
      result = result.select(fieldsList);
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;
  
    result = result.skip(skip).limit(limit);
    // 23
    // 4 7 7 7 2
  
    const products = await result;


    const totalProducts = await Product.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalProducts / limit);
    res.status(200).json({ products, totalProducts, numOfPages });

};

const singleProduct = async(req, res) => {
    const product = await Product.findOne({_id : req.params.id}).populate('reviews');
    if(!product){
        throw new CustomError.NotFoundError(`No product with this id${req.params.id}`)
    };

    res.status(StatusCodes.OK).json({
        product
    })

};


const updateProduct = async(req, res) => {
    const { id : productId} = req.params;
    console.log(productId);
    const product = await Product.findOneAndUpdate({_id : productId, createdBy :req.user.userId }, req.body, {
        new : true,
        runValidators : true,
    })
    if(!product){
        throw new CustomError.NotFoundError(`No product with this id${productId}`);
    };

    res.status(StatusCodes.OK).json({
        product : product
    })
};


const deleteProduct = async(req, res) => {
    const { id: productId } = req.params;

  const product = await Product.findOneAndDelete({ _id: productId, createdBy :  req.user.userId});

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};


const uploadImage = async(req, res) => {
    console.log(req)
    // console.log(req.files.img1.tempFilePath)
    // console.log(req.files.img2.tempFilePath)
  const result = await cloudinary.uploader.upload(
    req.files.file.tempFilePath,
    // req.files.img1.tempFilePath,
    // req.files.img2.tempFilePath,
    {
      use_filename: true,
      folder: 'file-upload',
    }

  );
  fs.unlinkSync(req.files.file.tempFilePath);
  // fs.unlinkSync(req.files.img1.tempFilePath);
  // fs.unlinkSync(req.files.img2.tempFilePath);
  console.log(result);
  return res.status(StatusCodes.OK).json(
    { image: { src: result.secure_url } }
    // {msg : "yeah"}
    );
}

const uploadImage1 = async(req, res) => {
  console.log(req)
  // console.log(req.files.img1.tempFilePath)
  // console.log(req.files.img2.tempFilePath)
const result = await cloudinary.uploader.upload(
  req.files.file.tempFilePath,
  // req.files.img1.tempFilePath,
  // req.files.img2.tempFilePath,
  {
    use_filename: true,
    folder: 'file-upload',
  }

);
fs.unlinkSync(req.files.file.tempFilePath);
// fs.unlinkSync(req.files.img1.tempFilePath);
// fs.unlinkSync(req.files.img2.tempFilePath);
console.log(result);
return res.status(StatusCodes.OK).json(
  { image: { src: result.secure_url } }
  // {msg : "yeah"}
  );
}

const uploadImage3 = async(req, res) => {
  console.log(req)
  // console.log(req.files.img1.tempFilePath)
  // console.log(req.files.img2.tempFilePath)
const result = await cloudinary.uploader.upload(
  req.files.file.tempFilePath,
  // req.files.img1.tempFilePath,
  // req.files.img2.tempFilePath,
  {
    use_filename: true,
    folder: 'file-upload',
  }

);
fs.unlinkSync(req.files.file.tempFilePath);
// fs.unlinkSync(req.files.img1.tempFilePath);
// fs.unlinkSync(req.files.img2.tempFilePath);
console.log(result);
return res.status(StatusCodes.OK).json(
  { image: { src: result.secure_url } }
  // {msg : "yeah"}
  );
}

const uploadImage4 = async(req, res) => {
  console.log(req)
  // console.log(req.files.img1.tempFilePath)
  // console.log(req.files.img2.tempFilePath)
const result = await cloudinary.uploader.upload(
  req.files.file.tempFilePath,
  // req.files.img1.tempFilePath,
  // req.files.img2.tempFilePath,
  {
    use_filename: true,
    folder: 'file-upload',
  }

);
fs.unlinkSync(req.files.file.tempFilePath);
// fs.unlinkSync(req.files.img1.tempFilePath);
// fs.unlinkSync(req.files.img2.tempFilePath);
console.log(result);
return res.status(StatusCodes.OK).json(
  { image: { src: result.secure_url } }
  // {msg : "yeah"}
  );
}

const uploadImage5 = async(req, res) => {
  console.log(req)
  // console.log(req.files.img1.tempFilePath)
  // console.log(req.files.img2.tempFilePath)
const result = await cloudinary.uploader.upload(
  req.files.file.tempFilePath,
  // req.files.img1.tempFilePath,
  // req.files.img2.tempFilePath,
  {
    use_filename: true,
    folder: 'file-upload',
  }

);
fs.unlinkSync(req.files.file.tempFilePath);
// fs.unlinkSync(req.files.img1.tempFilePath);
// fs.unlinkSync(req.files.img2.tempFilePath);
console.log(result);
return res.status(StatusCodes.OK).json(
  { image: { src: result.secure_url } }
  // {msg : "yeah"}
  );
}

const showStats = async(req, res) => {

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

  let monthlyApplications = await Product.aggregate([
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
    createProduct,
    getAllProducts,
    singleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    uploadImage1,
    showStats,
    uploadImage3,
    uploadImage4,
    uploadImage5
}
