## 项目实战：电商管理后台

目标，实现一个有账户模块，权限模块，商品和分类模块和订单模块，给商家和管理员使用的后台系统。

项目采用前后端分离的开发方式，本身只实现API功能，并没有提供界面。



### 项目结构搭建和实施流程

在之前TODO项目的基础上，增加一个`middleware`包和test包，前者用来存放中间件的包，因为权限管理需要用中间件来实现；后者是测试相关包。

1. 每个模块的实现顺序为：model层 --> service层 --> router层。
2. 单元测试：service层写脚本测试；router层使用postman测试。

### 配置文件的环境切换

开发环境和生产环境的配置一般是不一样的，比如端口配置，数据库配置。一般我们是通过环境变量`NODE_ENV`来区分。为了能够动态切换配置，就需要根据当前`NODE_ENV`的值来加载不同的配置对象。

做法就是：

1. 建立config目录，创建`dev.js`和`prod.js`分别存放对应的配置信息
2. 编写`index.js`，实现动态切换配置的逻辑。

### 编写入口文件

添加依赖：

```bash
npm i body-parser express express-async-errors mongoose morgan
```

编写`app.js`和`db.js`文件。

#### app.js

```js
//引入dib
require('./db')

const config = require('./config');
const morgan = require('morgan')
const bodyParser = require('body-parser');
const express = require('express')
// 引入异常捕获处理
require('express-async-errors');

const app = express();

//注册中间件
// log中间件
app.use(morgan('combined'));

//注册自定义的中间件

// 注册body-parser中间件
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// 注册路由
app.use("/users", require('./router/account'));

// 注册异常处理中间件
app.use((err, req, res, next)=>{
    res.fail(err.toString())
});

//启动
app.listen(config.PORT);
```

#### db.js

```js
const config = require('./config');
const mongoose  = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1/${config.DB}`);

const db = mongoose.connection;

db.on('error', (err)=>{
    console.log(err);
});

