const express = require("express");
const router = express.Router();
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");

router.get("/", async (req, res) => {
    console.log("orders get router");
});


router.post("/", async (req, res, next) => {
    console.log("orders post router");
    // check products inventory
    const cart = req.session.cart;
    const db = connectDB();
    let errorList = [];
    var totalAmount = 0;
    var checkSuccess = true;  // 預設 true 若購物車商品有任何商品不足, 則改為 false, 不進入建立 order 
    for (let i = 0 ; i < req.session.cart.length ; i++) {
        let inventory = await productModel.findOne({ _id : req.session.cart[i].product_id });
        totalAmount += req.session.cart[i].product_quantity * req.session.cart[i].product_price;
        if ( inventory.quantity < req.session.cart[i].product_quantity) {
            var checkSuccess = false;
            let error = `"${req.session.cart[i].product_name}" ordered quantity exceeded. [available quantity: ${inventory.quantity}]`;
            errorList.push(error);
        };
    };

    if (checkSuccess === false) {
        res.render("shoppingCart", { cart : req.session.cart, error : errorList});
    } else {

        try {
            // 訂單全部商品數量正確, 更新product table數量, 開始下訂單

            // AUTO INCREMENT orderID (+1)
            const getLastItem = await orderModel.find().sort({orderId: -1}).limit(1);
            if (getLastItem.length === 0) {
                var seqId = 1;
            } else {
                var seqId = getLastItem[0].orderId + 1;
            };

            const order = new orderModel({
                orderId : seqId,
                account : req.session.userInfo.name,
                purchase : req.session.cart,
                totalAmount: totalAmount,
                status : "open",
                message : []
            });
            const orderPost = await order.save();
            res.redirect("/orders");

        } catch (error) {
            console.log("Order POST error:", error);
            res.status(500).json({error});
        };
    };
});

module.exports = router;