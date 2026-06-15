const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../config/db');

// Generate JWT
const generateToken = (id, username, role) => {
    return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    try {
        // Check if user exists
        const existingUsers = await query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await run(
            'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, username, email, hashedPassword]
        );

        if (result.id) {
            res.status(201).json({
                success: true,
                token: generateToken(result.id, username, 'User'),
                user: { id: result.id, username, firstName, lastName, email, role: 'User' }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for user
        const users = await query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                success: true,
                token: generateToken(user.id, user.username, user.role),
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
        const users = await query('SELECT id, first_name, last_name, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length > 0) {
            res.json({ success: true, data: users[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
};
