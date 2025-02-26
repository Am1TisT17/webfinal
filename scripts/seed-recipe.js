require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/recipe');


mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        await Recipe.deleteMany({});
        console.log('Cleared existing recipes');

        const result = await Recipe.insertMany(recipes);
        console.log(`Added ${result.length} recipes`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
})
.catch(err => console.error('MongoDB connection error:', err));
