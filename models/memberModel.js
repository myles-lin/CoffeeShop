const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    nickname : String,
    address : String
}, {
    collection : "member"
});

const memberModel = mongoose.model("member", memberSchema);
module.exports = memberModel;