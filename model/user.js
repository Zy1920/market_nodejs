const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"用户名不能为空"]
    },
    password:{
        type:String,
        required:[true,"密码不能为空"]
    },
    age:{
        type:Number,
        min:[0,"年龄不能小于0"],
        max:[100,"年龄不能大于100"]
    },
    role:{
        //0:普通商家 100：超级管理员
        type:Number,
        default:0
    },
    created:{
        type:Date,
        default:Date.now()
    }
});

module.exports=mongoose.model("user",schema);