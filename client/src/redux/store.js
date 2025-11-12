import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import cartReducer from './slices/cartSlice.js'
import orderReducer from './slices/orderSlice.js'

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
    },
})

export default store
