
import React, { useState } from "react";
import { useLocation } from "react-router-dom";


function useQuery() {
  return new URLSearchParams(useLocation().search);
}


const validateCardNumber = (number: string) => {
  // Luhn algorithm for card validation
  const sanitized = number.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sanitized.length >= 13 && sanitized.length <= 19 && sum % 10 === 0;
};

const validateExpiry = (expiry: string) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mm, yy] = expiry.split("/").map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const year = 2000 + yy;
  const expiryDate = new Date(year, mm);
  return expiryDate > now;
};

const validateCVV = (cvv: string) => /^\d{3,4}$/.test(cvv);

const validateUPI = (upi: string) => /^[\w.-]+@[\w.-]+$/.test(upi);


const ShipmentPaymentPage: React.FC = () => {
  const query = useQuery();
  const method = query.get("method") || "Standard";
  const cost = Number(query.get("cost")) || 0;
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [upiId, setUpiId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<null | "success" | "error">(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (paymentMethod === "card") {
      if (!validateCardNumber(cardDetails.number)) {
        setError("Invalid card number");
        return;
      }
      if (!validateExpiry(cardDetails.expiry)) {
        setError("Invalid expiry date");
        return;
      }
      if (!validateCVV(cardDetails.cvv)) {
        setError("Invalid CVV");
        return;
      }
      if (!cardDetails.name.trim()) {
        setError("Name on card is required");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!validateUPI(upiId)) {
        setError("Invalid UPI ID");
        return;
      }
    }
    setIsPaying(true);
    setTimeout(() => {
      setPaymentStatus("success");
      setIsPaying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">Shipment Payment</h2>
          <p className="text-gray-500 text-base">Complete your payment to process the shipment.</p>
        </div>
        <div className="mb-8 border p-4 rounded-xl bg-blue-50/50 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Shipping Method: <span className="text-blue-700">{method}</span></div>
            <div className="font-semibold text-gray-700">Cost: <span className="text-blue-700">₹{cost}</span></div>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Secure Payment</span>
          </div>
        </div>
        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block font-medium mb-2 text-gray-700">Select Payment Method:</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="accent-blue-600"
                />
                <span className="ml-2">Credit/Debit Card</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  className="accent-blue-600"
                />
                <span className="ml-2">UPI</span>
              </label>
            </div>
          </div>

          {paymentMethod === "card" && (
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="number"
                placeholder="Card Number"
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={cardDetails.number}
                onChange={handleInputChange}
                maxLength={19}
                required
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  className="border p-3 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={cardDetails.expiry}
                  onChange={handleInputChange}
                  maxLength={5}
                  required
                />
                <input
                  type="password"
                  name="cvv"
                  placeholder="CVV"
                  className="border p-3 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  maxLength={4}
                  required
                />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Name on Card"
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={cardDetails.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {paymentMethod === "upi" && (
            <div>
              <input
                type="text"
                name="upiId"
                placeholder="Enter UPI ID"
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-lg font-bold shadow-lg transition text-lg"
            disabled={isPaying}
          >
            {isPaying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ₹${cost}`
            )}
          </button>
        </form>
        {paymentStatus === "success" && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center font-semibold text-lg shadow">Payment Successful! Thank you.</div>
        )}
        {paymentStatus === "error" && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg text-center font-semibold text-lg shadow">Payment Failed. Please check your details.</div>
        )}
      </div>
    </div>
  );
};

export default ShipmentPaymentPage;
