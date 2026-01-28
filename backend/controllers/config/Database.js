const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://srinivas:srinivas@cluster0.mab8vmo.mongodb.net/?appName=Cluster0"

// Establish connection to MongoDB cluster
const atlasConnection = mongoose.createConnection(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = { atlasConnection, MONGO_URI };
