"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export default function page() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const apiurl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiurl}/customer/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setErrors({
        email:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------- Success screen ---------- */
  if (success) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="bg-black border border-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Email Sent Successfully
          </h2>
          <p className="text-gray-300 mb-6">
            Check your inbox for the password reset link.
          </p>
          <Link
            href="/customerlogin"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  /* --------- Main form ---------- */
  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-300">
              Enter your email and we’ll send you a secure reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-lg bg-black text-white border focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-700 font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/customerlogin"
              className="flex items-center justify-center text-gray-300 hover:text-white gap-1"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
