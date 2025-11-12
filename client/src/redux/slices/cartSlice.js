import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    items: [], // { _id, name, price, quantity }
    total: 0,
}

function recalcTotal(items) {
    return items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const incoming = action.payload
            const id = incoming._id || incoming.id
            const existing = state.items.find(i => (i._id || i.id) === id)
            if (existing) existing.quantity += 1
            else state.items.push({ ...incoming, _id: id, quantity: 1 })
            state.total = recalcTotal(state.items)
        },
        removeFromCart(state, action) {
            const id = action.payload
            state.items = state.items.filter(i => (i._id || i.id) !== id)
            state.total = recalcTotal(state.items)
        },
        updateQuantity(state, action) {
            const { id, quantity } = action.payload
            const item = state.items.find(i => (i._id || i.id) === id)
            if (item) {
                item.quantity = Math.max(1, Number(quantity) || 1)
                state.total = recalcTotal(state.items)
            }
        },
        clearCart(state) {
            state.items = []
            state.total = 0
        },
    },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
