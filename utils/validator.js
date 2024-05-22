// middleware
let setSessionInfo = (req, res, next) => {
    req.session.userInfo = {
        account : req.body.account,
        isLogined : true
    };
    next();
};


module.exports = {
    "setSessionInfo" : setSessionInfo
};