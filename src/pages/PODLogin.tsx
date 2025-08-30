import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PODLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded login: accept any non-empty input
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your phone/email and password/OTP.");
      return;
    }
    // Store mock session
    localStorage.setItem(
      "pod_session",
      JSON.stringify({
        user: identifier,
        token: "mock_token_12345",
        loginTime: Date.now(),
      })
    );
    setError("");
    navigate("/pod"); // Go to POD submission page
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Delivery Staff Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP or Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition text-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default PODLogin;
