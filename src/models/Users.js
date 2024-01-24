import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username:{
    type: String,
 },
lastname:{
    type: String
},
email:{
    type: String,
    required: true,
    unique:true
},
password:{
    type: String,
    required: true
},
about:{
    type: String
},
 
  favorisRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],
});

export const UserModel = mongoose.model("users", UserSchema);