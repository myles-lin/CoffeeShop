const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect("mongodb+srv://root:xxx@mycluster.jjhn1gj.mongodb.net/coffeeeShop");
        console.log("MongoDB connected");
    } catch(error) {
        console.error(error.message);
    };
};

module.exports = connectDB;