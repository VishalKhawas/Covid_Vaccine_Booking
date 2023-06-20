//requiring packages
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const alert = require('alert');
const User = require('./Server/Models/userSchema');
const Admin = require('./Server/Models/adminSchema');
const Center = require('./Server/Models/centerSchema');
const strategy1 = require("./Server/LocalStrategies/strategy1");
const strategy2 = require("./Server/LocalStrategies/strategy2");
const main = require("./Server/connection");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bookSlot = require('./Server/Controllers/bookSlot');
const register = require('./Server/Controllers/register');
const bookingDetails = require('./Server/Controllers/bookingDetails');

const PORT = process.env.PORT || 3000;
 
const app = express();

//setting path of public folder, and view engine to ejs
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//setting up session for express
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//connect to database
main().catch(err => console.log(err));

//defining passport strategies
passport.use("local1", strategy1);
passport.use("local2", strategy2);

//setting up serialize and deserialize functions
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try{
    const user=await User.findById(id) || await Admin.findById(id);
    done(null, user);
  }
  catch(err){
    done(err, false);
  }
});


// User Side Code
//get functions for root, login and register route
app.get("/", function(req, res){
    res.render('home');
});

app.get("/login", function(req, res){
    res.render('login');
});

app.get("/register", function(req, res){
    res.render('register');
});

//post function for register route
app.post("/register", register);

//post for login route, passport authentication is done using local strategy1
app.post("/login", passport.authenticate('local1', { failureRedirect: '/login' }), async (req, res)=>{
    res.redirect("/userHome");
});

//get for userHome, opened only when user is verified
app.get("/userHome", async (req, res)=>{
    // console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        const allCenters = await Center.find({});
        res.status(201).render('userHome', {center: allCenters});
    }
    else{
        res.redirect("/login");
    }
});

//logout user, destroy cookies
app.get("/logout", (req, res, next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

//get for bookslot, opened only when user is authenticated
app.get("/book/:id", async (req, res)=>{
    if(req.isAuthenticated()){
        let centerId=req.params.id;
        let center = await Center.findById(centerId);
        res.render('book', {center: center});
    }
    else{
        res.redirect("/login");
    }
});

//post for bookslot
app.post("/book", bookSlot);
//end of user side code

// Admin Side Code
// get for adminLogin route
app.get('/adminLogin', (req, res)=>{
    res.render('adminLogin');
});

//post for admin login route, authentication done using local strategy 2
app.post("/adminLogin", passport.authenticate('local2', { failureRedirect: '/adminLogin' }), async (req, res)=>{
    res.redirect("/adminHome");
});

//get for admin home, diaplayed only when user is authenticated
app.get("/adminHome", isAuth, async (req, res)=>{
    if(req.isAuthenticated()){
        const allCenters = await Center.find({});
        res.render("adminHome", {center: allCenters});
    }
    else{
        res.redirect("/adminLogin");
    }
});

//get for adding new center
app.get("/addCenter", isAuth, (req, res)=>{
    if(req.isAuthenticated()){
    res.render("addCenter");
    } else{
        res.redirect("/adminLogin");
    }
});

// post for adding new center
app.post("/addCenter", isAuth, async (req, res)=>{
    const newCenter = new Center({
        name: req.body.name,
        location: req.body.location,
        openTime: req.body.openTime,
        closeTime: req.body.closeTime
    });
    await newCenter.save();
    res.redirect('adminHome');
});

//get for deleting center, only for authenticated user
app.get("/deleteCenter/:id", isAuth, async (req, res)=>{
    if(req.isAuthenticated()){
        let centerId = req.params.id;
        await Center.findByIdAndDelete(centerId);
        alert("Center Deleted Succesfully");
        const allCenters = await Center.find({});
        res.render("adminHome", {center: allCenters});
    } else{
        res.redirect("/adminLogin");
    }
});

//isAuth function
async function isAuth(req, res, next){
    if(req.isAuthenticated()){
        const adm = await Admin.findById(req.user).exec();
        console.log(adm);
        if(adm!=undefined) return next();
        else res.redirect("/adminLogin");
    }
    else res.redirect("/adminLogin");
}

//get for viewing all booking at any center
app.get("/centerBookings/:id", isAuth, bookingDetails);

//admin logout 
app.get("/adminLogout", (req, res, next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/adminLogin');
    });
});

//listen to port 
app.listen(PORT, function(){
    console.log("Server Started on 3000");
})