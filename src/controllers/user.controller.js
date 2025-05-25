import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadoncloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken";

const genetateAccessAndRefreshTokens = async(userId)=>{
    try {
          const user  = await User.findById(userId);
          const accessToken = user.genetateAccessToken()
          const refreshToken = user.genetateRefreshToken()
          user.refreshToken = refreshToken;
          await user.save({validateBeforeSave: false})
          return {accessToken,refreshToken}
    } catch (error) {
      throw new ApiError(500,"Something wrong genetrating tokens")
      
    }
}

const registerUser = asyncHandler(async (req ,res)=>{
 

  //  console.log("req.files:", req.files);
  //  console.log("req.body: ",req.body);

  const {fullname,email,username,password} = req.body;
  console.log("email:",email);
  

  if(
    [fullname,email,username,password].some((field)=>
    field?.trim() === "")
  ){
    throw new ApiError(400 ,"ALL FIELDS ARE REQUIRED");
  }

  const existedUser= await User.findOne({
    $or:[{ username },{ email }]
  })
  if(existedUser){
    throw new ApiError(409,"User with email or username already exist");
  }


console.log("req.files:",req.files);
const avatarLocalPath = req.files?.avatar?.[0]?.path;


// const CoverImageLocalPath=req.files?.coverImage[0]?.path;


let CoverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
  CoverImageLocalPath =req.files.coverImage[0].path
}



console.log("avatarlocalpath:",avatarLocalPath);
// console.log("coverimagelocalpath",CoverImageLocalPath);



if(!avatarLocalPath){
  throw new ApiError(400, "Avatar is required");
}




console.log("alf:",avatarLocalPath);

const avatar= await uploadoncloudinary(avatarLocalPath);

const coverImage = await uploadoncloudinary(CoverImageLocalPath);

console.log("avatar :", avatar);

if(!avatar){
  throw new ApiError(400,"avatar field is required");
}

 const user =await User.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
});


const createdUser=await User.findById(user._id).select(
  "-password -refreshToken"
)
if(!createdUser){
  throw new ApiError(500,"Something went wrong while registering the user")
}

return res.status(201).json(
  new ApiResponse(200 ,createdUser,"User Registered Successfully")
)
});

const loginUser = asyncHandler( async (req,res)=>{
 const {email,username,password} = req.body;
 
 if(!username && !email){
  throw new ApiError(400,"username or email is required")
 }
 const user = await User.findOne(
  {
    $or:  [{email},{username}]
  }
  );
if(!user){
 throw new ApiError(404,"user does not exist");

}
 const ispasswordvalid =  await user.isPasswordCorrect(password);

if(!ispasswordvalid){
throw new ApiError(401,"Password incorrect")
}


  const {accessToken,refreshToken}=await genetateAccessAndRefreshTokens(user._id);

   const loggedInuser = await User.findById(user._id).select("-password -refreshToken")

  const options= {
     httpOnly:true,
     secure: true
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,
      {
        user: loggedInuser,accessToken,refreshToken,

      },
      "User logged In Successfully"
    )
  )
} )
const logoutuser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },{
      new: true
    }
  )
  const options= {
     httpOnly:true,
     secure: true
  }
 return  res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200, "User sucessfully logout")
  )

})

const refreshAccessToken = asyncHandler(async (req,res)=>{

  const incommingtoken = req.cookie.refreshToken || req.body.refreshToken

  if(!incommingtoken){
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedtoken = jwt.verify(incommingtoken , process.env.REFRESH_TOKEN_SECRET) 
     
    const user = await User.findById(decodedtoken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
  
    if(incommingtoken !== user?.refreshToken){
      throw new ApiError(401 ,"Refresh Token is expired or used")
    }
   
    const options ={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,newrefreshToken} = await genetateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(200,
        {accessToken,refreshToken: newrefreshToken},
        "Access Token refreshed "
      )
    )
  } catch (error) {
    throw new ApiError(401 , error?.message || "Invalid refresh token")
  }

})






// **Default export**
export { registerUser,
         loginUser,
         logoutuser,
         refreshAccessToken 

 };



//SIGNIN
// get user details from frontend
// validation -not empty
//check if user already exits ,username and passeotd
//check from images,check for avatar
//upload them to cloudinary,avater
//create user object -create entry in db
//remove password and refresh token field from response
//check for user creation 
// return res


//LOGIN
// req.body() sa Data 
// username or email 
// find the user
// password check
// access and refersh token
// send cookies

//LOGOUT
//remove cookies
//finding user by middelware
