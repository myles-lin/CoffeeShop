const mongoose = require('mongoose');

require('dotenv').config();
const {
    MONGODB_USER,
    MONGODB_PWD
} = process.env;

const uri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PWD}@mycluster.jjhn1gj.mongodb.net/coffeeeShop?retryWrites=true&w=majority`;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectToMongoDB = async() => {
    try {
        // await mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PWD}@mycluster.jjhn1gj.mongodb.net/coffeeeShop`);
        await mongoose.connect(uri, clientOptions);
        console.log("MongoDB Atlas connected");
    } catch (error) {
        console.error(error.message);
    };
};

const closeMongoDBConnection = async () => {
    try {
      await mongoose.disconnect();
      console.log('MongoDB Altas connection closed');
    } catch (error) {
        console.error(error.message);
    };
};

module.exports = {connectToMongoDB, closeMongoDBConnection};