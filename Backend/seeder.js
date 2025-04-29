const dotenv=require('dotenv');
const mongoose=require('mongoose');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Product = require('./models/Product');
const products = require('./data/products');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

//function to seed data
const seedData=async()=>{
    try {
        //clear existing data
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        //create a default admin user
        const createdUser=await User.create({
            name:"Admin User",
            email:"admin@example.com",
            password:"123456",
            role:"admin"
        })

        //assign default user id to each product
        const userID=createdUser._id;

        const sampleProducts = products.map((product)=>{
            return {...product,user:userID};
        });

        //insert products into database
        await Product.insertMany(sampleProducts)
        process.exit();

    } catch (error) {
        process.exit(1);
    }
}

seedData();
