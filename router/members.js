const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const memberModel = require("../models/memberModel");
const orderModel = require("../models/orderModel");

router.get("/page", async (req, res) => {
    if (!req.session.userInfo || req.session.userInfo.isLogined !== true) {
        return res.redirect("/error?msg=Not logged in yet.");
    };
    const db = connectDB();
    try {
        const userInfo = await memberModel.findOne({ account : req.session.userInfo.account });
        const account = userInfo.account;
        const orderList = await orderModel.find({ account : account });
        res.render("member", { userInfo : userInfo, orders : orderList, manageHeader : req.session });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.get("/", async (req, res) => {
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };
        const db = connectDB();
        const member = await memberModel.find();
        res.render("members_manage", { members : member, manageHeader : req.session });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

// router.put("/:account", async (req, res) => {
//     const db = connectDB();
//     try {
//         const result = await memberModel.updateOne({account: req.params.account}, {$set: req.body});
//         res.status(200).send(result);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send({error : error.message});
//     };
// });

router.patch("/:id", async (req, res) => {
    const db = connectDB();
    try {
        const memberInfo = await memberModel.findOne({_id: req.params.id});
        // permission control
        if (memberInfo.account !== req.session.userInfo.account) {
            return res.status(403).send({ message : "Permission Denied"});
        };
        const result = await memberModel.updateOne({_id: req.params.id}, {$set: req.body});
        res.status(200).send({success: true, result});
    } catch (error) {
        console.log("member PATCH error:", error);
        res.status(500).json({error});
    };
});


module.exports = router;