db.on("open", ()=>{
    console.log("mongodb connect successfully!");
});
```



### 账户模块

先编写model，再service，最后router；最后对service和router进行测试。

#### REST中间件

为了方便进行REST结果的返回，我们编写一个`res_md.js`中间件，作用是给每个res对象安装2个方法，注意该中间件注册的顺序尽量放在前面。代码如下：

```js
module.exports = function (req, res, next) {
  res.success = (data = null) =>{
    res.send({
        code: 0,
        msg: "操作成功",
        data: data
    })
  };
  res.fail = (msg)=>{
    res.send({
        code: -1,
        msg: msg
    })
  };

  next();
};
```

#### 账户model

```js
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "用户名不能缺少"]
    },
    password: {
        type: String,
        required: [true, "密码不能缺少"]
    },
    age: {
        type: Number,
        min: [0, "年龄不能小于0"],
        max: [120, "年龄不能大于120"]
    },
    role: {
        type: Number,
        default: 0 // 0是商家， 10086是管理员
    },
    created:{
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('user', schema);
```

#### 账户service

```js
const User = require('../model/user');
const config = require('../config')
const crypto = require('lxj-crypto')

/**
 * 根据用户名获取某个用户
 * @param username
 * @returns {Promise<*>}
 */
async function getUserByUsername(username) {
    return await User.findOne({username: username}).select("-__v")
}


async function checkCanInsertUser(user) {
    //检查密码是否为空
    if(!user.password || user.password.length===0){ 
        throw Error("密码不能为空")
    }
    //检查用户是否已经存在
    let res = await getUserByUsername(user.username);
    if(res){
        throw Error("用户名已经存在")
    }
}


/**
 * 添加普通用户
 * @param user
 * @returns {Promise<void>}
 */
async function addUser(user) {
    await checkCanInsertUser(user);

    user.role = 0;
    user.created = Date.now();

    //对密码进行加密,加密的方式：使用username作为随机数对password进行哈希
    user.password = crypto.md5Hmac(user.password, user.username)
    await User.create(user)
}

async function deleteUser(id) {
    let res = await User.deleteOne({_id:id});
    if(!res || res.n===0){
        throw Error("删除用户失败")
    }
}

/**
 * 登录的方法
 * @param user
 * @returns token
 */
async function login(user) {
    // 1. 对密码进行加密
    user.password = crypto.md5Hmac(user.password, user.username)
    // 2. 进行查询
    let res = await User.findOne({username:user.username, password: user.password});
    if(!res){
        throw Error("用户名或者密码错误")
    }

    // 说明用户名和密码验证成功，需要生产token返回给客户端，以后客户端的header中带上这个token
    // token 生产方法：用aes进行对指定的data加密
    let tokenData = {
        username: user.username,
        expire: Date.now() + config.TokenDuration
    };
    let token = crypto.aesEncrypt(JSON.stringify(tokenData), config.TokenKey);
    return token
}

module.exports = {
    getUserByUsername,
    addUser, 
    deleteUser,
    login
};
```



#### 账户router

```js
let router = require("express").Router();
let accountService = require('../service/accout')


router.get("/:username", async (req, res)=>{
    let user = await accountService.getUserByUsername(req.params.username);
    res.success(user);
});

// 登录
router.post("/login", async (req, res)=>{
    let token = await accountService.login(req.body);
    res.success({token});
});

// 注册
router.post("/register", async (req, res)=>{
    await accountService.register(req.body)
    res.success()
});

router.delete("/:id", async (req, res)=>{
    await accountService.deleteUser(req.params.id)
    res.success()
});

module.exports = router;
```



## 商品分类模块

#### 分类model

```js
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "分类名称不能少"],
        unique: true
    },
    created:{
        type:Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('category', schema);
```



#### 分类service

```js
const Category = require('../model/category')
const config = require('../config')
async function getCategorysByPage(page=0) {
    let categorys = await Category.find().limit(config.PageCount).skip(config.PageCount*page).sort("-created").select("-__v")
    return categorys
}

async function addCategory(category) {
    category.created = Date.now()
    await Category.create(category)
}

async function deleteCategory(id) {
    let res = await Category.deleteOne({_id: id})
    if(!res || res.n===0){
        throw Error("删除分类失败")
    }
}

async function updateCategory(id, update) {
    let res = await Category.updateOne({_id: id}, update)
    if(!res || res.n===0){
        throw Error("更新分类失败")
    }
}

module.exports = {
    getCategorysByPage, addCategory, deleteCategory, updateCategory
}
```



#### 分类router

```js
let router = require('express').Router()
let categoryService = require('../service/category')

router.get("/", async (req,res, next)=>{
    let page = req.query.page || 0
    let categorys = await categoryService.getCategorysByPage(page)
    res.success(categorys)
});

router.post("/", async (req,res, next)=>{
    await categoryService.addCategory(req.body)
    res.success()
})

router.delete("/:id", async (req,res, next)=>{
    await categoryService.deleteCategory(req.params.id)
    res.success()
})

router.put("/:id", async (req,res, next)=>{
    await categoryService.updateCategory(req.params.id, req.body)
    res.success()
})

module.exports = router
```



## 商品模块

#### 商品model

```js
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "商品名字不能少"],
        unique: true
    },
    price: {
        type: String,  
        required:[true, "商品价格不能少"]
    },
    stock: {
        type: Number,
        default: 0,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "分类id不能为空"]
    },
    description:{
        type: String,
    },
    isOnSale:{   //是否上架
        type: Boolean,
        default: true
    },
    created:{
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('product', schema)
```

#### 商品service

```js
const Product = require('../model/product')
const config = require('../config')

async function getProductsByPage(page=0) {
    if(page<0){
        throw Error("page不能小于0")
    }

    let products = await Product.find({}).limit(config.PageCount).skip(config.PageCount*page).sort("-created").select("-__v");
    return products
}

async function getProductById(id) {
    let res = await Product.findOne({_id: id});
    return res
}

async function updateProductById(id, update) {
    let res = await Product.updateOne({_id: id}, update);
    if(!res || res.n ===0){
        throw Error("更新失败")
    }
}

async function deleteProduct(id) {
    let res = await Product.deleteOne({_id: id})
    if(!res || res.n ===0){
        throw Error("删除失败")
    }
}

async function addProduct(product) {
    product.created = Date.now()
    let res = await Product.create(product)
}
module.exports = {
    getProductsByPage, getProductById, updateProductById, deleteProduct, addProduct
}
```

#### 商品router

```js
let router = require('express').Router()
let productService = require('../service/product')

router.get("/", async (req, res, next)=>{
    let page = req.query.page 
    let products = await productService.getProductsByPage(page);
    res.success(products)
});

router.post("/", async (req,res,next)=>{
   await productService.addProduct(req.body)
    res.success()
});

router.put("/:id", async (req,res,next)=>{
    await productService.updateProductById(req.params.id, req.body)
    res.success()
});

router.delete("/:id", async (req,res,next)=>{
    await productService.deleteProduct(req.params.id)
    res.success()
});

module.exports = router;
```





## 订单模块

#### 订单model

```js
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "商品id不能为空"]
    },
    productName:{
        type: String,
        required:[true, "商品名字不能缺少"]
    },
    productPrice: {
        type: String,
        required: [true, "商品价格不能缺少"]
    },
    count: {
        type: Number,
        required: [true, "商品数量不能为空"],
        min:[1, "商品数量不能小于1"]
    },
    total:{
        type: String
    },
    status: {
      type: String, // 订单状态: unpay success cancel
      default:"unpay"
    },
    created: {
        type:Date,
        default: Date.now(),
    },
    payTime: {
        type: Date
    },
    cancelTime: Date
});

