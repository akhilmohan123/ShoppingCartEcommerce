const { MongoClient } = require("mongodb");
require("dotenv").config();

const state = {
  db: null,
};

const url = process.env.DB_URL;
const client = new MongoClient(url);

const connect = async (cb) => {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const db = client.db('shopping');
    state.db = db;
    return cb();
  } catch (err) {
    console.error('Failed to connect:', err);
    return cb(err);
  }
};

const get = () => state.db;



// Uncomment the following line if you want to test the connection directly
// testConnection();

module.exports = {
  connect,
  get,
};
