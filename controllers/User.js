const User = require('../model/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const chechPermissions = require('../utils/checkPermissions');
const {
    createTokenUser,
    attachCookiesToResponse,
    checkPermissions,
  } = require('../utils');


const getAllUser = async(req, res) => {
    req.body.user = req.user.userId;
    const user = await User.findOne({_id : req.user.userId})
    const isAdmin = (user.role === 'admin' ? true : false)
    if(!isAdmin){
      throw new CustomError.UnAuthorizeError("Admin routes only")
    }
    const users = await User.find({role : 'user'}).select('-password');
    res.status(StatusCodes.OK).json({users});
};

const getSingleUser = async(req, res) => {
    const user = await User.findOne({_id : req.params.id}).select("-password");

    if(!user){
        throw new CustomError.NotFoundError(`No user with this id${req.params.id}`);
    };

    chechPermissions(req.user, user._id);


    res.status(StatusCodes.OK).json({
        user : req.user
    })
};


const showCurrentUser = async(req, res) => {
    
    res.status(StatusCodes.OK).json({
        user : req.user
    })
};



const updateUser = async(req, res) => {
    const {email, name, hobby} = req.body;
    // console.log(name);
    if(!email || !name || !hobby){
        throw new CustomError.BadRequestError("Please provide all values");
    }

    const user = await User.findOne({_id : req.user.userId});
    if(!user){
        throw new CustomError.UnAuthorizeError("Invalid Credentials")
    };

    user.email = email;
    user.name = name;
    user.hobby = hobby;

    await user.save();


    const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user, token});
};


const updatePassword = async(req, res) => {
    const {oldPassword, newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError("Please provide both values")
    };

    const user = await User.findOne({_id : req.user.userId});

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Inavlid Credentials')
    };

    user.password = newPassword;

    await user.save();
    const token = user.createJWT();

    res.status(StatusCodes.OK).json({
        msg : 'Success! Password updated.',
        user,
        token
    })

};


const resetPassword = async(req, res) => {
    const {email, hobby, newPassword} = req.body;

    const user = await User.findOne({email : email});

    if(!user){
        throw new CustomError.UnauthenticatedError("User does not exist")
    };

    if(user.hobby !== hobby){
        throw new CustomError.UnauthenticatedError("User does not exist")
    };

    user.password = newPassword;

    await user.save();

    const token = user.createJWT()

    res.status(StatusCodes.OK).json({
        user, token
    })

}


module.exports = {
    getAllUser,
    getSingleUser,
    updateUser,
    updatePassword,
    showCurrentUser,
    resetPassword,
}