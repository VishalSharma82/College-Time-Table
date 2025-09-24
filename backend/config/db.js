const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }

  // Optional: log connection status changes
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB re-connected');
  });
};

module.exports = connectDB;
