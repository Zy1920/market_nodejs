const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"商品名不能为空"],
        unique:true
    },
    price:{
        type:String,
        required:[true,"商品价格不能为空"]
    },
    stock:{
        type:Number,
        default:0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,"商品分类不能为空"]
    },
    description:{
        type:String
    },
    isOnSale:{
        type:Boolean,
        default:true
    },
    created:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model("product",schema)