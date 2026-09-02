const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`[Database] MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB Connection Closed');
  } catch (error) {
    console.error(`[Database] Error while closing MongoDB connection: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database] MongoDB runtime error: ${err.message}`);
});

module.exports = {
  connectDB,
  disconnectDB,
};
