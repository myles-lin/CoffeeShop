const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId : { type : Number, required : true, unique : true },
    account : { type : String, required : true },
    purchase : { type : Array, required : true },
    recipientName : { type : String, required : true },
    deliveryAddress : { type : String, required : true },
    totalAmount : { type : Number, required : true },
    status : String,
    transactionId : { type : Number, required : true },
    message : Array
}, {
    collection : "order",
    timestamps : true
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;