const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

//@route Post /api/products
//@desc create a new product
//@access Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

//@route PUT /api/products/:id
//@desc Update existing product id
//@access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountedPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    //find product from db using id
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountedPrice = discountedPrice || product.discountedPrice;
      product.countInStock = countInStock || product.countInStock;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.sizes = sizes || product.sizes;
      product.colors = colors | product.colors;
      product.collections = collections || product.collections;
      product.material = material || product.material;
      product.gender = gender || product.gender;
      product.images = images || product.images;
      product.isFeatured =
        isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isPublished =
        isPublished !== undefined ? isPublished : product.isPublished;
      product.tags = tags || product.tags;
      product.dimensions = dimensions || product.dimensions;
      product.weight = weight || product.weight;
      product.sku = sku || product.sku;

      //save updated product
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

//@route DELETE /api/products/:id
//@desc delete existing product id
//@access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

//@route GET /api/products
//@desc get all products with optional query filters and sorting
//@access Public
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    //filter logic
    if (collection && collection.toLocaleLowerCase() !== "all") {
      query.collections = collection;
    }

    if (category && category.toLocaleLowerCase() !== "all") {
      query.category = category;
    }

    if (material) {
      query.material = { $in: material.split(",") };
    }

    if (brand) {
      query.brand = { $in: brand.split(",") };
    }

    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (gender) {
      query.gender = gender;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    //sort logic
    sort={}
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDec":
          sort: { price: -1};
          break;
        case"popularity":
         sort:{rating:-1};
         break;
         default:
            break;
      }
    }

    //fetch products and apply sorting and limit
    let products=await Product.find(query).sort(sort).limit(Number(limit)||0);
    res.json(products);

  } catch (error) {
    res.status(500).send('server error')
  }
});

//@route GET /api/products/best-seller
//@desc retrive product with highest rating
//@access Public
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller=await Product.findOne().sort({rating:-1})
    if(bestSeller){
      res.json(bestSeller)
    }else{
      res.status(404).json({ message: "No bestseller found" });
    }
  } catch (error) {
    res.status(500).send('server error');
  }
})

//@route GET /api/products/new-arrivals
//@desc Retrive latest 8 products by creation date
//@access Public
router.get("/new-arrivals", async (req, res) => {
    try {
      const newArrivals=await Product.find().sort({createdAt:-1}).limit(8);
      res.json(newArrivals)
    } catch (error) {
      res.status(500).send('server error');
    }
})


//@route GET /api/products/:id
//@desc get single product by id
//@access Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(product){
      res.json(product);
    }else{
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send('server error');
  }
})

//@route GET /api/products/similar/:id
//@desc retrive similar products based on current product`s gender and category
//@access Public
router.get("/similar/:id", async (req, res) => {
 const{id}=req.params;

 try {
  const product=await Product.findById(id);

  if(!product){
    res.status(404 ).json({message:"product not found"})
  }

  const similarProducts=await Product.find({
    _id:{$ne:id},
    gender:product.gender,
    category:product.category,
  }).limit(4);

  res.json(similarProducts)
 } catch (error) {
  res.status(500).send('server error');
 }
})


module.exports = router;
