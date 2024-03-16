require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = () => {
  return (
    mongoose.set("strictQuery", false),
    mongoose.connect("mongodb+srv://Hassan:Hassan12345@nodejsexpressjs.yqtqanv.mongodb.net/AKAZA-API?retryWrites=true&w=majority")
  )
};

module.exports = connectDB;
