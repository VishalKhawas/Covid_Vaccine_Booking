const bodyParser= require("body-parser");
const Center = require("../Models/centerSchema");

//callback fn to bookSlot at a vaccination center
const bookSlot = async (req, res)=>{
    const centerName=req.body.centerName;
    const name=req.body.username;
    const age=req.body.age;
    const date=req.body.date;
    //find the center having center name
    const center=await Center.findOne({name: centerName}).exec();
    //get its booked array
    let arr = center.booked;
    const openTime = center.openTime;
    const closeTime = center.closeTime;
    const location = center.location;
    const temp=[name, age, date];

    let count=0;
    for(var i=0; i<arr.length; i++){
        if(date==arr[i][2]) count++;
    }
    
    //check for bookings in that day, if its less than 10, proceed, else dont book
    if(count<10){
        arr.push(temp);

        await Center.findOneAndUpdate({name: centerName}, {booked: arr}).exec();

        arr=[centerName, name, date, openTime, closeTime, location];
        res.render("success", {data: arr});
    }
    else{
        res.render("failure", {center: centerName, date: date});
    }
}

module.exports = bookSlot;