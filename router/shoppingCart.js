const express = require("express");
const router = express.Router();
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");


router.get("/", (req, res) => {
    if (!req.session.cart) {
        req.session.cart = { products : [] };
    };
    if (!req.session.userInfo) {
        res.redirect("/error?msg=Please login first");
    } else {
        res.render("shoppingCart", { cart : req.session.cart.products, error : [] , manageHeader : req.session});
    }
});

router.post("/", (req, res) => {
    if (!req.session.cart) {
        req.session.cart = { products : [] };
    }

    const product_id = req.body.product_id;
    const product_name = req.body.product_name;
    const product_quantity = req.body.product_quantity;
    const product_price = req.body.product_price;
    
    let existInCart = false;
    for (let i = 0 ; i < req.session.cart.products.length ; i++) {
        if (req.session.cart.products[i]._id === product_id) {
            req.session.cart.products[i].quantity += parseFloat(product_quantity);
            existInCart = true;
        }
    }
    if (existInCart === false) {
        const cart_data = {
            _id : product_id,
            name : product_name,
            quantity : parseFloat(product_quantity),
            price : parseFloat(product_price),
        };
        req.session.cart.products.push(cart_data);
    };
    res.redirect("/");
});

router.delete("/:id", (req, res) => {
    const product_id = req.params.id;
    let data = req.session.cart.products;
    for (let i = 0 ; i < req.session.cart.products.length ; i++) {
        if (req.session.cart.products[i]._id === product_id) {
            req.session.cart.products.splice(i, 1);
        };
    };
    res.status(200).send({ success: true, data });
});


module.exports = router;