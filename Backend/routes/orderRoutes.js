const express = require('express');
const {protect}=require('../middleware/authMiddleware')
const Order=require("../models/Order")

const router=express.Router();


//@route GET /api/orders/my-orders
//desc get logged in users products
//access private

router.get("/my-orders",protect,async(req,res)=>{
    try {
        //find orders for authenticated products
        const orders=await Order.find({user:req.user._id}).sort({createdAt:-1})
        res.json(orders);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
})

//@route GET /api/orders/:id
//desc get order detail by id
//access private
router.get("/:id",protect,async(req,res)=>{
    try {
        const order=await Order.findById(req.params.id).populate("user","name email");

        if(!order){
            return res.status(400).json({message:"order not found"});
        }

        res.json(order)
    } catch (error) {
        return res.status(500).json({message:"Server Error"});
    }
})

module.exports=router
