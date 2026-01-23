const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const UserModel = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please provide your name"],
        maxlength: 20
    },
    email : {
        type : String,
        required : [true, "Please provide email address"],
        unique : true,
        validate:{
            validator : validator.isEmail,
            message : "Please provide valid email"
        }
    },
    password : {
        type : String,
        required : [true, "Please provide password"],
        minlength : 6
    },
    hobby : {
        type : String,
        required : true,
        minlength : 4
    },
    role : {
        type : String,
        enum : ["admin", "user"],
        default : "user"
    },
    passwordResetToken: {
    type: String,
    },
    passwordResetExpires: {
    type: Date,
   },

})



UserModel.pre('save', async function(){
    if(!this.isModified('password')) return;
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});


UserModel.methods.createJWT = function () {
    return jwt.sign(
        {userId : this._id, name : this.name},
        `${process.env.JWT_SECRET}`
        ,
        {
            expiresIn : `${process.env.JWT_LIFETIME}`,
        }
    );
  };
  

UserModel.methods.comparePassword = async function(canditatePassword){
    const isMatch = await bcryptjs.compare(canditatePassword, this.password);
    return isMatch;
}

const crypto = require("crypto");

UserModel.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};


module.exports = mongoose.model('User', UserModel);