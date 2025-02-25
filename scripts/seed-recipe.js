require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/recipe'); // Используем модель Recipe

const recipes = [
    {
        name: "Margherita Pizza",
        category: "dinner",
        description: "Fresh tomatoes, mozzarella, basil, and olive oil.",
        ingredients: ["Tomatoes", "Mozzarella", "Basil", "Olive Oil", "Pizza Dough"],
        steps: [
            "Preheat oven to 220°C (425°F).",
            "Roll out pizza dough and spread tomato sauce.",
            "Add mozzarella slices and basil leaves.",
            "Drizzle with olive oil and bake for 15 minutes."
        ],
        image: "https://example.com/margherita.jpg"
    },
    {
        name: "Caesar Salad",
        category: "lunch",
        description: "Romaine lettuce, croutons, parmesan cheese with caesar dressing.",
        ingredients: ["Romaine Lettuce", "Croutons", "Parmesan Cheese", "Caesar Dressing"],
        steps: [
            "Chop romaine lettuce and place in a bowl.",
            "Add croutons and grated parmesan cheese.",
            "Drizzle Caesar dressing and toss well."
        ],
        image: "https://example.com/caesar-salad.jpg"
    },
    {
        name: "Chocolate Cake",
        category: "desserts",
        description: "Rich chocolate cake with chocolate ganache.",
        ingredients: ["Flour", "Sugar", "Cocoa Powder", "Eggs", "Butter", "Milk"],
        steps: [
            "Preheat oven to 180°C (350°F).",
            "Mix dry ingredients in one bowl and wet ingredients in another.",
            "Combine and mix well, then pour into a greased baking pan.",
            "Bake for 30-35 minutes and let cool before adding ganache."
        ],
        image: "https://example.com/chocolate-cake.jpg"
    }
];

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Очистка существующих рецептов
        await Recipe.deleteMany({});
        console.log('Cleared existing recipes');

        // Вставка новых рецептов
        const result = await Recipe.insertMany(recipes);
        console.log(`Added ${result.length} recipes`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
})
.catch(err => console.error('MongoDB connection error:', err));
