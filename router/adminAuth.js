const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");

router.get("/", (req, res) => {
    console.log(req.session);
    if (!req.session.userInfo ||req.session.userInfo.name !== "admin" || req.session.userInfo.isLogined !== true) {
        res.send("Get Out!!!");
    } else {
        let path = "../views/adminAuth.html";
        res.render("index", { path : path });
    }
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

router.get("/test", (req, res) => {
    console.log(req.query.region);
    console.log(typeof req.query.region);
});


module.exports = router;