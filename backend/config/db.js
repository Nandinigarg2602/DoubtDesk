const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doubtdesk';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`! Primary MongoDB connection failed (${err.message}). Attempting in-memory database fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✓ In-Memory MongoDB connected: ${conn.connection.host} (${memUri})`);
    } catch (memErr) {
      console.error(`✗ All MongoDB connection attempts failed: ${memErr.message}`);
      console.error(`Please make sure your MongoDB instance is running or configure MONGO_URI in .env`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
