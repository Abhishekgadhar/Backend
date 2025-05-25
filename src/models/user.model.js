import mongoose, {Schema}  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const Userschema = new mongoose.Schema(
{
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,    //cloudary url
        required:true
    },
    coverImage:{
        type:String,    
    },

    watchHistory:[{
    type: Schema.Types.ObjectId,
    ref:"video"
}],
    password:{
        type:String,
        required:[true, "password is required" ] 
     },
     refreshToken:{
        type:String
     }
     
},{timestamps:true})


Userschema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password,10)
    next()
}
)

Userschema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password ,this.password)
}

Userschema.methods.genetateAccessToken= function(){

  return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username :this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
Userschema.methods.genetateRefreshToken =function(){

    
  return jwt.sign(
    {
        _id: this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User",Userschema)