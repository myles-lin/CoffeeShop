const express = require("express");
const router = express.Router();
const mongoose = require('mongoose'); /* 似乎在這頁面沒用到 */
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");
const fs = require("fs");

router.get("/", async (req, res) => {
    // if (!req.session.userInfo ||req.session.userInfo.name !== "admin" || req.session.userInfo.isLogined !== true) {
    //     res.redirect("/error?msg=沒有權限。");
    // };
    const db = connectDB();
    const product = await productModel.find();
    res.render("products_manage", { products : product });
});

router.get("/:id", async (req, res) => {
    const db = connectDB();
    const result = await productModel.findOne({_id: req.params.id});
    res.render("products_page", { products : result});
});

router.post("/", async (req, res) => {
    const db = connectDB();
    const data = req.body;
    console.log(data);
    let result = await productModel.findOne({ name : req.body.name });
    if (result !== null) {
        res.redirect("/error?msg=商品名稱重複，請重新檢查。");
    } else {
        let result = await productModel.insertMany(data);
        res.render("products_add.html");
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
            res.send(imageUpdate);
        } catch (error) {
            console.log(error);
            res.status(500).send("upload failed");
        }
    } else {
        res.status(400).send("no file chosen");
    };

});


router.get("/f/search", async (req, res) => {
    const db = connectDB();
    const data = req.query;
    let result = await productModel.find(data);
    if (result.length === 0) {
        res.send("There's no items for sale.");
    } else {
        res.render("products_search",{ products : result });
    }
});

router.get("/f/add", (req, res) => {
    res.render("products_add.html");
});

router.delete("/:id", async (req, res) => {
    const db = connectDB();
    const result = await productModel.deleteOne({_id : req.params.id});
    console.log(result);
    res.status(200).send({ success: true, result });
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