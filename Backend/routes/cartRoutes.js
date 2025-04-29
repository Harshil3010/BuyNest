const express = require('express');
const {protect}=require('../middleware/authMiddleware')
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router=express.Router();

//helper function to get cart by user id or guest id
const getCart=async(userId,guestId)=>{
    if(userId){
        return await Cart.findOne({user:userId});
    }else if(guestId){
        return await Cart.findOne({guestId});
    }
    return null;
}

//@route POST /api/cart
//desc add product to cart for guest or logged in user
//access public
router.post("/",async(req,res)=>{
    const{productId, quantity, size, color, guestId, userId}=req.body;
    try {
        const product=await Product.findById(productId)
        if(!productId) return res.status(400).json({message:"Product not found"});

        //determine user is logged in or guest
        let cart=await getCart(userId,guestId);

        //if cart exists, update it
        if(cart){
            const productIndex=cart.products.findIndex((p)=>p.productId.toString()===productId&&p.size===size&&p.color===color);
            if (productIndex>-1){
                //if product already exists update qunatity
                cart.products[productIndex].quantity+=quantity
            }else{
                cart.products.push({
                    productId,
                    name:product.name,
                    image:product.images[0].url,
                    price:product.price,
                    size,
                    color,
                    quantity,
                })
            }

            //recalculate the total price
            cart.totalPrice=cart.products.reduce((acc,item)=>acc+item.price*item.quantity,0);
            await cart.save();
            return res.status(200).json(cart);
        }else{
            //create new cart for guest or user
            const newCart=await Cart.create({
                user:userId?userId:undefined,
                guestId:guestId?guestId:"guest_"+new Date().getTime(),
                products:[
                    {
                        productId,
                        name:product.name,
                        image:product.images[0].url,
                        price:product.price,
                        size,
                        color,
                        quantity,                      
                    }
                ],
                totalPrice:product.price*quantity,
            })
            return res.status(201).json(newCart);
        }

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

//@route PUT /api/cart
//desc update product quantity to cart for guest or logged in user
//access public
router.put("/",async(req,res)=>{
    const{productId, quantity, size, color, guestId, userId}=req.body;

    try {
        let cart=await getCart(userId,guestId)
        if(!cart)return res.status(404).json({message:"Cart not found"});

        const productIndex=cart.products.findIndex((p)=>p.productId.toString()===productId&&p.size===size&&p.color===color)

        if (productIndex>-1){
            //update quantity
            if(quantity>0){
                cart.products[productIndex].quantity=quantity
            }else{
                cart.products.splice(productIndex,1);
            }
            cart.totalPrice=cart.products.reduce((acc,item)=>acc+item.price*item.quantity,0);
            await cart.save();
            return res.status(200).json(cart);

        }else{
            return res.status(404).json({message:"Product not found in cart"});
        }

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

//@route Delete /api/cart
//desc remove product from cart
//access public
router.delete("/",async(req,res)=>{
    const{productId, size, color, guestId, userId}=req.body;

    try {
        let cart=await getCart(userId,guestId);

        if(!cart)return res.status(404).json({message:"cart not found"});

        const productIndex=cart.products.findIndex((p)=>p.productId.toString()===productId&&p.size===size&&p.color===color)

        if (productIndex>-1){
                cart.products.splice(productIndex,1);
                cart.totalPrice=cart.products.reduce((acc,item)=>acc+item.price*item.quantity,0);
                await cart.save();
                return res.status(200).json(cart);
            }else{
                return res.status(404).json({message:"product not found in cart"});
            }
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
});

//@route GET /api/cart
//desc get logged in user`s or guest`s cart
//access public
router.get("/",async(req,res)=>{
    const{guestId, userId}=req.query;

    try {
        const cart=await getCart(userId,guestId);

        if(cart){
            res.json(cart);
        }else{
            res.status(404).json({message:"cart not found"});
        }
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

//@route Post /api/cart/merge
//desc merge guest cart into user cart on login
//access private
router.post("/merge",protect,async(req,res)=>{
    const{guestId}=req.body;

    try {
        //find guest cart and user cart
        const guestCart=await Cart.findOne({guestId})
        const userCart=await Cart.findOne({user:user._id})

        if(guestCart){
            if(guestCart.products.length===0){
                res.status(404).json({message:"guest cart is empty"});
            }

            if(userCart){
                //merge guest with user
                guestCart.products.forEach((guestItem)=>{
                    const productIndex=userCart.products.findIndex((item)=>item.productId.toString()===guestItem.productId.toString()&&item.size===guestItem.size && item.color===guestItem.color);

                    if (productIndex>-1){
                        //if item there update quantity
                        userCart.products[productIndex].quantity+=guestItem.quantity;
                    }else{
                        //otherwise,add guest item to cart
                        userCart.products.push(guestItem);
                    }
                });
                userCart.totalPrice=userCart.products.reduce((acc,item)=>acc+item.price*item.quantity,0);
                await userCart.save();

                //Remove guest cart after merging
                try {
                    await Cart.findOneAndDelete({guestId})
                } catch (error) {
                    
                }
                res.status(200).json(userCart)
            }else{
                //if no user cart assign guest cart
                guestCart.user=req.user._id
                guestCart.guestId=undefined;
                await guestCart.save();

                res.status(200).json(guestCart)
            }
        }else{
            if(userCart){
                //guest cart merged return user cart
                return res.status(200).json(userCart)
            }
            res.status(404).json({message:"guest cart not found"});
        }
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
})

module.exports=router