module.exports = mongoose.model('order', schema);
```



#### 订单service

```js
'use strict'

const Order = require('../model/order')
const config = require('../config');
const productService = require('./product')
const Big = require('big.js');

async function getOrdersByPage(page = 0) {
    return await Order.find().limit(config.PageCount).skip(page*config.PageCount).sort("-created").select("-__v")
}

async function getOrderById(id) {
    return await Order.findOne({_id: id})
}

async function addOrder(order) {
    //1. 根据商品id查询出商品
    let product = await productService.getProductById(order.productId);
    if(!product){
        throw Error("未找到商品")
    }
    //判断库存够不够
    if(product.stock < order.count){
        throw Error("商品库存不够")
    }

    order.productName = product.name;
    order.productPrice = product.price;
    order.total = Big(order.productPrice).times(order.count);
    order.created = Date.now();
    let res = await Order.create(order)

    //2. 减去库存
    let update = {
        stock: product.stock - order.count
    };
    await productService.updateProduct(order.productId, update)
    return res
}

module.exports = {
    getOrdersByPage, getOrderById,
    setOrderSuccess, setOrderCancel,
    addOrder
};
```



#### 订单router

```js
const router = require('express').Router()
const orderService = require('../service/order')

router.get("/", async (req, res, next) => {
    let page = req.query.page || 0
    let orders = await orderService.getOrdersByPage(page)
    res.success(orders)
});

router.get("/:id", async (req,res,next)=>{
   res.success(await orderService.getOrderDetail(req.params.id))
});

router.post("/", async (req,res,next)=>{
   let order = await orderService.addOrder(req.body)
    res.success(order)
});

module.exports = router;
```





## 权限管理模块

主要分2个部分，一个是登录token认证，一个是权限管理。

1. token认证，就是指有的接口需要token才能访问，有的不需要。比如：登录和注册接口不需要token，但是商品的增删改查必须要token。
2. 权限管理是指，有的接口指定角色的用户才能调用，不是该角色的人应该直接报错。比如：用户信息获取和删除用户只能管理员角色操作，商家用户则没有这个权限。

这2个部分显然需要在每次请求前进行处理，所以应该用中间件实现。

我们编写2个中间件，`token_md.js`和`permission_md.js`。

#### token中间件

```js
let crypto = require('lxj-crypto');
let config = require('../config')
let accountService = require('../service/accout')
let isExcludeUrl = require('../util/token_util');

