// require('dotenv').config({path: './env'})
// or other method

import dotenv from "dotenv"
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants";  
import connectDB from "./db/index.js";
 
dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
   app.listen(process.env.PORT || 8000 , () => {
      console.log(`server is running at port : ${process.env.PORT}`)
   })
})
.catch((err)=>{
   console.log("MONGO DB CONNECTION FAILED !!!",err);
})






/*

{{{{
/*

FIRST APPROCH TO CONNECT TO DB
--> WRITE IN INDEX.JS CONNECTION
-->USE TRY CATCH & ASYNC 

}}}}}


import express from "express"
const app =expree()


 ( async()=>{
    try{
 await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
 app.on("errror", (error)=> {
    console.log("ERRR:", error);
    throw error 
 })
 app.listen(process.env.PORT,()=>{
    console.log(`App is listening  on port ${process.env.PORT}`);
 })
    }catch(error){
        console.error("ERROR: ",error)
        throw err
    }
  })()
    */