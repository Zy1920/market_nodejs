const Order = require("../model/order");
const Product = require("./product");
const config = require("../config");

async function isOrderExsit(id) {
    const result = Order.findOne({_id: id});
    if(!result){
        throw new Error("订单不存在");
    }
}

/**
 * 通过id获取订单
 * @param id
 * @returns {Promise<void>}
 */
async function getOrderById(id) {
    isOrderExsit(id);
    return await Order.findOne({_id:id});
}

async function addOrder(order) {
    //根据商品id查询出商品
    const product = await Product.getProductById(order.productId);
    if (!product){
        throw new Error("商品不存在")
    }
    if (order.count>product.stock){
        throw new Error("商品库存不够")
    }
    order.productName=product.name;
    order.productPrice=product.price;
    order.total=order.productPrice*order.count;

    const result = await Order.create(order);
    //商品减库存
    const updates = {
        stock:product.stock-order.count
    }
    await Product.updateProduct(order.productId,updates);
    return result;
}

async function getOrderByPage(page=0) {
    return await Order.find().limit(config.PageCount).skip(page*config.PageCount).sort("-created").select("-__v");
}




module.exports={getOrderById,getOrderByPage,addOrder}
