import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Route to create a new employee
router.post("/createEmployee", createEmployee);

// Route to get all employees
router.get("/fetchEmployees", getEmployees);

// Route to get a single employee by ID
router.get("/:id", getEmployeeById);

// Route to update an employee by ID
router.put("/updateEmployee/:id", upload.single("image"), updateEmployee);

// Route to delete an employee by ID
router.delete("/deleteEmployee/:id", deleteEmployee);

// Export the router
export default router;
