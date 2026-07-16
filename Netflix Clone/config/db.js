const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database Connected");
    app.listen(process.env.PORT || 10000,()=>{
        console.log("Server running");
    });
})
.catch((err)=>{
    console.log("Database Error:",err.message);
});
