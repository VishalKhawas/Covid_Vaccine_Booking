//establishing connection with mongodb using mongoose

const mongoose=require("mongoose");
const dotenv = require("dotenv").config();

const main = async ()=>{
  await mongoose.connect(process.env.DB_URL);
}

module.exports=main;