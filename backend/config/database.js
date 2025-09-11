const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`mongodb connected: ${conn.connection.host}`);
    console.log(`database name: ${conn.connection.name}`);
  } catch (error) {
    console.error('database connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('mongodb disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('mongodb error:', err);
});

module.exports = connectDB;
