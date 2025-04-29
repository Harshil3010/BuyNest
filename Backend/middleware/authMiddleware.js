const User = require('../models/User');
const jwt=require('jsonwebtoken')

//middleware to protect routes
const protect=async(req,resizeBy,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token=req.headers.authorization.split(" ")[1];
            const decoded=jwt.verify(token, process.env.JWT_SECRET);

            req.user=await User.findById(decoded.user.id).select("-password")
            next();
        } catch (error) {
            res.status(401).json({message:"Not authorized, token failed"});
        }
    }else{
        res.status(401).json({message:"Not authorized, no token provided"});
    }
}

//middleware to check if user is a admin
const admin=(req,res,next)=>{
    if(req.user&&req.user.role==='admin'){
        next();
    }else{
        res.status(403).json({message:"Not authorized as admin"})
    }
}

module.exports={protect, admin};