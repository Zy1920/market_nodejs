let config = null;

// 默认是不成立的，所以会走开发环境的配置
if(process.env.NODE_ENV==='production'){
    // 引入prod.js
    config = require('./prod')
}else {
    // 引入dev.js
    config = require('./dev')
}

module.exports = config;