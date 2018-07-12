require("./db")

require("express-async-errors");
const config = require("./config");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();

//注册日志打印中间件
app.use(morgan("combined"))

//注册body_parser中间件
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(require("./middleware/res_md"));
app.use(require("./middleware/token_md"));
app.use(require("./middleware/permission_md"));

app.use("/user",require("./router/userRouter"));
app.use("/category",require("./router/CategoryRouter"));
app.use("/product",require("./router/ProductRouter"));
app.use("/order",require("./router/OrderRouter"));

app.use((err,req,res,next)=>{
    res.fail(err.toString())
})

app.listen(config.PORT)