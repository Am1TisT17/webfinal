require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Recipe = require('../models/recipe'); 

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

async function initializeDB() {
    try {
        // Подключение к MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to MongoDB: ${conn.connection.host}`);

        // Очистка коллекций
        await Promise.all([
            User.deleteMany({}),
            Recipe.deleteMany({})
        ]);
        console.log('Existing collections cleared');

        // Создание администратора
        const adminEmail = 'admin@recipemanager.com';
        const adminPassword = 'admin123';
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        
        await User.create({
            email: adminEmail,
            password: hashedAdminPassword,
            role: 'admin'
        });
        console.log('Admin user created');

        // Создание тестового пользователя
        const testEmail = 'test@recipes.com';
        const testPassword = 'test123';
        const hashedTestPassword = await bcrypt.hash(testPassword, 10);
        
        await User.create({
            email: testEmail,
            password: hashedTestPassword,
            role: 'user'
        });
        console.log('Test user created');

        // Добавление рецептов
        await Recipe.insertMany(recipes);
        console.log('Recipes added successfully');

        console.log('\nInitialization completed!');
        console.log('\nTest Credentials:');
        console.log('Admin - Email: admin@recipemanager.com, Password: admin123');
        console.log('User - Email: test@recipes.com, Password: test123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

initializeDB();
