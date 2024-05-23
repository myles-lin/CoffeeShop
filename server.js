const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectDB = require("./utils/db");

const app = express();
const portNum = 3000;

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
    saveUninitialized : false, // Forces a session that is “uninitialized” to be saved to the store. A session is uninitialized when it is new but not modified.
    ttl : 5
}));

// 引入 /router/members.js
const loginRouter = require("./router/login");
const registerRouter = require("./router/register");
// const adminRouter = require("./router/adminAuth");
const membersRouter = require("./router/members");
const productsRouter = require("./router/products");
const shoppingCartRouter = require("./router/shoppingCart");
const ordersRouter = require("./router/orders");



app.get("/", (req, res) => {
    console.log(req.session);
    console.log(req.sessionID);
    res.render("index",{manageHeader : req.session});
});

// app.get("/login", (req, res) => {
//     if (req.session.userInfo !== undefined) {
//         res.redirect("/");
//     } else {
//         res.render("login", {manageHeader : req.session});
//     }
// });

// app.post("/login", async (req, res, next) => {
//     const db = connectDB();
//     try {
//         let account = req.body.account;
//         let password = req.body.password;
//         let result = await memberModel.findOne({
//             '$and' : [
//                 { account : account },
//                 { password : password}
//             ]
//         });

//         if (result !== null) {
//             next();
//         } else {
//             res.redirect("/error?msg=帳號或密碼輸入錯誤。");
//         };
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send({error : error.message});
//     };
//     },
//     validator.setSessionInfo,
//     (req, res) => {
//         res.redirect("/");
//     }
// );

app.get("/signout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/error", (req, res) => {
    let message = req.query.msg;
    res.render("error", { message : message, manageHeader : req.session});
});

// 將 /members 的 requests, 導入到 booksRouter 處理
app.use("/login", loginRouter);
app.use("/register", registerRouter);
// app.use("/adminAuth", adminRouter);login
app.use("/members", membersRouter);
app.use("/products", productsRouter);
app.use("/shoppingCart", shoppingCartRouter);
app.use("/orders", ordersRouter);

app.listen(portNum, ()=>{
    console.log(`Server is running at localhost:${portNum}`);
});
