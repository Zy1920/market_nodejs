const config = require("./config");
const mongoose = require("mongoose");
mongoose.connect(`mongodb://localhost/${config.DB}`)
const db = mongoose.connection;

db.on("error",(err)=>{
    console.log(err.toString());
})

db.on("open",()=>{
    console.log("mongodb connect successfully!~~~");
})