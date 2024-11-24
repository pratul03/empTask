import User from "../models/User.js";
import jwt from "jsonwebtoken"; // Default import
const { sign } = jwt; // Destructure the `sign` method

// Login function
export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1D",
    });

    // Log token for debugging
    console.log("Generated Token:", token);

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Register function
export async function register(req, res) {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error); // Log error for debugging
    res.status(500).json({ message: "Server error" });
  }
}

// Fetch user data by ID
export async function getUser(req, res) {
  try {
    // Get the user ID from the JWT token (middleware should decode it)
    const userId = req.user.id;

    // Fetch user data from the database
    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
}
