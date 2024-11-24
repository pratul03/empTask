import React, { useState } from "react";
import axios from "axios";

const EmployeeForm = ({ toggleFormVisibility }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "HR", // Default selection
    gender: "",
    course: [], // Stores selected courses
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        course: checked
          ? [...prevData.course, value]
          : prevData.course.filter((course) => course !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.gender
    ) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    const form = new FormData();
    for (let key in formData) form.append(key, formData[key]);
    if (image) form.append("image", image);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authorization token is missing.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      await axios.post("/api/employees/createEmployee", form, { headers });

      setFormData({
        name: "",
        email: "",
        mobile: "",
        designation: "HR",
        gender: "",
        course: [],
      });
      setImage(null);

      // Toggle form visibility off after submission
      toggleFormVisibility(false);
    } catch (err) {
      setError("Error creating employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Employee Registration
        </h2>

        {/* Name Field */}
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name (Required)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email (Required)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mobile Field */}
        <div>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile (Required)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Designation Field */}
        <div>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        {/* Gender Radio Buttons */}
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="Male"
              onChange={handleChange}
              className="mr-2"
              required
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="Female"
              onChange={handleChange}
              className="mr-2"
              required
            />
            Female
          </label>
        </div>

        {/* Courses Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="course"
              value="MCA"
              onChange={handleChange}
              className="mr-2"
            />
            MCA
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="course"
              value="BCA"
              onChange={handleChange}
              className="mr-2"
            />
            BCA
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="course"
              value="BSC"
              onChange={handleChange}
              className="mr-2"
            />
            BSC
          </label>
        </div>

        {/* Image Upload */}
        <div>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default EmployeeForm;
