const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const memberModel = require("../models/memberModel");

router.get("/", (req, res) => {
    res.render("register.html");
});

router.post("/", async (req, res) => {
    const db = connectDB();
    let username = req.body.username;
    let password = req.body.password;

    let result = await memberModel.findOne({ username : username });
    if (result !== null) {
        // res.send("信箱已被註冊過，請更換其他信箱。");
        res.redirect("/error?msg=信箱已經被註冊。");
    } else {
        const member = new memberModel({
            username : username,
            password : password
        });
        member.save();
        res.redirect("/members");
    };
});

module.exports = router;