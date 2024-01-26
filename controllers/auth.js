const User = require('../model/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {  
    attachCookiesToResponse,
    createTokenUser,
    sendVerificationEmail,
    sendResetPasswordEmail,
    hashString
} = require('../utils');






const register = async(req, res) => {
    const {name, email, password, hobby} = req.body
    const isEmailAlreadyExisted = await User.findOne({email : email});
    if(isEmailAlreadyExisted){
        throw new CustomError.BadRequestError('Email already existed')
    };
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({name, email,  password, role, hobby});

    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({
      user :  user,
       token
    });
};


const logIn = async(req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        throw new CustomError.BadRequestError('Plaese provide email and password')
    };

    const user = await User.findOne({email});
    
    if(!user){
        throw new CustomError.UnAuthorizeError("inavlid Credentials")
    };

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Inavlid Credentials');
    };

    const token = user.createJWT();


    res.status(StatusCodes.OK).json({
        user : user,
        token
    })

    res.status(200).json({
        mag : "logIn user"
    });
};



const logOut = async(req, res) => {
    res.status(StatusCodes.OK).json({
        msg : "LogOut Successfuly"
    })
}


module.exports = {
    register,
    logIn,
    logOut
}