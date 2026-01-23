const User = require('../model/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require("crypto");

const sendEmail = require("../utils/sendEmail");
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
}



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
};


// const rgister = async(req, res) => {
    
// };

const logOut = async(req, res) => {
    res.status(StatusCodes.OK).json({
        msg : "LogOut Successfuly"
    })
}



 const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log(user)
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset",
    html: `
      <p>You requested a password reset</p>
      <a href="${resetURL}">Reset Password</a>
      <p>Expires in 10 minutes</p>
    `,
  });

  res.status(StatusCodes.OK).json({
    message: "Reset link sent to email",
  });
};


const resetPassword = async (req, res) => {
  const { token } = req.params; // token from URL
  const { newPassword } = req.body;

  // 1️⃣ Validate input
  if (!newPassword) {
    throw new CustomError.BadRequestError("Please provide a new password");
  }

  // 2️⃣ Hash the token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 3️⃣ Find the user with this token & check expiration
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // token not expired
  });

  if (!user) {
    throw new CustomError.BadRequestError("Token is invalid or expired");
  }

  // 4️⃣ Update password & clear reset token fields
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // pre-save hook will hash the password

  // 5️⃣ Optionally: create JWT to auto-login after reset
  const tokenJWT = user.createJWT();

  // 6️⃣ Send response
  res.status(StatusCodes.OK).json({
    message: "Password reset successful",
    token: tokenJWT,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};















module.exports = {
    register,
    logIn,
    logOut,
    forgotPassword,
    resetPassword
}