const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");

router.get("/", (req, res) => {

});

router.post("/products", (req, res) => {
    const db = connectDB();
    let data = req.body;
    console.log(data);
    const product = new productModel({
        name : req.body.name,
        category : req.body.category,
        roastLevel : req.body.roastLevel,
        region : req.body.region,
        quantity : req.body.quantity,
        price : req.body.price,
        content : req.body.content
    });
    product.save();
});

module.exports = router;