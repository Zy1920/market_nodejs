const express = require("express");
const router = express.Router();
const CategoryService = require("../service/category");

//增加分类
router.post("/",async (req,res,next)=>{
    await CategoryService.addCategory(req.body)
    res.success()
})

//删除分类
router.delete("/:id",async (req,res,next)=>{
    await CategoryService.delCategory(req.params.id)
    res.success()
})

//修改分类
router.put("/:id",async (req,res,next)=>{
    console.log("xixi");
    await CategoryService.updateCategory(req.params.id,req.body)
    res.success()
})

//查询分类
router.get("/",async (req,res,next)=>{
    const result = await CategoryService.getCategoryByPage(req.query.page);
    res.success(result)
})

module.exports=router
