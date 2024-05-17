const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId : { type : Number, required : true, unique : true },
    account : { type : String, required : true },
    purchase : { type : Array, required : true },
    totalAmount : Number,
    status : String,
    message : Array
}, {
    collection : "order"
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;