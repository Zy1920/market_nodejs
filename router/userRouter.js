const express = require("express");
const router = express.Router();
const userService = require("../service/user");

//添加用户
router.post("/register",async (req,res)=>{
    await userService.addUser(req.body);
    res.success();
})

//删除用户
router.delete("/:username",async(req,res)=>{
    await userService.deleteUser(req.params.username);
    res.success();
})

//更新用户
router.put("/:username",async(req,res)=>{
    await userService.updateUser(req.params.username,req.body);
    res.success();
})

//查询用户
router.get("/:username",async(req,res)=>{
    const result =  await userService.findOne(req.params.username);
    res.success(result);
})

//查询所有
router.get("/",async(req,res)=>{
    const result = await userService.findAll();
    res.success(result);
})

//用户登录
router.post("/login",async(req,res)=>{
    const token=await userService.login(req.body)
    res.success(token);
})

module.exports=router;