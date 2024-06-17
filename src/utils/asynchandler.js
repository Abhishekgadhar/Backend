// approch 1: using promises
const asyncHandler =(requestHandler)=>{
    (req,res,next )=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }

}
export {asyncHandler}



//-------------------------------------------------------
//  2 aproch 
// asynch using try catch
/*
const asyncHandler =( fn)=>async (req ,res ,next)=>{
try{
await fn(req,res,next)
}catch(error){
    res.status(err.code || 500).json({
        success: false,
        message : err.message
    })
}

}
*/