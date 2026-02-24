const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user (FR1)
exports.register = async (req, res) => {
    const { email, password, firstName, lastName, driverLicense, phone } = req.body;

    try {
        // 1. Check if the user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Encrypt the password (Security Requirement)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Save the new user to the MySQL database
        // Using a timestamp as a temporary ID for the prototype
        const userId = Date.now(); 
        await User.create({
            id: userId,
            email,
            passwordHash,
            firstName,
            lastName,
            driverLicense,
            phone
        });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error during registration", error: error.message });
    }
};

// Log in an existing user (FR1)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Compare entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Create a secure JSON Web Token (JWT) using the .env secret
        const token = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, firstName: user.firstName }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};