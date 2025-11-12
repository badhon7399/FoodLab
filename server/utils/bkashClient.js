import axios from 'axios'
import bkashConfig from '../config/bkash.js'

if (!bkashConfig.baseURL) {
    throw new Error('BKASH_BASE_URL is not configured')
}

const http = axios.create({
    baseURL: bkashConfig.baseURL,
    headers: { 'Content-Type': 'application/json' },
})

let tokenCache = {
    token: null,
    expiresAt: 0,
}

function ensureCredentials() {
    const { username, password, appKey, appSecret } = bkashConfig
    if (!username || !password || !appKey || !appSecret) {
        throw new Error('bKash credentials are missing. Please check environment variables.')
    }
}

export async function grantToken() {
    ensureCredentials()
    const now = Date.now()
    if (tokenCache.token && tokenCache.expiresAt > now + 60_000) {
        return tokenCache.token
    }
    const { data } = await http.post('/tokenized/checkout/token/grant', {
        app_key: bkashConfig.appKey,
        app_secret: bkashConfig.appSecret,
    }, {
        headers: {
            username: bkashConfig.username,
            password: bkashConfig.password,
        },
    })
    if (!data?.id_token) {
        throw new Error('Failed to obtain bKash token')
    }
    tokenCache = {
        token: data.id_token,
        expiresAt: now + Number(data.expires_in || 3600) * 1000,
    }
    return tokenCache.token
}

async function authorizedRequest(method, url, payload) {
    const token = await grantToken()
    const headers = {
        Authorization: token,
        'X-APP-Key': bkashConfig.appKey,
    }
    const config = { method, url, headers }
    if (method.toLowerCase() === 'get') {
        config.params = payload
    } else {
        config.data = payload
    }
    const { data } = await http.request(config)
    return data
}

export async function createPaymentRequest({ amount, orderId, payerReference, callbackURL }) {
    return authorizedRequest('post', '/tokenized/checkout/create', {
        mode: '0011',
        payerReference,
        callbackURL,
        amount: Number(amount).toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: String(orderId),
    })
}

export async function executePaymentRequest(paymentID) {
    return authorizedRequest('post', '/tokenized/checkout/execute', { paymentID })
}

export async function queryPaymentRequest(paymentID) {
    return authorizedRequest('get', '/tokenized/checkout/payment/status', { paymentID })
}

export function resetTokenCache() {
    tokenCache = { token: null, expiresAt: 0 }
}
