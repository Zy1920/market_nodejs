const Category = require("../model/category");
const config = require("../config");

/**
 * 根据id判断商品是否存在
 * @param id
 * @returns {Promise<void>}
 */
async function isCategoryExsit(id) {
    const res = await Category.findOne({_id:id});
    if (!res){
        throw new Error("商品分类不存在")
    }
}

/**
 * 增加商品分类
 * @returns {Promise<void>}
 */
async function addCategory(category) {
    Category.created=Date.now();
    return await Category.create(category);
}

/**
 * 根据id删除分类
 * @param id
 * @returns {Promise<void>}
 */
async function delCategory(id) {
    await isCategoryExsit(id);
    const res=await Category.deleteOne({_id:id});
    if(!res || res.n===0){
        throw Error("删除分类失败")
    }
}

/**
 * 根据id更新分类
 * @param id
 * @param update
 * @returns {Promise<void>}
 */
async function updateCategory(id,update) {
    await  isCategoryExsit(id)
    const res = await Category.updateOne({_id:id},update);
    if (!res||res.n==0){
        throw new Error("更新分类失败")
    }
}

/**
 * 根据页数查询分类
 * @param page
 * @returns {Promise<*>}
 */
async function getCategoryByPage(page=0) {
    return await Category.find({}).limit(config.PageCount).skip(config.PageCount*page).sort("-created").select("-__v")
}

module.exports={
    addCategory,delCategory,updateCategory,getCategoryByPage

}