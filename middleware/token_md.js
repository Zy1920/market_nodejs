const lxj = require("lxj-crypto");
const userService = require("../service/user");
const config = require("../config");


/**
 * 判断是否是忽略检查token的请求
 * @param url
 */
function isExcludeCheckReq(req) {
    let urls=[
        /.*\/user\/login/,
        /.*\/user\/register/
    ]
    let result=false;
    for(let i=0;i<urls.length;i++){
        if (urls[i].test(req.url)){
            result=true;
        }
    }
    return result;
}

module.exports=async function (req,res,next) {
    console.log(!isExcludeCheckReq(req));
    if(!isExcludeCheckReq(req)){
        const token=req.get("token");
        //检查有没有token
        if (!token){
            throw new Error("token不存在")
        }
        let tokenData=null;

        try {
            tokenData = JSON.parse(lxj.aesDecrypt(token, config.TokenKey));
        } catch (e) {
            throw new Error("token不合法")
        }
        // 由于tokenData中包含过期时间和username  1.检查是否过期
        if (tokenData.expire<Date.now()){
            throw new Error("token已经过期了")
        }
        //检查user是否存在
        const user = userService.findOne(tokenData.username);
        if(!user){
            throw new Error("user不存在")
        }
        req.user=user;
    }
    next();
}