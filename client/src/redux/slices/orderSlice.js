import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    orders: [],
}

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setOrders(state, action) {
            state.orders = action.payload
        },
        addOrder(state, action) {
            state.orders.unshift(action.payload)
        },
    },
})

export const { setOrders, addOrder } = orderSlice.actions
export default orderSlice.reducer
