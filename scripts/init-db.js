require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Recipe = require('../models/recipe'); 

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
