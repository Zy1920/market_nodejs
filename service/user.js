const userModel = require("../model/user");
const config = require("../config/index");
const lxj = require("lxj-crypto");

/**
 * 根据用户名判断用户是否存在
 * @param username
 * @returns {Promise<void>}
 */
async function isUserExist(username) {
    const result = await userModel.findOne({username:username});
    if (result){
        throw new Error(`用户名为${username}的用户已经存在了`)
    }
}

/**
 * 添加一个用户 用户的注册
 * @param user
 * @returns {Promise<void>}
 */
async function addUser(user) {
    const result = await userModel.findOne({username:user.username});
    isUserExist(user)
    //对密码进行加密,加密的方式：使用username作为随机数对password进行哈希
    user.password=lxj.md5Hmac(user.password,user.username)
    user.role=0
    user.created=Date.now()
    await userModel.create(user)
}


/**
 * 根据用户名删除某个用户
 * @param username
 * @returns {Promise<void>}
 */
async function deleteUser(username) {
    const res = await userModel.deleteOne({username:username});
    if(!res || res.n===0){
        throw Error("删除用户失败")
    }
}

/**
 * 根据用户名更新某个用户
 * @param username
 * @param update
 * @returns {Promise<void>}
 */
async function updateUser(username,update) {
    const res = await userModel.updateOne({username:username},update);
    if(!res || res.n===0){
        throw Error("更新用户失败")
    }
}


/**
 * 根据用户名获取某个用户
 * @param username
 * @returns {Promise<void>}
 */
async function findOne(username) {
    return await userModel.findOne({username:username});
}

/**
 * 获取所有用户
 * @returns {Promise<*>}
 */
async function findAll() {
    return await userModel.find();
}

/**
 * 用户登录
 * @returns {Promise<void>}
 */
async function login(user) {
    user.password=lxj.md5Hmac(user.password,user.username)
    const res = userModel.findOne({username:user.username,password:user.password});
    if(!res){
        throw new Error("用户名或者密码不正确")
    }

    let tokenData={
        username:user.username,
        expire:Date.now()+config.TokenExpire,
    }

    let token=lxj.aesEncrypt(JSON.stringify(tokenData),config.TokenKey);
    return token;
}

module.exports={
    addUser,deleteUser,updateUser,findOne,findAll,login
}




