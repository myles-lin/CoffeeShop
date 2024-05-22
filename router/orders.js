const express = require("express");
const router = express.Router();
const connectDB = require("../utils/db");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const memberModel = require("../models/memberModel");

router.get("/", async (req, res) => {
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };
        const db = connectDB();
        const order = await orderModel.find();
        res.render("orders_manage", { orders : order });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.get("/:id", async (req, res) => {
    const db = connectDB();
    try {
        const orderData = await orderModel.findOne({ orderId : req.params.id });
        console.log(orderData);
        // permission control
        if (orderData.account !== req.session.userInfo.account && req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };
        res.render("orders_page", { orders : orderData, manageHeader : req.session });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.post("/", async (req, res) => {
    // check products inventory
    const cart = req.session.cart;
    const db = connectDB();
    try {
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
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };

    if (checkSuccess === false) {
        return res.render("shoppingCart", { cart : req.session.cart, error : errorList});
    };

    try {
        // 訂單全部商品數量正確, 更新product table數量, 開始下訂單

        // AUTO INCREMENT orderID (+1)
        const getLastItem = await orderModel.find().sort({orderId: -1}).limit(1);
        if (getLastItem.length === 0) {
            var seqId = 1;
        } else {
            var seqId = getLastItem[0].orderId + 1;
        };

        // 將 shopping cart 中購買的商品數量，更新至 product table
        for (let i = 0 ; i < req.session.cart.length ; i++) {
            const product = await productModel.updateOne({ _id : req.session.cart[i].product_id }, { "$inc" : { quantity : -req.session.cart[i].product_quantity }});
        };

        const order = new orderModel({
            orderId : seqId,
            account : req.session.userInfo.account,
            purchase : req.session.cart,
            name : req.body.name,
            deliveryAddress : req.body.deliveryAddress,
            totalAmount: totalAmount,
            status : "open",
            message : []
        });
        const orderPost = await order.save();
        // 清除 session.cart data
        delete req.session.cart;
        res.redirect(`/orders/${seqId}`);

    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.post("/:id/message", async (req, res) => {
    const db = connectDB();
    try {
        const message = req.body.message;
        const date = new Date();
        const id = req.body.orderId;
        const order = await orderModel.findOne({ orderId : id });

        // permission control
        if (order.account !== req.session.userInfo.account && req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };

        if (order.message.length === 0) {
            var seqId = 1;
        } else {
            // 讓新加入的array[0] auto +1
            var seqId = order.message[order.message.length - 1][0] + 1;
        };
        const data = [seqId, req.session.userInfo.account, message, date.toLocaleString()];
        order.message.push(data);
        const orderPost = await order.save();
        res.redirect(`/orders/${id}`);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.delete("/:id/message", async (req, res) => {
    const db = connectDB();
    try {
        const order = await orderModel.findOne({ orderId : req.params.id });
        // permission control
        if (order.account !== req.session.userInfo.account && req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };

        const msgId = parseInt(req.body.msgId);

        for (let i = 0 ; i < order.message.length ; i++) {
            if (order.message[i][0] === msgId) {
                // 搜尋 message[i][0] 為要刪除的 msgId
                order.message.splice(i, 1);
                const result = await order.save();
                res.status(200).send({ success: true, result });
            }
        };
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

module.exports = router;