const express = require("express");
const router = express.Router();
const mongoose = require('mongoose'); /* 似乎在這頁面沒用到 */
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");
const fs = require("fs");

router.get("/", async (req, res) => {
    try {
        if (req.session.userInfo === undefined || req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };
        const db = connectDB();
        // sort list by pid
        const product = await productModel.find().sort({pid: 1});
        res.render("products_manage", { products : product });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.get("/:id", async (req, res) => {
    const db = connectDB();
    try {
        const result = await productModel.findOne({_id: req.params.id});
        res.render("products_page", { products : result, manageHeader : req.session});

    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.post("/", async (req, res) => {
    const db = connectDB();
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };
        
        const data = req.body;
        console.log(data);
        let result = await productModel.findOne({ name : req.body.name });
        if (result !== null) {
            res.redirect("/error?msg=商品名稱重複，請重新檢查。");
        } else {

            // // AUTO INCREMENT pid (+1)
            const getLastItem = await productModel.find().sort({pid: -1}).limit(1);
                if (getLastItem.length === 0) {
                    var seqId = 1;
                } else {
                    var seqId = getLastItem[0].pid + 1;
                };
            console.log("seqId",seqId);
            data["pid"] =  seqId;
            let result = await productModel.insertMany(data);
            res.render("products_add.html");
        };
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

/* product image upload */

const multer = require("multer");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// get AWS setting from .env
const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_REGION,
    AWS_BUCKET_NAME,
} = process.env;

// create new s3Client, set region and credentials
const s3Client = new S3Client({
  credentials: { 
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_BUCKET_REGION
});

// multer setting: uplaod storage and file filter rule
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // only image jpg, jpeg, png can be upload
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new Error("file is not of the correct type"), false);
    }
};

// fileSize limits : 1 MB
const upload = multer({storage, fileFilter, limits : { fileSize : 1000000} });

router.post("/imageUpload", upload.single("file"), async (req, res) => {    
    if (req.file) {
        try {
            // permission control
            if (req.session.userInfo.account !== "admin") {
                return res.status(403).send({ message : "Permission Denied"});
            };

            let date = new Date();
            date = date.toISOString().replaceAll("-","").replaceAll(":","").replace("T","").split(".")[0];
            const filename = date + "-" + req.file.originalname;
        
            // PutObjectCommand : upload file to AWS S3 bucket
            const command = new PutObjectCommand({
                Bucket: AWS_BUCKET_NAME,
                Key: filename,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
              });
        
            const result = await s3Client.send(command); // 發送命令
            const imageUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${filename}`;
            console.log(imageUrl);

            const imageUpdate = await productModel.updateOne({_id: req.body.product_id}, {$set: {imageUrl : imageUrl}});
            res.redirect("/products");
            // res.send(imageUpdate);
        } catch (error) {
            console.error(error.message);
            res.status(500).send({ message : "upload failed"});
        }
    } else {
        res.status(400).send({ message : "no file chosen"});
    };

});

router.get("/f/search", async (req, res) => {
    const db = connectDB();
    try {
        const data = req.query;
        const key = Object.keys(req.query)[0];
        const value = Object.values(req.query)[0];
        let result = await productModel.find({ [key] : { $regex : value, $options : 'i' }});  // 查詢不分大小寫
        if (result.length === 0) {
            // res.send("There's no items for sale.");
            res.redirect("/error?msg=There's no items for sale.")
        } else {
            res.render("products_search",{ products : result, manageHeader : req.session });
        };
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.get("/f/add", (req, res) => {
    res.render("products_add.html");
});

router.get("/f/edit", async (req, res) => {
    const db = connectDB();
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };

        const productInfo = await productModel.findOne({ _id : req.query.product_id });
        var shortUrl = "no imageUrl found";
        if (productInfo.imageUrl) {
            var shortUrl = productInfo.imageUrl.split("com")[1]; };
        res.render("products_edit", { product : productInfo, shortUrl : shortUrl});
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});


router.patch("/:id", async (req, res) => {
    const db = connectDB();
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };

        const result = await productModel.updateOne({_id: req.params.id}, {$set: req.body});
        res.status(200).send({success: true, result});
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.delete("/:id", async (req, res) => {
    const db = connectDB();
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };

        const result = await productModel.deleteOne({_id : req.params.id});
        console.log(result);
        res.status(200).send({ success: true, result });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});


// 把所有產品直接導入 products table
router.post("/test", async (req, res) => {
    let obj = JSON.parse(fs.readFileSync("../raw/raw_data2.json", 'utf8'));
    console.log(obj);
    const db = connectDB();
    let result = await productModel.insertMany(obj);
    console.log("OK");
});

module.exports = router;