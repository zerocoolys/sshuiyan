var token = require('express').Router();


token.post("/", tokener)
token.get("/", tokener)

function tokener(req, res, next) {

    var tokenid = req.query['tokenid'];
    //tokenid = tokenid.split("").reverse().join("");

    if (!validate(tokenid)) {
        res.send("tokenid is invalidate.");
        return;
    }
    req.redisclient.get(tokenid, function (error, redis_res) {
        if (error) {
            res.redirect("http://sem.best-ad.cn/login")
            return;
        } else {
            var userinfo = JSON.parse(redis_res);
            //console.log(userinfo)
            req.session.user = userinfo;
            //if (userinfo.baiduAccounts.length > 0) {
            //    req.session.currentBaiduUser = userinfo.baiduAccounts[0];
            //    req.session.accountid = userinfo.baiduAccounts[0].id
            //    req.session.accountname = userinfo.baiduAccounts[0].baiduUserName
            //}
            res.redirect("/");
            return;
        }
    })

}

function validate(id) {
    return !!id && id.length > 0 && id.length < 64
}
module.exports = token;