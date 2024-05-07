const express = require("express");
const app = express();
const portNum = 4000;
const path = require("path");
const hbs = require("hbs");
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const connectDB = require("./utils/db");
const memberModel = require("./models/memberModel");

// 設定模板引擎
app.engine("html", hbs.__express);
// 設定 template 路徑
app.set("views", path.join(__dirname, "public", "views"));
// 設定靜態檔案路徑
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 引入 /router/members.js
const membersRouter = require("./router/members");
const registerRouter = require("./router/register");
const booksRouter = require("./router/books");
const aboutRouter = require("./router/about");

app.get("/", (req, res) => {
    res.render("index.html");
});

app.post("/login", async (req, res) =>{
    const db = connectDB();
    let username = req.body.username;
    let password = req.body.password;
    let result = await memberModel.findOne({
        '$and' : [
            { username : username },
            { password : password}
        ]
    });
    console.log(result);
    if (result === null) {
        res.redirect("/error?msg=帳號或密碼輸入錯誤。");
    } else {
        res.redirect("/members")
    };
});

app.get("/error", (req, res) => {
    // let message = "發生錯誤，請聯繫客服。";
    let message = req.query.msg;
    res.render("error.html", { message : message });
});

// 將 /members 的 requests, 導入到 booksRouter 處理
app.use("/register", registerRouter);
app.use("/members", membersRouter);
app.use("/books", booksRouter);
app.use("/about", aboutRouter);

app.listen(portNum, ()=>{
    console.log(`Server is running at localhost:${portNum}`);
});
