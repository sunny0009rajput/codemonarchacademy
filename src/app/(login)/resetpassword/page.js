"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function page() {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [success, setSuccess] = useState(false);

  const apiurl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { token } = useParams();
  const router = useRouter();

  const validatePassword = (password) => password.length >= 8;

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!passwords.newPassword)
      newErrors.newPassword = "New password is required";
    else if (!validatePassword(passwords.newPassword))
      newErrors.newPassword = "Password must be at least 8 characters long";

    if (!passwords.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (passwords.newPassword !== passwords.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiurl}/customer/reset-password/${token}`, {
        password: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });

      localStorage.removeItem("user");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      console.error(error);
      setErrors({
        confirmPassword:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full space-y-6">
          <div className="text-green-500 mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Password Changed Successfully!
          </h2>
          <p className="text-gray-600">You’ll be redirected to login shortly.</p>
          <Link href="/customerlogin" className="text-sm text-blue-600 hover:underline">
            Go to Login now
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Reset password form
  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                ></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Reset Password
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Create a strong new password to secure your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-white mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPasswords.newPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className={`block w-full pl-4 pr-16 py-3 bg-black border ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-gray-700"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-200 text-sm`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  {showPasswords.newPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-400 mt-2">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-white mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className={`block w-full pl-4 pr-16 py-3 bg-black border ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-gray-700"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-200 text-sm`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  {showPasswords.confirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              } focus:outline-none focus:ring-4 focus:ring-gray-700`}
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/customerlogin" className="text-white hover:text-gray-300 font-medium">
              Back to Login
            </Link>
          </div>

          <div className="mt-4 text-center flex items-center justify-center gap-2">
            <Link
              href="/"
              className="flex items-center text-white hover:text-gray-300 font-medium transition"
            >
              Go to Home
              <svg
                className="ml-1 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
