import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import cartReducer from './slices/cartSlice.js'
import orderReducer from './slices/orderSlice.js'
import favoritesReducer from './slices/favoritesSlice.js'

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
        favorites: favoritesReducer,
    },
})

export default store
