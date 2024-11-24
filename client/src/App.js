import React, { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import axios from "axios";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [employees, setEmployees] = useState([]);
  const [userName, setUserName] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserName("");
    window.location.reload();
  };

  const toggleRegister = () => setIsRegistering(!isRegistering);

  const handleToggleForm = () => setShowForm(!showForm);

  // Fetch user and employee data
  useEffect(() => {
    if (token) {
      const fetchUserName = async () => {
        try {
          const response = await axios.get("/api/auth/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserName(response.data.username);
        } catch (error) {
          console.error("Error fetching user data:", error);
          handleLogout();
        }
      };

      const fetchEmployees = async () => {
        try {
          const response = await axios.get("/api/employees/fetchEmployees", {
            headers: { Authorization: `Bearer ${token}` },
            params: { search, sortBy, sortOrder },
          });
          setEmployees(response.data);
        } catch (err) {
          console.error("Error fetching employees:", err);
        }
      };

      fetchUserName();
      fetchEmployees();
    }
  }, [token, search, sortBy, sortOrder]);

  // Add new employee and refresh list
  const addEmployee = (newEmployee) => {
    setEmployees([newEmployee, ...employees]); // Add to the list
    setShowForm(false); // Hide the form after submission
  };

  // Render Login/Register if no token
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {isRegistering ? "Register" : "Login"}
          </h2>
          {isRegistering ? (
            <>
              <Register setToken={setToken} />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Already have an account?{" "}
                <button
                  onClick={toggleRegister}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <Login setToken={setToken} />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Don’t have an account?{" "}
                <button
                  onClick={toggleRegister}
                  className="text-blue-500 hover:underline"
                >
                  Register
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render main app after login
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/employee.png" alt="Logo" className="h-10 w-10" />
            <h1 className="text-3xl font-bold">Employee Management System</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg">{userName || "User"}</span>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 items-center">
          {/* Search and Sort Options */}
          <div className="flex flex-wrap gap-4 justify-center w-full">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 focus:outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/6 focus:outline-none"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="createdAt">Created Date</option>
              <option value="_id">ID</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/6 focus:outline-none"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Add New Employee Form */}
          <div className="w-full sm:w-2/3">
            {showForm ? (
              <EmployeeForm
                onSubmit={addEmployee}
                onCancel={handleToggleForm}
              />
            ) : (
              <button
                onClick={handleToggleForm}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none w-full"
              >
                Add New Employee
              </button>
            )}
          </div>

          {/* Employee List */}
          <div className="w-full sm:w-2/3">
            <EmployeeList
              employees={employees}
              search={search}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
