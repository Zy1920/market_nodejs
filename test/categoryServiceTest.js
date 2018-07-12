const db = require("../db");
const categoryService = require("../service/category");

async function testaddCategory(category) {
    category={
        name:"服装"
    }
    categoryService.addCategory(category)
}

async function testdelCategory(id) {
    categoryService.delCategory( "5b46ddfbcec7b51464b2d088");
}

async function testupdateCategory(id,update) {
    categoryService.updateCategory("5b46ddfbcec7b51464b2d088","彩妆")
}

async function testgetCategoryByPage(page) {
    categoryService.getCategoryByPage(0);

}



testgetCategoryByPage()