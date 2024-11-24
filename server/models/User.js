import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Default import
const { genSalt, hash, compare } = bcrypt; // Destructure required methods

const { Schema, model } = mongoose; // Extract Schema and model from mongoose

// Define the User schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if the password is new or modified
  const salt = await genSalt(10); // Generate a salt
  this.password = await hash(this.password, salt); // Hash the password
  next(); // Proceed with save
});

// Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};

// Export the model
export default model("User", userSchema);
