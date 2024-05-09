const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    quantity : Number,
    price : Number,
    content : String
}, {
    collection : "product"
});

const productModel = mongoose.model("product", productSchema);
module.exports = productModel;