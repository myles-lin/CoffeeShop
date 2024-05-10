const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");
const fs = require("fs");

router.get("/", async (req, res) => {
    const db = connectDB();
    let result = await productModel.find();
    console.log(result);
    // res.status(200).json(result);
    res.send(result);
    // 暫時省略驗證
    let path = "../views/products.html";
        res.render("index", { path : path });
    // 暫時省略驗證

    // console.log(req.session);
    // if (!req.session.userInfo ||req.session.userInfo.name !== "admin" || req.session.userInfo.isLogined !== true) {
    //     res.send("Get Out!!!");
    // } else {
    //     let path = "../views/products.html";
    //     res.render("index", { path : path });
    // }
});

router.post("/", (req, res) => {
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


// 把所有產品直接導入 products table
router.post("/test", async (req, res) => {
    let obj = JSON.parse(fs.readFileSync("./raw_data.json", 'utf8'));
    console.log(obj);
    const db = connectDB();
    let result = await productModel.insertMany(obj);
    console.log("OK");
});

module.exports = router;