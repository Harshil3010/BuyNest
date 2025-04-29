const express=require('express')
const {protect,admin}=require('../middleware/authMiddleware')
const Product=require('../models/Product')

const router=express.Router();

//@route Get /api/admin/products
//desc Get all products (Admin only)
//access Private/Admin
router.get("/",protect,admin,async(req,res)=>{
    try {
        const products=await Product.find({})
        res.json(products);
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
});

module.exports=router;