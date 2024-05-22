const express = require("express");
const router = express.Router();
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");


router.get("/", (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    };
    if (!req.session.userInfo) {
        res.redirect("/error?msg=Please login first");
    } else {
        res.render("shoppingCart", { cart : req.session.cart, error : [] , manageHeader : req.session});
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