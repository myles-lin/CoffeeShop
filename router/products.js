const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");
const fs = require("fs");

router.get("/", async (req, res) => {
    // if (!req.session.userInfo ||req.session.userInfo.name !== "admin" || req.session.userInfo.isLogined !== true) {
    //     res.redirect("/error?msg=沒有權限。");
    // };
    const db = connectDB();
    let product = await productModel.find();

    // let path = "../views/products_search.ejs";
    res.render("products_search", { products : product });
    
    // console.log(result);
    // let product = res.json(result);
    
    // console.log(req.session);
    // if (!req.session.userInfo ||req.session.userInfo.name !== "admin" || req.session.userInfo.isLogined !== true) {
    //     res.send("Get Out!!!");
    // } else {
    //     let path = "../views/products.html";
    //     res.render("index", { path : path });
    // }
});

router.get("/:", (req, res) => {
    res.redirect
});

router.post("/", async (req, res) => {
    const db = connectDB();
    let data = req.body;
    // console.log(data);
    let result = await productModel.findOne({ name : req.body.name });
    if (result !== null) {
        res.redirect("/error?msg=商品名稱重複，請重新檢查。");
    } else {
        let obj = {
            name : req.body.name,
            category : req.body.category,
            roastLevel : req.body.roastLevel,
            region : req.body.region,
            quantity : req.body.quantity,
            price : req.body.price,
            content : req.body.content
        };
        let result = await productModel.insertMany(obj);
        console.log(result);
        res.send(req.body.name);
    };
});

router.delete("/:id", async (req, res) => {
    const db = connectDB();
    // let id = req.params.id;
    console.log(req.params.id);
    const result = await productModel.deleteOne({_id : req.params.id});
    console.log(result);
    res.json(result);
});

router.get("/add", (req, res) => {
    res.render("products.html");
});


router.get("/testajax", (req, res)=>{
    res.send("OKKKKK!");
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