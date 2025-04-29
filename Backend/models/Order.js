const mongoose=require ("mongoose");

const orderItemSchema=new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    size:String,
    color:String,
    quantity:{
        type:Number,
        required:true,
    },

},
{ _id:false}
);

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    checkoutItems:[orderItemSchema],
    shippingAddress:{
        address:{type:String,require:true},
        city:{type:String,require:true},
        postalCode:{type:String,require:true},
        country:{type:String,require:true},
    },
    paymentMethod:{ 
        type:String,
        required:true,
    },
    totalPrice:{
        type:Number,
        required:true,
    },
    isPaid:{
        type:Boolean,
        default:false,
    },
    paidAt:{
        type:Date,
    },
    paymentStatus:{
        type:String,
        default:"pending"
    },
    isDelivered:{
        type:Boolean,
        default:false,
    },
    deliveredAt:{
        type:Date,
    },
    status:{
        type:String,
        enum:["Processing","Shipped","Delivered","Cancelled"],
        default:"Processing"
    },
    // paymentDetails:{
    //     type:mongoose.Schema.Types.Mixed,
    // },
    
},
{timestamps:true},
)

module.exports=mongoose.model("Order",orderSchema);