"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function page() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const apiurl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await axios.post(
        `${apiurl}/customer/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (res.data.token) {
        localStorage.setItem("customerToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Trigger global login event for navbar sync
        window.dispatchEvent(new Event("login"));

        router.push("/"); // Redirect to home
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (
        err.response?.status === 400 &&
        err.response?.data?.message === "Invalid email or password"
      ) {
        setApiError("User not found or wrong password.");
      } else {
        setApiError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to your customer account</p>
          </div>

          {apiError && (
            <div className="mb-4 p-2 bg-red-900 text-red-300 text-sm rounded">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-gray-700 bg-black text-white transition-colors ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-gray-700 bg-black text-white transition-colors ${
                    errors.password ? "border-red-500" : "border-gray-700"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/forgotpassword"
                className="text-gray-300 hover:text-white text-sm font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-700 font-medium transition-all duration-200 flex items-center justify-center group disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Signup link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              New here?{" "}
              <Link href="/signup" className="text-white hover:text-gray-300 font-medium">
                Create an account
              </Link>
            </p>
          </div>

          {/* Go to Home link */}
          <div className="mt-4 text-center flex items-center justify-center gap-2">
            <Link
              href="/"
              className="flex items-center text-white hover:text-gray-300 font-medium transition"
            >
              Go to Home
              <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
