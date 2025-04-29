const express=require('express')
const {protect,admin}=require('../middleware/authMiddleware')
const User=require('../models/User')

const router=express.Router();

//@route Get /api/admin/users
//desc Get all users (Admin only)
//access Private/Admin
router.get("/",protect,admin,async(req,res)=>{
    try {
        const users=await User.find({})
        res.json(users);
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
});

//@route Post /api/admin/users
//desc add a new user (Admin only)
//access Private/Admin
router.post("/",protect,admin,async(req,res)=>{
    const {name,email,password,role}=req.body

    try {
        let user=await User.findOne({email})
        if(user){
            return res.status(400).json({message:"User already exists"})
        }

        user=new User({
            name,
            email,
            password,
            role:role || "customer",
        })

        await user.save();
        res.status(201).json({message:"User created successfully",user})
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

//@route PUT /api/admin/users/:id
//desc update user info(Admin only)-name,email,role
//access Private/Admin
router.put("/:id",protect,admin,async(req,res)=>{
    try {
        const user=await User.findById(req.params.id)
        if(user){
            user.name=req.body.name||user.name;
            user.email=req.body.email||user.email;
            user.role=req.body.role||user.role;
        }
        const updatedUser=await user.save();
        res.json({message:"User created successfully",user:updatedUser})
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

//@route Delete /api/admin/users/:id
//desc delete a user
//access Private/Admin
router.delete("/:id",protect,admin,async(req,res)=>{
    try {
        const user=await User.findById(req.params.id)
        if(user){
            await user.deleteOne();
            res.json({message:"User deleted successfully"})
        }else{
            res.status(404).json({message:"User not found"})
        }
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

module.exports=router