/**
 * 判断req是否是排除检查token的请求
 * @param req
 */
function isExcludeCheckReq(req) {
    // 不需要token的url
    let urls = [
        /.*\/user\/login/,
        /.*\/user\/register/
    ];
    let result = false;
    for (let i = 0; i < urls.length; i++) {
        let urlReg = urls[i];
        if(urlReg.test(req.url)){
            result = true;
            break;
        }
    }

    return result
}

module.exports = async function (req, res, next) {
    if (!isExcludeCheckReq(req.url)) {

        //检查有没有token，通过
        let token = req.get('token') || null;
        if (!token) {
            throw Error("缺少token")
        }

        let tokenData = null;
        try {
            //解码token, 检查token是否过期
            tokenData = JSON.parse(crypto.aesDecrypt(token, config.TokenKey))
            // console.log(tokenData.toString() + " now: " + Date.now());
        } catch (e) {
            // 说明解码失败，需要抛出一个明确的异常
            throw Error("token不合法")
        }
        // 由于tokenData中包含过期时间和username
        //1. 检查是否过期
        if (tokenData.expire < Date.now()) {
            throw Error("token已过期")
        }
        //2. 检查username是否存在，以防止非法用户
        let user = await accountService.getUserByUsername(tokenData.username);
        if (!user) {
            throw Error("token不合法")
        }
        // 说明username合法，将user信息赋予req上下文对象，这样后续的每个中间件和处理函数都能直接从req中取出user使用
        req.user = user;
    }
    // 最后不要忘了放行
    next()
};
```

#### permission中间件

```js
'use strict'
// 负责检查某个接口是否对当前用户的role能否调用
// 具体如下：
// 1. 管理员所有接口都可以调用
// 2. 商家用户能全部调用：商品相关，订单相关，商品分类相关，
//    账户相关：只能调用登录和注册

// 将角色和它对应的权限组成一个映射，然后根据当前用户的role去判断是否符合它对应的权限即可

const role_permissions = [
    // 商家角色，和它对应的权限正则
    {
        role: 0,
        permission: [
            /.*\/product.*/,
            /.*\/order.*/,
            /.*\/category.*/
        ]
    },
    // 管理员角色，和它对应的权限正则
    {
        role: 100,
        permission: [
            /.*/
        ]
    }
];

module.exports = function (req, res, next) {
    // 如果是验证过的用户才去判断
    // console.log("user："+JSON.stringify(req.user));
    if(req.user){
        let isGo = false;
        role_permissions.forEach(el => {
            if(el.role === req.user.role){
                el.permission.forEach(p=>{
                    if(p.test(req.url)){
                        isGo = true;
                    }
                });
            }
        });

        if (!isGo) {
            throw Error("当前用户权限不够")
        }
    }

    next()
};
```



## PM2集群搭建

由于NodeJs是单线程，无法利用多核CPU的优势。想要利用多核CPU，就要进行多进程。NodeJs的cluster模块提供了多进程的支持，PM2又进一步增强了该模块的功能。

PM2能实现单机内的多进程集群，充分利用多核CPU的性能，提高网站的性能。如果是多机器的集群，需要使用nginx来搭建。

编写PM2配置文件：

```yaml
apps:
  - script   : app.js
    name: xxx
    instances: max
    exec_mode: cluster
    watch  : true
    env:
      NODE_ENV: production
```

然后指定这个配置文件来运行:

```bash
pm2 start xxxx.yml
```



## 线上部署

### 云主机选择

- 注册阿里云主机，最低配置
- 可以多人合买

### 部署工作流

以ubuntu环境为例：

- 使用xshell客户端进行远程登录


- 安装nodejs和mongodb
- Server端安装Git，用来同步代码
- 工作流：本地代码更新->提交到远程git仓库->登录远程服务器更新代码，PM2会自动重启app程序