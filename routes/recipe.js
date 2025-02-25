const express = require('express');
const Recipe = require('../models/recipe');
const userAuth = require('./user');
const router = express.Router();

// Get all recipes (public)
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search recipes by title or category
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const recipes = await Recipe.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get recipes by category
router.get('/category/:category', async (req, res) => {
    try {
        const recipes = await Recipe.find({ 
            category: { $regex: new RegExp(req.params.category, 'i') }
        });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single recipe by ID
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Рецепт не найден' });
        }
        res.json(recipe);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).json({ message: err.message });
    }
});

// Add a new recipe (authenticated users only)
router.post('/', userAuth.verifyToken, async (req, res) => {
    try {
        const recipe = new Recipe({
            ...req.body,
            createdBy: req.user.userId
        });
        
        const savedRecipe = await recipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        console.error('Error creating recipe:', err);
        res.status(400).json({ 
            message: err.message || 'Ошибка при создании рецепта'
        });
    }
});

// Update a recipe (admin can edit any, users can edit only their own)
router.put('/:id', userAuth.verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let recipe;

        // Сначала найдем существующий рецепт
        const existingRecipe = await Recipe.findById(req.params.id);
        if (!existingRecipe) {
            return res.status(404).json({ message: 'Рецепт не найден' });
        }

        // Проверяем права на редактирование
        if (user.role === 'admin' || existingRecipe.createdBy.toString() === user.userId) {
            // Сохраняем существующие данные, которые не должны быть изменены
            const updatedRecipe = {
                ...req.body,
                createdBy: existingRecipe.createdBy, // Сохраняем оригинального создателя
                createdAt: existingRecipe.createdAt  // Сохраняем оригинальную дату создания
            };

            recipe = await Recipe.findByIdAndUpdate(
                req.params.id,
                updatedRecipe,
                { new: true }
            );

            res.json(recipe);
        } else {
            res.status(403).json({ 
                message: 'У вас нет прав на редактирование этого рецепта' 
            });
        }
    } catch (err) {
        console.error('Error updating recipe:', err);
        res.status(400).json({ message: err.message });
    }
});

// Delete a recipe (admin can delete any, users can delete only their own)
router.delete('/:id', userAuth.verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let recipe;

        if (user.role === 'admin') {
            // Админ может удалить любой рецепт
            recipe = await Recipe.findByIdAndDelete(req.params.id);
        } else {
            // Обычный пользователь может удалить только свой рецепт
            recipe = await Recipe.findOneAndDelete({ 
                _id: req.params.id, 
                createdBy: user.userId 
            });
        }

        if (!recipe) {
            return res.status(404).json({ 
                message: 'Рецепт не найден или у вас нет прав на его удаление' 
            });
        }

        res.json({ message: 'Рецепт успешно удален' });
    } catch (err) {
        console.error('Error deleting recipe:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
