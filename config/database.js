const mongoose = require("mongoose");

const { MONGO_URI } = process.env;
const { DMONGO_URI } = process.env;

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(DMONGO_URI, {
      useNewUrlParser: true, 
      
      useUnifiedTopology: true 
      
      }, err => {
      if(err) throw err;
      console.log('Connected to MongoDB!!!')
      });
};