import React, { useEffect, useState } from 'react'
import Hero from '../components/layout/Hero'
import GenderCollectionSection from '../components/products/GenderCollectionSection'
import NewArrivals from '../components/products/NewArrivals'
import ProductDetails from '../components/products/ProductDetails'
import ProductGrid from '../components/products/ProductGrid'
import FeaturedCollection from '../components/products/FeaturedCollection'
import FeaturesSection from '../components/products/FeaturesSection'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsByFilters } from '../redux/slices/productsSlice'
import axios from 'axios'

// const placeHolderProducts=[
//   {
//     _id:1,
//     name:'product1',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=1"}],
//   },
//   {
//     _id:2,
//     name:'product2',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=2"}],
//   },
//   {
//     _id:3,
//     name:'product3',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=3"}],
//   },
//   {
//     _id:4,
//     name:'product4',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=4"}],
//   },
//   {
//     _id:5,
//     name:'product5',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=5"}],
//   },
//   {
//     _id:6,
//     name:'product6',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=6"}],
//   },
//   {
//     _id:7,
//     name:'product7',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=7"}],
//   },
//   {
//     _id:8,
//     name:'product8',
//     price:100,
//     images:[{url:"https://picsum.photos/500/500?random=8"}],
//   },
// ]


const Home = () => {
  const dispatch=useDispatch();
  const {products,loading,error}=useSelector((state)=>state.products);
  const [bestSellerProduct,setBestSellerProduct]=useState(null);
  
  useEffect(()=>{
    //fetch product for a specific collection
    dispatch(fetchProductsByFilters({
      gender:"Women",
      category:"Top Wear",
      limit:8,
    }))
  
    //fetch best seller product
    const fetchBestSeller=async()=>{
      try {
        const response=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`)
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error(error)
      }
    }
    fetchBestSeller();
  },[dispatch])
  return (
    <div>
       <Hero/> 
       <GenderCollectionSection/>
       <NewArrivals/>

       {/* best seller */}
       <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>

        {bestSellerProduct?(<ProductDetails productId={bestSellerProduct._id}/>):(
          <p className='text-center'>Loading best sellers product</p>
        )}
       {/* <ProductDetails/> */}

       <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top Wears for Women
        </h2>
        <ProductGrid products={products} loading={loading} error={error}/>
       </div>

       <FeaturedCollection/>
       <FeaturesSection/>
    </div>
  )
}

export default Home