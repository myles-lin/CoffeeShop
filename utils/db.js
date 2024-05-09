const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect("mongodb+srv://root:root123@mycluster.jjhn1gj.mongodb.net/coffeeeShop")
        .then(console.log("MongoDB connected"));
    } catch(error) {
        console.log(error.message)
    }
};

module.exports = connectDB;