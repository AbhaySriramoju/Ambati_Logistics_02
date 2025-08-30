import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  // Removed unused loading and navigate

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // setLoading(true); // loading state removed
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) {
        setError(error.message || "Failed to send reset email");
        // setLoading(false); // loading state removed
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send reset email");
    } finally {
      // setLoading(false); // loading state removed
    }
  };

  // The password reset is handled on the /reset-password page, not here

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <Mail className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-500 text-sm">
            {submitted
              ? "Enter your new password below."
              : "Enter your email address to reset your password."}
          </p>
        </div>

        {submitted ? (
          <div className="text-center text-green-600 font-medium">
            If your email is registered, a password reset link has been sent!<br />
            Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-2 text-red-700 mb-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Continue
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
