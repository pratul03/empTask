import Employee from "../models/Employee.js";
import multer, { diskStorage } from "multer";
import { extname as _extname } from "path";

// Configure multer for image upload
const storage = diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(_extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
}).single("image");

// Create a new employee
export async function createEmployee(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err });

    const { name, email, mobile, designation, gender, course } = req.body;
    const newEmployee = new Employee({
      name,
      email,
      mobile,
      designation,
      gender,
      course,
      image: req.file.filename,
    });

    await newEmployee.save();
    res.json(newEmployee);
  });
}

// Get all employees
export async function getEmployees(req, res) {
  try {
    const { search = "", sortBy = "name", sortOrder = "asc" } = req.query;

    // Create search filter
    const searchFilter = {
      $or: [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search on name
        { email: { $regex: search, $options: "i" } }, // Case-insensitive search on email
      ],
    };

    // Determine sort order (1 for ascending, -1 for descending)
    const order = sortOrder === "asc" ? 1 : -1;

    // Sort based on field
    const sortOptions = {
      [sortBy]: order,
    };

    // Fetch employees with search and sorting
    const employees = await Employee.find(searchFilter).sort(sortOptions);

    // Add base URL for image paths
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const employeesWithImages = employees.map((employee) => ({
      ...employee._doc,
      image: employee.image ? `${baseUrl}/uploads/${employee.image}` : null,
    }));

    res.json(employeesWithImages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve employees", error: err });
  }
}

// Get an employee by ID
export async function getEmployeeById(req, res) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve employee", error: err });
  }
}

// Update an employee
export async function updateEmployee(req, res) {
  try {
    const { name, email, mobile, designation, gender, course } = req.body;
    const updatedData = {
      name,
      email,
      mobile,
      designation,
      gender,
      course,
    };

    // If a new image is uploaded, update it
    if (req.file) {
      updatedData.image = req.file.filename;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ message: "Failed to update employee", error: err });
  }
}

// Delete an employee
export async function deleteEmployee(req, res) {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      message: "Employee deleted successfully",
      employee: deletedEmployee,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employee", error: err });
  }
}
