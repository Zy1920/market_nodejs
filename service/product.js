const Product = require("../model/product");
const config = require("../config");

/**
 * 根据id判断商品是否存在
 * @param id
 * @returns {Promise<void>}
 */
async function isProductExist(id) {
    const result = Product.findOne({_id:id});
    if (!result){
        throw new Error("商品不存在")
    }
}

/**
 * 增加一个商品
 * @param product
 * @returns {Promise<*>}
 */
async function addProduct(product) {
    product.date=Date.now();
    return await Product.create(product);
}

/**
 * 根据id删除某个商品
 * @param id
 * @returns {Promise<void>}
 */
async function delProduct(id) {
    await isProductExist(id);
    const res = await Product.deleteOne({_id:id});
    if (!res||res.n==0){
        throw new Error("删除商品失败")
    }
}

/**
 * 更新商品
 * @param id
 * @param update
 * @returns {Promise<void>}
 */
async function updateProduct(id,update) {
    await isProductExist(id);
    const res = await Product.updateOne({_id:id},update);
    if (!res||res.n==0){
        throw new Error("更新商品失败")
    }
}

/**
 *根据id获取一个商品
 * @param id
 * @returns {Promise<void>}
 */
async function getProductById(id) {
    return await Product.findOne({_id:id});
}

/**
 * 根据页码获取商品
 * @param page
 * @returns {Promise<void>}
 */
async function getProductsByPage(page=0) {
    if(page<0){
        throw Error("page不能小于0")
    }

    let products = await Product.find({}).limit(config.PageCount).skip(config.PageCount*page).sort("-created").select("-__v");
    return products
}


module.exports={addProduct,delProduct,updateProduct,getProductById,getProductsByPage}