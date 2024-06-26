const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    pid : {
        type : Number,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true,
        unique : true
    },
    category : {
        type : String,
        required : true
    },
    roastLevel : String,
    region : String,
    quantity : { type : Number, required : true },
    price : { type : Number, required : true },
    content : String,
    imageUrl : String
}, {
    collection : "product"
});

const productModel = mongoose.model("product", productSchema);
module.exports = productModel;