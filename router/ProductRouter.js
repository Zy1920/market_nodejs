const express = require("express");
const router = express.Router();
const ProductService = require("../service/product");

router.post("/",async(req,res,next)=>{
    await ProductService.addProduct(req.body);
    res.success();
})

router.delete("/:id",async(req,res,next)=>{
    await ProductService.delProduct(req.params.id);
    res.success();
})

router.put("/:id",async(req,res,next)=>{
    await ProductService.updateProduct(req.params.id,req.body)
    res.success();
})

router.get("/",async(req,res,next)=>{
    const productsByPage = await ProductService.getProductsByPage(req.query.page);
    res.success(productsByPage);
})

module.exports=router