require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
        console.log('Attempting to connect to MongoDB...');
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        
        const dbs = await client.db().admin().listDatabases();
        console.log('\nAvailable databases:');
        dbs.databases.forEach(db => console.log(` - ${db.name}`));
        
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } finally {
        await client.close();
        console.log('\nConnection closed');
    }
}

testConnection();
