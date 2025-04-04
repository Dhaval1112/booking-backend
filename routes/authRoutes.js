import express from 'express';
import { signup, login, verifyEmail } from '../controllers/authController.js';
import cookieParser from "cookie-parser";
const router = express.Router();

router.use(cookieParser());

router.post('/signup', signup);
router.post('/login', login);


import { authenticate } from '../middlewares/authMiddleware.js';
// GET /api/auth/verify-email?token=token
router.get("/verify-email", verifyEmail);
router.get("/profile", authenticate, (req, res) => {
    console.log('req.user', req.user);
    res.json({ id: req.user.id, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email });
});

export default router;
