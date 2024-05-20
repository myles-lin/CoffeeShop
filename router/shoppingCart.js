const express = require("express");
const router = express.Router();
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");


router.get("/", (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    };
    if (!req.session.userInfo) {
        res.redirect("/error?msg=請先登入會員。");
    } else {
        res.render("shoppingCart", { cart : req.session.cart, error : [] });
    }
});

router.post("/", (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }

    const product_id = req.body.product_id;
    const product_name = req.body.product_name;
    const product_quantity = req.body.product_quantity;
    const product_price = req.body.product_price;
    
    let existInCart = false;
    for (let i = 0 ; i < req.session.cart.length ; i++) {
        if (req.session.cart[i].product_id === product_id) {
            req.session.cart[i].product_quantity += parseFloat(product_quantity);
            existInCart = true;
        }
    }
    if (existInCart === false) {
        const cart_data = {
            product_id : product_id,
            product_name : product_name,
            product_quantity : parseFloat(product_quantity),
            product_price : parseFloat(product_price),
        };
        req.session.cart.push(cart_data);
    };
    res.redirect("/");
});

// router.post("/checkInventory", async (req, res) => {
//     const cart = req.session.cart;
//     const db = connectDB();
//     let errorList = [];
//     var checkSuccess = true;  // 預設 true 若購物車商品有任何商品不足, 則改為 false, 不進入建立 order 
//     for (let i = 0 ; i < req.session.cart.length ; i++) {
//         let inventory = await productModel.findOne({ _id : req.session.cart[i].product_id });
//         if ( inventory.quantity < req.session.cart[i].product_quantity) {
//             var checkSuccess = false;
//             let error = `"${req.session.cart[i].product_name}" ordered quantity exceeded. [available quantity: ${inventory.quantity}]`;
//             errorList.push(error);
//         };
//     };

//     if (checkSuccess === false) {
//         res.render("shoppingCart", { cart : req.session.cart, error : errorList});
//     } else {
//         console.log("All PASS !!!");
//         res.redirect(307, "/orders");
//     };
// });

router.delete("/:id", (req, res) => {
    const product_id = req.params.id;
    let data = req.session.cart;
    for (let i = 0 ; i < req.session.cart.length ; i++) {
        if (req.session.cart[i].product_id === product_id) {
            req.session.cart.splice(i, 1);
        };
    };
    res.status(200).send({ success: true, data });
});


module.exports = router;