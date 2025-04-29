const express = require('express');
const {protect}=require('../middleware/authMiddleware')
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Checkout = require('../models/Checkout');

const router=express.Router();

//@route POST /api/checkout
//desc create a new checkout session
//access private
router.post("/",async(req,res)=>{
    const{checkoutItems, shippingAddress,paymentMethod,totalPrice}=req.body;

    if(!checkoutItems||checkoutItems.length===0){
        return res.status(400).json({message:"no items in checkout"});
    }

    try {
        // create a new checkout session
        const newCheckout=await Checkout.create({
            user:req.user._id,
            checkoutItems:checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus:"Pending,",
            isPaid:false,
        })
        res.status(201).json(newCheckout);

    } catch (error) {
        return res.status(500).json({message:"Server Error"});
    }
});

//@route PUT /api/checkout/:id/pay
//desc update checkout to mark as paid after successfull payment
//access private
router.put("/:id/pay",protect,async(req,res)=>{
    const{paymentDetail,paymentStatus}=req.body;


    try {
        const checkout=await Checkout.findById(req.params.id)

        if(!checkout){
            return res.status(404).json({message:"Checkout not found"});
        }

        if(paymentStatus==='paid'){
            checkout.isPaid=true;
            checkout.paymentStatus=paymentStatus;
            checkout.paymentDetails=paymentDetail;
            checkout.paidAt=Date.now();
            await checkout.save();

            res.status(200).json(checkout)
        }else{
            res.status(400).json({message:"Invalid Payment Status"});
        }
    } catch (error) {
        return res.status(500).json({message:"Server Error"});
    }
});

//@route Post /api/checkout/:id/finalize
//desc finalize checkout and covert to an order after payment conf
//access private
router.post("/:id/finalize",protect,async(req,res)=>{

    try {
        const checkout=await Checkout.findById(req.params.id);

        if(!checkout){
            res.status(404).json({message:"Checkout not found"});
        }
        if(checkout.isPaid && !checkout.isFinalized){
            //create final order based on checkout details
            const finalOrder=await Order.create({
                user:checkout.user,
                orderItems:checkout.checkoutItems,
                paymentMethod:checkout.paymentMethod,
                totalPrice:checkout.totalPrice,
                isPaid:true,
                paidAt:checkout.paidAt,
                isDelivered:false,
                paymentStatus:"paid",
                paymentDetails:checkout.paymentDetails
            });

            //mark checkout as finalized
            checkout.isFinalized=true;
            checkout.finalizedAt=Date.now();
            await checkout.save();

            //delete cart associate with user
            await Cart.findOneAndDelete({user:checkout.user})
            res.status(201).json(finalOrder)
        }else if(checkout.isFinalized){
            res.status(400).json({message:"Checkout already finalized"});
        }else{
            res.status(404).json({message:"Checkout not found"});
        }

    } catch (error) {
        return res.status(500).json({message:"Checkout is not paid"});
    }
});

module.exports=router;