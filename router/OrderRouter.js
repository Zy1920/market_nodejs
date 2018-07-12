const express = require("express");
const router = express.Router();
const orderService = require("../service/order");

router.get("/",async(req,res,next)=>{
    const result = await orderService.getOrderByPage(req.query.page);
    res.success(result);
})

router.post("/",async(req,res,next)=>{
    await orderService.addOrder(req.body);
    res.success();
})

module.exports=router
