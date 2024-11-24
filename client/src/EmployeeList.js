import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, UserPen } from "lucide-react";

const EmployeeList = ({ search, sortBy, sortOrder }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authorization token is missing.");
          return;
        }

        const response = await axios.get("/api/employees/fetchEmployees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search, // Pass search query to filter employees
            sortBy, // Pass sort field
            sortOrder, // Pass sort order (asc or desc)
          },
        });

        setEmployees(response.data);
      } catch (err) {
        setError("Error fetching employee data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [search, sortBy, sortOrder]); // Refetch data when search, sortBy, or sortOrder change

  const openUpdateModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleUpdate = async (updatedData, file) => {
    const formData = new FormData();
    Object.keys(updatedData).forEach((key) => {
      formData.append(key, updatedData[key]);
    });
    if (file) {
      formData.append("image", file); // Append the image file if selected
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      const response = await axios.put(
        `/api/employees/updateEmployee/${selectedEmployee._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Important for file upload
          },
        }
      );

      alert("Employee updated successfully!");
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp._id === selectedEmployee._id ? { ...emp, ...response.data } : emp
        )
      );
      setIsModalOpen(false); // Close the modal
      setSelectedEmployee(null); // Reset selected employee
      window.location.reload();
    } catch (err) {
      console.error("Error updating employee:", err);
      setError("Error updating employee. Please try again.");
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      await axios.delete(`/api/employees/deleteEmployee/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Employee deleted successfully!");
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp._id !== employeeId)
      );
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError("Error deleting employee. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee List</h2>

      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-300">Photo</th>
              <th className="px-4 py-2 border border-gray-300">Name</th>
              <th className="px-4 py-2 border border-gray-300">Email</th>
              <th className="px-4 py-2 border border-gray-300">Mobile</th>
              <th className="px-4 py-2 border border-gray-300">Designation</th>
              <th className="px-4 py-2 border border-gray-300">Gender</th>
              <th className="px-4 py-2 border border-gray-300">Courses</th>
              <th className="px-4 py-2 border border-gray-300">Created Date</th>
              <th className="px-4 py-2 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id} className="text-center">
                <td className="px-4 py-2 border border-gray-300">
                  {employee.image ? (
                    <img
                      src={employee.image}
                      alt={employee.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {employee.name}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {employee.email}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {employee.mobile}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {employee.designation}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {employee.gender}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {employee.course}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    onClick={() => openUpdateModal(employee)}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                  >
                    <UserPen />
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Component */}
      {isModalOpen && (
        <UpdateEmployeeModal
          employee={selectedEmployee}
          onUpdate={handleUpdate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const UpdateEmployeeModal = ({ employee, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    mobile: employee?.mobile || "",
    designation: employee?.designation || "",
    gender: employee?.gender || "",
    course: employee?.course || "",
  });

  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData, file);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Update Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Course</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Upload Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeList;
