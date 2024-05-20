const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require('mongoose');
const connectDB = require("./utils/db");
const memberModel = require("./models/memberModel");
const validator = require("./utils/validator");

const app = express();
const portNum = 5000;

// 設定模板引擎
app.engine("html", hbs.__express);
app.set('view engine', 'ejs');
// 設定 template 路徑
app.set("views", path.join(__dirname, "public", "views"));
// 設定靜態檔案路徑
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret : "pour over is good.",
    name : "_coffee",
    resave : true , // Forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized : false // Forces a session that is “uninitialized” to be saved to the store. A session is uninitialized when it is new but not modified.
}));

// 引入 /router/members.js
const registerRouter = require("./router/register");
const adminRouter = require("./router/adminAuth");
const membersRouter = require("./router/members");
const productsRouter = require("./router/products");
const shoppingCartRouter = require("./router/shoppingCart");
const ordersRouter = require("./router/orders");
const booksRouter = require("./router/books");

app.get("/", (req, res) => {
    console.log(req.session);
    res.render("index.html");
});

app.get("/login", (req, res) => {
    if (req.session.userInfo !== undefined) {
        res.redirect("/");
    } else {
        res.render("login.html");
    }
});

app.post("/login", async (req, res, next) => {
    const db = connectDB();
    let account = req.body.account;
    let password = req.body.password;
    let result = await memberModel.findOne({
        '$and' : [
            { account : account },
            { password : password}
        ]
    });
    // console.log(result);
    if (result !== null) {
        next();
    } else {
        res.redirect("/error?msg=帳號或密碼輸入錯誤。");
    };
    },
    validator.setSessionInfo,
    (req, res) => {
        res.redirect("/");
    }
);

app.get("/signout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/error", (req, res) => {
    // let message = "發生錯誤，請聯繫客服。";
    let message = req.query.msg;
    res.render("error.html", { message : message });
});

// 將 /members 的 requests, 導入到 booksRouter 處理
app.use("/register", registerRouter);
app.use("/adminAuth", adminRouter);
app.use("/members", membersRouter);
app.use("/products", productsRouter);
app.use("/shoppingCart", shoppingCartRouter);
app.use("/orders", ordersRouter);
app.use("/books", booksRouter);

app.listen(portNum, ()=>{
    console.log(`Server is running at localhost:${portNum}`);
});
