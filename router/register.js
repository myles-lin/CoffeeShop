const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require("../utils/db");
const memberModel = require("../models/memberModel");

router.get("/", (req, res) => {
    res.render("register", {manageHeader : req.session});
});

router.post("/", async (req, res) => {
    const db = connectDB();
    try {
        let account = req.body.account;
        let password = req.body.password;

        let result = await memberModel.findOne({ account : account });
        if (result !== null) {
            res.redirect("/error?msg=信箱已經被註冊。");
        } else {
            const member = new memberModel({
                account : account,
                password : password
            });
            await member.save();
            res.redirect("/");
        };
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

module.exports = router;