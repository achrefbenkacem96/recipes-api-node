import mongoose from "mongoose";
import { RecipesModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
const ITEMS_PER_PAGE = 10; // Set the number of items per page
const recipes ={
    getAll:async function(req, res){
        try {
            if (req.query.page) {
              
              const page = parseInt(req.query.page) || 1;
              const skip = (page - 1) * ITEMS_PER_PAGE;
          
              const [result, totalCount] = await Promise.all([
                RecipesModel.find({}).skip(skip).limit(ITEMS_PER_PAGE),
                RecipesModel.countDocuments({}) // Get the total count of documents
              ]);
              console.log("🚀 ~ getAll:function ~ result:", result)
          
              res.status(200).json({
                data: result,
                total: totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
              });
            } else {
              const result = await RecipesModel.find({});
              res.status(200).json(result);
            }
          } catch (err) {
            console.log("🚀 ~ getAll:function ~ err:", err)
            res.status(500).json(err);
          }
    },
    getRecipesByName:async function (req,res){
            try {
              // Check if there's a query parameter for the recipe name
              const { name } = req.query;
              const page = parseInt(req.query.page) || 1;
              const skip = (page - 1) * ITEMS_PER_PAGE;
          
              const query = name ? { name: { $regex: new RegExp(name, 'i') } } : {};
          
              // Fetch recipes based on the query with pagination
              const [result, totalCount] = await Promise.all([
                RecipesModel.find(query).skip(skip).limit(ITEMS_PER_PAGE),
                RecipesModel.countDocuments(query) // Get the total count of documents for the given query
              ]);
          
              // Respond with a JSON object containing the paginated results and total count
              res.status(200).json({
                data: result,
                total: totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
              });
            } catch (err) {
              // Handle errors and respond with a 500 status code
              res.status(500).json(err);
            }
    },
    updateRecipes:async function (req,res){
        try {
          const recipeId = req.params.recipeId;
          const updateData = req.body;
      
          // Update the recipe using findByIdAndUpdate
          const updatedRecipe = await RecipesModel.findByIdAndUpdate(
            recipeId,
            updateData,
            { new: true } // To return the updated document
          );
      
          if (!updatedRecipe) {
            // If the recipe is not found, return a 404 status
            return res.status(404).json({ message: "Recipe not found" });
          }
      
          // If the recipe is updated, send the updated recipe as a JSON response
          res.status(200).json(updatedRecipe);
        } catch (error) {
          // Handle errors and respond with a 500 status code
          console.error("Error updating recipe:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      },
      deleteRecipe:async function (req,res){
        try {
          const recipeId = req.params.recipeId;
      
          // Delete the recipe using findByIdAndDelete
          const deletedRecipe = await RecipesModel.findByIdAndDelete(recipeId);
      
          if (!deletedRecipe) {
            // If the recipe is not found, return a 404 status
            return res.status(404).json({ message: "Recipe not found" });
          }
      
          // If the recipe is deleted, send the deleted recipe as a JSON response
          res.status(200).json(deletedRecipe);
        } catch (error) {
          // Handle errors and respond with a 500 status code
          console.error("Error deleting recipe:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      },
      getRecipesByUserId:async function (req,res){
        try {
          const userId = req.params.userId;
          const page = parseInt(req.query.page) || 1;
          const skip = (page - 1) * ITEMS_PER_PAGE;
      
          const [recipes, totalCount] = await Promise.all([
            RecipesModel.find({ userOwner: userId }).skip(skip).limit(ITEMS_PER_PAGE),
            RecipesModel.countDocuments({ userOwner: userId }) // Get the total count of documents for the specific user
          ]);
      
          res.status(200).json({
            data: recipes,
            total: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
          });
        } catch (error) {
          console.error("Error fetching recipes by user ID:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      },
      createRecipe:async function (req,res){
        const recipe = new RecipesModel({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          image: req.body.image,
          ingredients: req.body.ingredients,
          instructions: req.body.instructions,
          imageUrl: req.body.imageUrl,
          cookingTime: req.body.cookingTime,
          userOwner: req.body.userOwner,
        });
        // console.log(recipe);
      
        try {
          const result = await recipe.save();
          res.status(201).json({
            createdRecipe: {
              name: result.name,
              image: result.image,
              ingredients: result.ingredients,
              instructions: result.instructions,
              _id: result._id,
            },
          });
        } catch (err) {
          // console.log(err);
          res.status(500).json(err);
        }
      },
      getRecipesById:async function (req,res){
        try {
            const recipe = await RecipesModel.findById(req.params.recipeId).populate('comments.user', 'username');
            if (!recipe) {
                return res.status(404).json({ message: "Recipe not found" });
            }
      
            res.status(200).json(recipe);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
      },

}

export { recipes as recipesController };
