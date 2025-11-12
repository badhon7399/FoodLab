export function formatCurrency(amount) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
