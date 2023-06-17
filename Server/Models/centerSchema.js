const { time } = require("console");
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

//center schema
const centerSchema = new mongoose.Schema({
    name: String,
    location: String,
    openTime: String,
    closeTime: String,
    booked: [Schema.Types.Mixed]
});

const Center = new mongoose.model("Center", centerSchema);

module.exports = Center;