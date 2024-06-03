const express = require("express");
const router = express.Router();
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");


/* LinePay setting */
require("dotenv").config();
const axios = require("axios");
const { HmacSHA256 } = require("crypto-js");
const Base64 = require('crypto-js/enc-base64');
const {
    LINEPAY_CHANNEL_ID,
    LINEPAY_CHANNEL_SECRET_KEY,
    LINEPAY_VERSION,
    LINEPAY_SITE,
    LINEPAY_RETURN_HOST,
    LINEPAY_RETURN_CONFIRM_URL,
    LINEPAY_RETURN_CANCEL_URL,
} = process.env;

function createSignature(uri, linePayBody) {
    const nonce = parseInt(new Date().getTime() / 1000);
    const string = `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(linePayBody)}${nonce}`;
    // 使用 crypto-js 套件, SHA256 進行加密, 最後轉成字串
    const signature = Base64.stringify(HmacSHA256(string, LINEPAY_CHANNEL_SECRET_KEY));

    const headers = {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': LINEPAY_CHANNEL_ID,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature
    };
    return headers;
}
/* LinePay setting end*/

router.get("/", async (req, res) => {
    try {
        // permission control
        if (req.session.userInfo.account !== "admin") {
            return res.status(403).send({ message : "Permission Denied"});
        };
        const order = await orderModel.find();
        res.render("orders_manage", { orders : order });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };
});

router.get("/:id", async (req, res) => {
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
    // reset req.session.cart.paymentInfo
    delete req.session.cart.paymentInfo;

    // check products inventory
    const cartProudct = req.session.cart.products;
    try {
        var errorList = [];
        var totalAmount = 0;
        var checkSuccess = true;  // 預設 true 若購物車商品有任何商品不足, 則改為 false, 不進入建立 order 
        for (let i = 0 ; i < cartProudct.length ; i++) {
            let inventory = await productModel.findOne({ name : cartProudct[i].name });
            totalAmount += cartProudct[i].quantity * cartProudct[i].price;
            if ( inventory.quantity < cartProudct[i].quantity) {
                var checkSuccess = false;
                let error = `"${cartProudct[i].name}" ordered quantity exceeded. [available quantity: ${inventory.quantity}]`;
                errorList.push(error);
            };
        };
        req.session.cart.paymentInfo = { 
            amount : totalAmount,
            recipientName : req.body.name,
            deliveryAddress : req.body.deliveryAddress
        };
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error : error.message});
    };

    if (checkSuccess === false) {
        return res.render("shoppingCart", { cart : req.session.cart.products, error : errorList, manageHeader : req.session });
    };

    try {
        // 訂單全部商品數量正確, 轉向第三方支付 linepay     

        // Deep Copy from (req.session.cart.products)
        let orderCopy = JSON.parse(JSON.stringify(req.session.cart.products));
        // delete linePayBody._id
        orderCopy.forEach(item => delete item._id);

        const order = {
            amount: req.session.cart.paymentInfo.amount,
            currency: 'TWD',
            packages: [
              {
                id: parseInt(new Date().getTime() / 1000).toString(),
                amount: req.session.cart.paymentInfo.amount,
                products: orderCopy
              }
            ],
            orderId: parseInt(new Date().getTime() / 1000).toString(),
          };   
        console.log(order);
        
        const linePayBody = {
            ...order, // 解構賦值 (Destructuring assignment)
            redirectUrls: {
                confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
                cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`
            }
        };
        console.log(linePayBody);
        // console.log(linePayBody.packages[0].products);
        
        const uri = "/payments/request";
        
        // Refactor to global function
        const headers = createSignature(uri, linePayBody);

        const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    
        // Send request to linepay (url, linePayBody, headers)
        const linePayRes = await axios.post(url, linePayBody, {headers});
        // console.log("linePayRes", linePayRes);
        
        // 使用可選串連(optional chaining operator) 避免巢狀物件改變而發生 TypeError
        if (linePayRes?.data?.returnCode === "0000") {
            // 將用戶轉址到 paymentUrl web 付款頁面
            res.redirect(linePayRes?.data?.info?.paymentUrl?.web);   
        };

    } catch (error) {
        console.log(error);
        res.send(error);
    };
})

router.get("/linePay/confirm", async (req,res) => {
    const { transactionId, orderId } = req.query;

    try {
        const linePayBody = {
            amount: req.session.cart.paymentInfo.amount,
            currency: "TWD"
        };
        
        const uri = `/payments/${transactionId}/confirm`;
        const headers = createSignature(uri, linePayBody);
        const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
        // Send request to linepay (url, linePayBody, headers)
        const linePayRes = await axios.post(url, linePayBody, {headers});
        console.log("linePayRes", linePayRes);
        
        // 將回傳的 transactionId 存入 session
        req.session.cart.paymentInfo["transactionId"] = linePayRes?.data?.info?.transactionId;
        
        if (linePayRes?.data?.returnCode === "0000") {
            // LinePay returnMessage: 'Success.', 

            // AUTO INCREMENT orderID in MongoDB order table (+1)
            const getLastItem = await orderModel.find().sort({orderId: -1}).limit(1);
            if (getLastItem.length === 0) {
                var seqId = 1;
            } else {
                var seqId = getLastItem[0].orderId + 1;
            };

            // 將 shopping cart 中購買的商品數量，更新至 product table
            for (let i = 0 ; i < req.session.cart.length ; i++) {
                const product = await productModel.updateOne({ _id : req.session.cart[i]._id }, { "$inc" : { quantity : -req.session.cart[i].quantity }});
            };

            const order = new orderModel({
                orderId : seqId,
                account : req.session.userInfo.account,
                purchase : req.session.cart.products,
                recipientName : req.session.cart.paymentInfo.recipientName,
                deliveryAddress : req.session.cart.paymentInfo.deliveryAddress,
                totalAmount: req.session.cart.paymentInfo.amount,
                status : "open",
                message : [],
                transactionId : req.session.cart.paymentInfo.transactionId
            });

            const orderPost = await order.save();
            // 清除 session.cart data
            delete req.session.cart;
            res.redirect(`/orders/${seqId}`);   
            };
    } catch (error) {
        console.log(error);
        res.send(error);
    };
});

router.post("/:id/message", async (req, res) => {
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