import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import axios from "axios"

//async thunk to fetch user order
export const fetchUserOrder=createAsyncThunk("orders/fetchUserOrder",async (_,{rejectWithValue})=>{
    try {
        const response=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,{
            headers:{
                Authorization:`Bearer ${localStorage.getItem("userToken")}`,
            }
        })
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

//async thunk to fetch orders detail by id
export const fetchOrderDetails=createAsyncThunk("orders/fetchOrderDetails",async (fetchOrderDetails,{rejectWithValue})=>{
    try {
        const response=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,{
            headers:{
                Authorization:`Bearer ${localStorage.getItem("userToken")}`,
            }
        })
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

const orderSlice=createSlice({
    name:"orders",
    initialState:{
        orders:[],
        totalOrders:0,
        orderDetails:null,
        loading:false,
        error:null,
    },
    reducers:{},
    
    extraReducers:(builder)=>{
        builder.addCase(fetchUserOrder.pending,(state)=>{
            state.loading=true;
            state.error=null
        })
        .addCase(fetchUserOrder.fulfilled,(state,action)=>{
            state.loading=false;
            state.checkout=action.payload;
        })
        .addCase(fetchUserOrder.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload.message;
        })

        .addCase(fetchOrderDetails.pending,(state)=>{
            state.loading=true;
            state.error=null
        })
        .addCase(fetchOrderDetails.fulfilled,(state,action)=>{
            state.loading=false;
            state.checkout=action.payload;
        })
        .addCase(fetchOrderDetails.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload.message;
        })
    }
});

export default orderSlice.reducer;
