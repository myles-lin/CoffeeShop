const express = require("express");
const app = express();
const portNum = 3000;

const path = require("path");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const session = require("express-session");
const { connectToMongoDB, closeMongoDBConnection } = require("./utils/db");
connectToMongoDB();

const redis = require("redis");
const redisClient = redis.createClient({
    // socket: {           /* run backend and redis docker container by docker-compose up */
    //     port: 6379,
    //     host: "redis"
    // }
}); 

redisClient.connect().catch(err => {console.error(err.message)}); // redis ver.4 cosnnect operation
const RedisStore = require("connect-redis").default;  // redis 對接套件

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
    store : new RedisStore({ client : redisClient}),
    secret : "pour over is good.",
    name : "_coffee",
    resave : true , // Forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized : false, // Forces a session that is “uninitialized” to be saved to the store. A session is uninitialized when it is new but not modified.
    ttl : 5
}));

// 引入 /router/xxx.js
const loginRouter = require("./router/login");
const registerRouter = require("./router/register");
const membersRouter = require("./router/members");
const productsRouter = require("./router/products");
const shoppingCartRouter = require("./router/shoppingCart");
const ordersRouter = require("./router/orders");

// 將 requests, 導入到 xxxRouter 處理
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/members", membersRouter);
app.use("/products", productsRouter);
app.use("/shoppingCart", shoppingCartRouter);
app.use("/orders", ordersRouter);

app.get("/", (req, res) => {
    console.log(req.session);
    console.log(req.sessionID);
    res.render("index",{manageHeader : req.session});
});

app.get("/signout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/error", (req, res) => {
    let message = req.query.msg;
    res.render("error", { message : message, manageHeader : req.session});
});

process.on('SIGINT', async () => {
    await closeMongoDBConnection();
    process.exit(0);
});

app.listen(portNum, ()=>{
    console.log(`Server is running at localhost:${portNum}`);
});
