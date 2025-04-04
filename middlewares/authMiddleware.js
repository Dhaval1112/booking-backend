import jwt from 'jsonwebtoken';
import config from '../config/envConfig.js';
import prisma from './../models/prisma.js'; // Import Prisma instance

export const authenticate = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        const decoded = jwt.verify(token, config.jwtSecret);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
        }

        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true, email: true },
        });

        console.log("User Found in DB:", user);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        }

        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
