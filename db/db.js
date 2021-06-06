const {MongoClient} = require('mongodb');
const uri 			= 'mongodb://localhost:27017/local';
exports.client 		= new MongoClient(uri);

// module.exports = client;