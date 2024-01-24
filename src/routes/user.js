import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { UserModel } from "../models/Users.js";
import { userController } from "../controller/user.js";

dotenv.config();

const router = express.Router();


router.get("/user/:id", userController.getUserById);
router.post("/register", userController.register);
router.put('/update/:id', userController.updateUser);
router.post("/login", userController.login);

export { router as userRouter };

