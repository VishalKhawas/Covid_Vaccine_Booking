const bodyParser= require("body-parser");
const User = require("../Models/userSchema");
const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

//register new user post request callback function

const register = async (req, res)=>{
    try{
        //try to hash the password using bcrypt, and then save
        bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
            // Store hash in your password DB.
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            await newUser.save();
            res.redirect("/login");
        });
    } catch(err){
        console.log(err);
    }
}

module.exports = register;