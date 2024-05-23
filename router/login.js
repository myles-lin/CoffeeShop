const express = require("express");
const router = express.Router();
const connectDB = require("../utils/db");
const validator = require("../utils/validator");
const memberModel = require("../models/memberModel");

router.get("/", (req, res) => {
    if (req.session.userInfo !== undefined) {
        res.redirect("/");
    } else {
        res.render("login", {manageHeader : req.session});
    }
});

router.post("/", async (req, res, next) => {
    const db = connectDB();
    try {
        let account = req.body.account;
        let password = req.body.password;
        let result = await memberModel.findOne({
            '$and' : [
                { account : account },
                { password : password}
            ]
        });

        if (result !== null) {
            next();
        } else {
            res.redirect("/error?msg=帳號或密碼輸入錯誤。");
        };
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
    },
    validator.setSessionInfo,
    (req, res) => {
        res.redirect("/");
    }
);

module.exports = router;