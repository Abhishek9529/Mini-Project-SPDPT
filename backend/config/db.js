const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
    try {
        if (cachedConnection && mongoose.connection.readyState === 1) {
            return cachedConnection;
        }

        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/SPDPT';
        cachedConnection = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
        });
        console.log("MongoDB connected");
        return cachedConnection;
    } catch (error) {
        cachedConnection = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

module.exports = connectDB;
