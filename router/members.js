const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const memberModel = require("../models/memberModel");
const orderModel = require("../models/orderModel");

router.get("/", async (req, res) => {
    console.log(req.session);
    if (!req.session.userInfo || req.session.userInfo.isLogined !== true) {
        res.redirect("/error?msg=Not logged in yet.");
    } else {
        const db = connectDB();
        const userInfo = await memberModel.findOne({ account : req.session.userInfo.name });
        const account = userInfo.account;
        const orderList = await orderModel.find({ account : account });

        res.render("member", { userInfo : userInfo, orders : orderList });
    }
});

router.put("/:account", async (req, res) => {
    const db = connectDB();
    const result = await memberModel.updateOne({account: req.params.account}, {$set: req.body});
    res.status(200).send(result);
});

router.patch("/:id", async (req, res) => {
    const db = connectDB();
    try {
        const result = await memberModel.updateOne({_id: req.params.id}, {$set: req.body});
        res.status(200).send({success: true, result});
    } catch (error) {
        console.log("member PATCH error:", error);
        res.status(500).json({error});
    };
});

router.get("/api", async (req, res) => {
    const db = connectDB();
    const result = await memberModel.findOne({account:"def"});
    res.send({"member": result});
});



// router.post("/register", async (req, res) => {
//     const db = connectDB();
//     let username = req.body.username;
//     let password = req.body.password;

//     let result = await memberModel.findOne({ username : username });
//     if (result !== null) {
//         res.send("信箱已被註冊過，請更換其他信箱。");
//     } else {
//         const member = new memberModel({
//             username : username,
//             password : password
//         });
//         member.save();
//     };

//     res.redirect("/members");

//     // const memberSchema = new mongoose.Schema({
//     //     username : {
//     //         type : String,
//     //         required : true,
//     //         unique : true
//     //     },
//     //     password : {
//     //         type : String,
//     //         required : true
//     //     },
//     //     nickname : String,
//     //     address : String
//     // }, {
//     //     collection : "member"
//     // });
//     // const collection = new mongoose.model("member", memberSchema);
//     // data = [{
//     //     username : "abc",
//     //     password : "123"
//     // },{
//     //     username : "def",
//     //     password : "456"
//     // }];
//     // new mongoose.model("member", memberSchema).insertMany(data);
//     // res.send(data);
// });

module.exports = router;