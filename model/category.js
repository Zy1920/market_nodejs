const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"商品名不能为空"],
        unique:true
    },

    created:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model("category",schema)