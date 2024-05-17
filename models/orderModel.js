const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    account : {
        type : String,
        required : true,
    },
    purchase : {
        type : Array,
        required : true
    },
    totalAmount : Number,
    status : String,
    message : Array
}, {
    collection : "order"
});

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;