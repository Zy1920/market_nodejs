const role_permissions=[
    {
        role:0,
        permission:[
            /.*\/product.*/,
            /.*\/order.*/,
            /.*\/category.*/
        ]
    },
    {
        role:100,
        permission:[/.*/]
    }
];
module.exports=function (req,res,next) {
    if (req.user){
        let isGo=false;
        role_permissions.forEach(el=>{
            if (el.role===req.user.role){
                el.permission.forEach(p=>{
                    if (p.test(req.url)){
                        isGo=true;
                    }
                })
            }
        });
        if (!isGo){
            throw new Error("当前用户权限不够");
        }
    }
    next();
}