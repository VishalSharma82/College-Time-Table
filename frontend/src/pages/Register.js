import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/register", form, {
        withCredentials: true,
      });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Account 🚀
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-3 rounded-md mb-5 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <AiOutlineUser className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              value={form.name}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <AiOutlineMail className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              value={form.email}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <AiOutlineLock className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          {/* Role */}
          <div>
            <select
              name="role"
              onChange={handleChange}
              value={form.role}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="student">🎓 Student</option>
              <option value="faculty">👨‍🏫 Faculty</option>
              <option value="admin">🛠 Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
