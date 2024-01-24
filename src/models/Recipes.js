import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    ingredients: [{
        type: String,
        required: true,
    }],
    instructions: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    cookingTime: {
        type: Number,
        required: true,
    },
    userOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        }
    ],
});

export const RecipesModel = mongoose.model("recipes", RecipeSchema);