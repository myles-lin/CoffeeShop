const mongoose = require('mongoose');

require('dotenv').config();
const {
    MONGODB_USER,
    MONGODB_PWD
} = process.env;

const connectDB = async() => {
    try {
        await mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PWD}@mycluster.jjhn1gj.mongodb.net/coffeeeShop`);
        console.log("MongoDB connected");
    } catch(error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
};

module.exports = connectDB;