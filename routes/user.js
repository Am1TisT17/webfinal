require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Неверный формат токена' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверка наличия обязательных полей
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Пожалуйста, заполните все обязательные поля' 
            });
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Пожалуйста, введите корректный email' 
            });
        }

        // Проверка длины пароля
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Пароль должен быть не менее 6 символов' 
            });
        }

        // Проверка существующего пользователя
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Пользователь с таким email уже существует' 
            });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание нового пользователя
        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'user'
        });

        await user.save();

        // Создание токена
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            message: 'Ошибка при регистрации пользователя' 
        });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body); // Для отладки
        const { email, password } = req.body;

        // Проверка наличия email и пароля
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Пожалуйста, введите email и пароль' 
            });
        }

        // Поиск пользователя
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log('Found user:', user ? 'Yes' : 'No'); // Для отладки

        if (!user) {
            return res.status(400).json({ 
                message: 'Пользователь с таким email не найден' 
            });
        }

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password valid:', validPassword); 

        if (!validPassword) {
            return res.status(400).json({ 
                message: 'Неверный пароль' 
            });
        }

        // Создание токена
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Отправка ответа
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            message: 'Вход выполнен успешно'
        });

    } catch (err) {
        console.error('Login error:', err); // Для отладки
        res.status(500).json({ 
            message: 'Ошибка сервера при входе в систему' 
        });
    }
});

// Получение информации о текущем пользователе
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Обновление email пользователя
router.put('/update-email', verifyToken, async (req, res) => {
    try {
        const { email } = req.body;
        
        // Проверка валидности email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Некорректный email' });
        }

        // Проверка существования email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== req.user.userId) {
            return res.status(400).json({ message: 'Этот email уже используется' });
        }

        // Обновление email
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { email: email.toLowerCase() },
            { new: true }
        ).select('-password');

        res.json({ message: 'Email успешно обновлен', user });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении email' });
    }
});

// Обновление пароля пользователя
router.put('/update-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Проверка длины нового пароля
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Новый пароль должен быть не менее 6 символов' });
        }

        // Получение пользователя с паролем
        const user = await User.findById(req.user.userId);
        
        // Проверка текущего пароля
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Неверный текущий пароль' });
        }

        // Хеширование и обновление пароля
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });

        res.json({ message: 'Пароль успешно обновлен' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении пароля' });
    }
});

module.exports = router;
router.verifyToken = verifyToken;
