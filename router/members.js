const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const memberModel = require("../models/memberModel");
// const db = connectDB();

router.get("/", (req, res) => {
    console.log(req.session);
    if (!req.session.userInfo || req.session.userInfo.isLogined !== true) {
        res.send("Get Out!!!");
    } else {
        res.render("member.html");
    }
});

router.get("/signout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
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