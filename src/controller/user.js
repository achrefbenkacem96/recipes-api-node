import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { UserModel } from "../models/Users.js";
const user = {
    login: async function(req, res) {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
      
        if (!user) {
          return res
            .status(400)
            .json({ message: "email or password is incorrect" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res
            .status(400)
            .json({ message: "email or password is incorrect" });
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET);
        res.json({ token, userID: user._id , userName: user.username});
    }
    ,getUserById: async function(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId);
        
            if (!user) {
              // If user is not found, return a 404 status
              return res.status(404).json({ message: "User not found" });
            }
        
            // If user is found, send the user data as a JSON response
            res.status(200).json(user);
          } catch (error) {
            // Handle errors and respond with a 500 status code
            console.error("Error fetching user by ID:", error);
            res.status(500).json({ message: "Internal Server Error" });
          }
    },register: async function(req, res) {
        try {
            
            const { email, password, username, lastname } = req.body;
            const user = await UserModel.findOne({ email });
            if (user) {
              return res.status(400).json({ message: "email already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({ email, username, lastname, password: hashedPassword });
            await newUser.save();
            res.json({ message: "User registered successfully" });
        } catch (error) {
            console.error("Error register user  :", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
 
    },
    updateUser: async function(req, res){
        try {
            const id = req.params.id;
            const data = req.body;
        
            // Use the { new: true } option to get the updated document
            const updatedUser = await UserModel.findByIdAndUpdate(
              { _id: id },
              data,
              { new: true }
            );
        
            res.status(200).json(updatedUser);
          } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json(error);
          }
    }
    }

    export { user as userController };

    export const verifyToken = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          jwt.verify(authHeader, process.env.SECRET, (err) => {
            if (err) {
              return res.sendStatus(403);
            }
            next();
          });
        } else {
          res.sendStatus(401);
        }
      };