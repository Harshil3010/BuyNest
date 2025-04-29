import React, { useEffect, useRef, useState } from 'react'
import {FaFilter} from 'react-icons/fa'
import FilterSidebar from '../components/products/FilterSidebar';
import SortOptions from '../components/products/SortOptions';
import ProductGrid from '../components/products/ProductGrid';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../redux/slices/productsSlice';

const CollectionPage = () => {
  const {collection}=useParams();
  const [searchParams]=useSearchParams();
  const dispatch=useDispatch()
  const{products,loading,error}=useSelector((state)=>state.products)
  const queryParams=Object.fromEntries([...searchParams])

    // const[products,setProducts]=useState([]);
    const sidebarRef=useRef(null)
    const[isSideBarOpen,setIsSideBarOpen]=useState(false)

    useEffect(()=>{
      dispatch(fetchProductsByFilters({ collection,...queryParams}))
    },[dispatch,collection,searchParams])

    const toggleSidebar=()=>{
        setIsSideBarOpen(!isSideBarOpen)
    }


    const handleClickOutside=(e)=>{
        // closes side bar if clicked outside
        if(sidebarRef.current && !sidebarRef.current.contains(e.target)){
            setIsSideBarOpen(false)
        }
    }

    useEffect(()=>{
        // add event listner for clicks
        document.addEventListener("mousedown",handleClickOutside)
        // clean event listner
        return()=>{
          document.removeEventListener("mousedown",handleClickOutside)
        }
    },[])

    // useEffect(()=>{
    //     setTimeout(()=>{
    //         const fetchedProducts=[
    //             {
    //               _id:1,
    //               name:'product1',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=1"}],
    //             },
    //             {
    //               _id:2,
    //               name:'product2',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=2"}],
    //             },
    //             {
    //               _id:3,
    //               name:'product3',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=3"}],
    //             },
    //             {
    //               _id:4,
    //               name:'product4',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=4"}],
    //             },
    //             {
    //               _id:5,
    //               name:'product5',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=5"}],
    //             },
    //             {
    //               _id:6,
    //               name:'product6',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=6"}],
    //             },
    //             {
    //               _id:7,
    //               name:'product7',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=7"}],
    //             },
    //             {
    //               _id:8,
    //               name:'product8',
    //               price:100,
    //               images:[{url:"https://picsum.photos/500/500?random=8"}],
    //             },
    //           ]
    //           setProducts(fetchedProducts)
    //     },1000)
    // },[])

  return (
    <div className='flex flex-col lg:flex-row'>
        {/* mobile filter button */}
        <button onClick={toggleSidebar} className='lg:hidden border p-2 flex justify-center items-center'>
            <FaFilter className='mr-2'/> Filters
        </button>

        {/* filter side bar */}
        <div ref={sidebarRef} className={`${isSideBarOpen?"translate-x-0":"-translate-x-full fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0"}`}>
            <FilterSidebar/>
        </div>

        <div className="flex-grow p-4">
            <h2 className="text-2xl uppercase mb-4 ">All Collection</h2>

            {/* sort options */}
            <SortOptions/>

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} error={error}/>
        </div>
    </div>
  )
}

export default CollectionPage