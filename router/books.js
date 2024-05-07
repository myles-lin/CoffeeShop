// 建立 Router
const express = require("express");
const router = express.Router();  // 產生 router 物件, 存入變數

// 路徑設定 API 設計
router.get("/", (req, res) => {
    res.send("我是 /books root");
});

router.get("/page", (req, res) => {
    // res.redirect("/");
    res.json({ message : "我是 /books/page root"});
});

// 將 router 導出, 等著別人 require 引入使用
module.exports = router;