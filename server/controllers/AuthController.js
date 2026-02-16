const User = require('../models/User');
const bcrypt = require('bcryptjs'); // You will need to install this library for passwords
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Search for the user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Compare the entered password with the hash in the database
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Create the security token (JWT) using your secret key from the .env file
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