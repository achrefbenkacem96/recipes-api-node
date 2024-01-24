import express from "express";
import mongoose from "mongoose";
import { RecipesModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "../controller/user.js";
import { recipesController } from "../controller/recipes.js";
 
const router = express.Router();
const ITEMS_PER_PAGE = 10; // Set the number of items per page

router.get("/", recipesController.getAll);
router.get("/findbyname",  recipesController.getRecipesByName);
// Update a recipe by ID
router.put("/update/:recipeId", recipesController.updateRecipes);

router.delete("/delete/:recipeId", verifyToken, recipesController.deleteRecipe );

router.get("/user/:userId", recipesController.getRecipesByUserId );

// Create a new recipe
router.post("/", verifyToken, recipesController.createRecipe);

// Get a recipe by ID
router.get("/:recipeId", recipesController.getRecipesById);
 
// Save a Recipe
router.put("/favoris", async (req, res) => {
  const recipe = await RecipesModel.findById(req.body.recipeID);
  const user = await UserModel.findById(req.body.userID);
  try {
    user.favorisRecipes.push(recipe);
    await user.save();
    res.status(201).json({ favorisRecipes: user.favorisRecipes.length> 0 ? user.favorisRecipes : []});
  } catch (err) {
    res.status(500).json(err);
  }
});
router.delete("/favoris/:userID/:recipeID", async (req, res) => {
  const recipe = await RecipesModel.findById(req.params.recipeID);
  const user = await UserModel.findById(req.params.userID);
  // console.log("🚀 ~ file: recipes.js:180 ~ router.delete ~ req.body:", req.body)
  // console.log("🚀 ~ file: recipes.js:180 ~ router.delete ~ user:", user)
  try {
    user.favorisRecipes.pull(recipe);
    await user.save();
    res.status(201).json({ favorisRecipes: user.favorisRecipes.length> 0 ? user.favorisRecipes : []});
  } catch (err) {
    // console.log("🚀 ~ file: recipes.js:185 ~ router.delete ~ err:", err)
    res.status(500).json(err);
  }
});

// Get id of favoris recipes
router.get("/favorisRecipes/ids/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    res.status(201).json({ favorisRecipes: user?.favorisRecipes });
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

// Get favoris recipes
router.get("/favorisRecipes/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [favorisRecipes, totalCount] = await Promise.all([
      RecipesModel.find({ _id: { $in: user.favorisRecipes } }).skip(skip).limit(ITEMS_PER_PAGE),
      RecipesModel.countDocuments({ _id: { $in: user.favorisRecipes } }) // Get the total count of favoris recipes
    ]);

    // console.log(favorisRecipes);
    res.status(200).json({
      data: favorisRecipes,
      total: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
router.post("/:recipeId/comments", async (req, res) => {
  try {
      const { userId, content } = req.body;
    const {recipeId} = req.params
      // Find the recipe by ID
      const recipe = await RecipesModel.findById(recipeId);
      if (!recipe) {
          return res.status(404).json({ message: "Recipe not found" });
      }

      // Create a new comment
      const comment = {
          user: userId,
          content,
      };

      // Add the comment to the recipe's comments array
      recipe.comments.push(comment);

      // Save the updated recipe
      await recipe.save();

      res.status(201).json({ message: "Comment added successfully", comment });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

export { router as recipesRouter };