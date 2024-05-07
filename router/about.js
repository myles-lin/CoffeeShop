const express = require("express");
const router = express.Router();

router.get("/", (req,res) => {
    res.send("This is /about router");
});

router.get("/testqq", (req,res) => {
    let name = req.query.name;
    let item = req.query.item;
    res.send(`This /about/testqq , Hi ${name}, you deicded to buy ${item}`);
});

module.exports = router;