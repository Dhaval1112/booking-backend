import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../models/prisma.js';
import config from '../config/envConfig.js';

// Signup
export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword, isVerified: false }
        });

        // Generate verification token (valid for 1 hour) 
        // Note: By using this token we will going to be call verify token endpoint
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        const endpoint = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;

        res.json({ message: 'User registered. Verify email before login.', emailVerificationUrl: endpoint, email: user.email });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('req.body', req.body);
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) return res.status(403).json({ message: 'Verify your email before logging in' });

        const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (err) {
        console.log('err', err);
        res.status(500).json({ error: 'Server error' });
    }


};

// To verify email address
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Find the user
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // Update user verification status
        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });

        return res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(400).json({ message: "Invalid or expired token" });
    }
};