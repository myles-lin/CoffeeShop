// middleware
let setSessionInfo = (req, res, next) => {
    req.session.userInfo = {
        name : req.body.account,
        isLogined : true
    };
    next();
};


module.exports = {
    "setSessionInfo" : setSessionInfo
};