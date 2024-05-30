const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId : { type : Number, required : true, unique : true },
    account : { type : String, required : true },
    purchase : { type : Array, required : true },
    recipientName : { type : String, required : true },
    deliveryAddress : { type : String, required : true },
    totalAmount : Number,
    status : String,
    transactionId : Number,
    message : Array
}, {
    collection : "order",
    timestamps : true
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;