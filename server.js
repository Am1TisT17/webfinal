require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const recipeRoutes = require('./routes/recipe');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected successfully');
    return Promise.all([
        mongoose.connection.collection('recipes').createIndex({ title: 1, category: 1 }),
        mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true })
    ]);
})
.then(() => {
    console.log('Database indexes created');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

function startServer(port) {
    if (port >= 65536) {
        console.error('No available ports found');
        process.exit(1);
    }

    app.listen(port)
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error('Server error:', err);
            }
        })
        .on('listening', () => {
            console.log(`Server is running on port ${port}`);
        });
}

startServer(PORT);

process.on('SIGINT', async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});
