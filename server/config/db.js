import mongoose from 'mongoose'

export default async function connectDb() {
    const uri = process.env.MONGO_URI
    if (!uri) {
        console.error('❌ MONGO_URI is not set in .env file')
        throw new Error('MONGO_URI is not set. Please add it to your .env file')
    }

    mongoose.set('strictQuery', true)

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log('✅ MongoDB connected successfully')
    } catch (error) {
        console.error('❌ MongoDB connection error:')
        if (error.code === 8000 || error.codeName === 'AtlasError') {
            console.error('   Authentication failed. Please check:')
            console.error('   1. Your MongoDB Atlas username and password in MONGO_URI')
            console.error('   2. Your IP address is whitelisted in Atlas Network Access')
            console.error('   3. Your database user has proper permissions')
            console.error('\n   Example MONGO_URI format:')
            console.error('   mongodb+srv://username:password@cluster.mongodb.net/foodlab?retryWrites=true&w=majority')
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error('   Cannot connect to MongoDB. Please check:')
            console.error('   1. MongoDB is running (if using local MongoDB)')
            console.error('   2. The connection string is correct')
        }
        throw error
    }
}
