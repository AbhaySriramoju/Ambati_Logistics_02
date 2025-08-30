import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Package, Search, Phone, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

// Remove mock data, use Supabase queries

const statusColors: { [key: string]: string } = {
  "In Transit": "bg-yellow-100 text-yellow-700",
  Pending: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const UserTracking: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber?: string }>();
  const [input, setInput] = useState(trackingNumber || "");
  const [mode, setMode] = useState<"phone" | "tracking" | null>(null);
  const [showResult, setShowResult] = useState(!!trackingNumber);
  const [current, setCurrent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      setInput(trackingNumber);
      handleSearch(trackingNumber);
    }
    // eslint-disable-next-line
  }, [trackingNumber]);

  const handleSearch = async (value: string) => {
    setLoading(true);
    setError(null);
    setCurrent(null);
    setHistory([]);
    // Accept 10 or 11 digit numbers, and handle leading zero
    if (/^\d{10,11}$/.test(value)) {
      setMode("phone");
      let queries = [
        `from_contact_number.eq.${value}`,
        `to_contact_number.eq.${value}`,
      ];
      // If 11 digits and starts with 0, also search for the 10-digit version
      if (value.length === 11 && value.startsWith("0")) {
        const withoutZero = value.slice(1);
        queries.push(`from_contact_number.eq.${withoutZero}`);
        queries.push(`to_contact_number.eq.${withoutZero}`);
      }
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .or(queries.join(","))
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setHistory(data || []); // Show all shipments in a single table
      setShowResult(true);
    } else if (/^[A-Za-z0-9-_]+$/.test(value)) {
      setMode("tracking");
      // Query by tracking number
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", value)
        .maybeSingle();
      if (error || !data) {
        setError("Shipment not found");
        setLoading(false);
        return;
      }
      setCurrent(data);
      setShowResult(true);
    } else {
      setMode(null);
      setShowResult(true);
    }
    setLoading(false);
  };

  const handleTrack = () => {
    handleSearch(input);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-2 py-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold mb-8 text-center flex items-center justify-center gap-3 text-blue-700 tracking-tight">
          <Package className="h-8 w-8 text-blue-600" /> User Shipment Tracking
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter phone number or tracking number"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
          />
          <button
            onClick={handleTrack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-semibold shadow"
            type="button"
          >
            <Search className="h-5 w-5" /> Track
          </button>
        </div>
        {/* Results */}
        {showResult && (
          <div className="mt-8">
            {loading && (
              <div className="text-center text-blue-500">Loading...</div>
            )}
            {error && <div className="text-center text-red-500">{error}</div>}
            {/* Phone mode: show all shipments in a single table */}
            {mode === "phone" && (
              <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-700">
                  <CheckCircle className="text-green-500" size={20} /> Shipments
                </h3>
                {history.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    No shipments found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-4 py-3">Tracking Id</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">From</th>
                          <th className="px-4 py-3">To</th>
                          <th className="px-4 py-3">From Contact</th>
                          <th className="px-4 py-3">To Contact</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3">Est. Delivery</th>
                          <th className="px-4 py-3">Delivered/Cancelled On</th>
                          <th className="px-4 py-3">Time (IST)</th>
                          <th className="px-4 py-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((ship, i) => {
                          let date = "-";
                          let time = "-";
                          if (
                            ship.status === "Delivered" &&
                            ship.delivered_at
                          ) {
                            const d = new Date(ship.delivered_at);
                            date = d.toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            });
                            time = d.toLocaleTimeString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            });
                          } else if (
                            ship.status === "Cancelled" &&
                            ship.cancelled_at
                          ) {
                            const d = new Date(ship.cancelled_at);
                            date = d.toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            });
                            time = d.toLocaleTimeString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            });
                          }
                          return (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-mono">
                                {ship.tracking_number}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    statusColors[ship.status]
                                  }`}
                                >
                                  {ship.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">{ship.from_city}</td>
                              <td className="px-4 py-3">{ship.to_city}</td>
                              <td className="px-4 py-3">
                                {ship.from_contact_number}
                              </td>
                              <td className="px-4 py-3">
                                {ship.to_contact_number}
                              </td>
                              <td className="px-4 py-3">
                                {ship.created_at
                                  ? new Date(ship.created_at).toLocaleString(
                                      "en-IN",
                                      { timeZone: "Asia/Kolkata" }
                                    )
                                  : "-"}
                              </td>
                              <td className="px-4 py-3">
                                {ship.estimated_delivery_date
                                  ? new Date(
                                      ship.estimated_delivery_date
                                    ).toLocaleDateString("en-IN", {
                                      timeZone: "Asia/Kolkata",
                                    })
                                  : "-"}
                              </td>
                              <td className="px-4 py-3">{date}</td>
                              <td className="px-4 py-3">{time}</td>
                              <td className="px-4 py-3">{ship.notes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* Tracking number mode: show single summary */}
            {mode === "tracking" && current && (
              <div className="p-6 rounded-2xl shadow-lg border border-blue-200 bg-blue-50 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xl font-bold text-blue-800">
                      <Package className="text-blue-500" />
                      <span>Tracking Id:</span>{" "}
                      <span className="font-mono text-base text-blue-700">
                        {current.tracking_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-lg">
                      <span
                        className="inline-block text-blue-500"
                        aria-label="Route"
                        title="Route"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12h18M9 6l-6 6 6 6"
                          />
                        </svg>
                      </span>
                      {current.from_city} <span className="mx-1">→</span>{" "}
                      {current.to_city}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[current.status]
                        }`}
                      >
                        {current.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">
                          From Contact:
                        </span>{" "}
                        {current.from_contact_number}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">
                          To Contact:
                        </span>{" "}
                        {current.to_contact_number}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">
                          Created:
                        </span>{" "}
                        {current.created_at
                          ? new Date(current.created_at).toLocaleString(
                              "en-IN",
                              { timeZone: "Asia/Kolkata" }
                            )
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">
                          Est. Delivery:
                        </span>{" "}
                        {current.estimated_delivery_date
                          ? new Date(
                              current.estimated_delivery_date
                            ).toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })
                          : "-"}
                      </div>
                    </div>
                    {current.status === "Delivered" && current.delivered_at && (
                      <div className="text-green-700 text-sm mt-2">
                        <span className="font-semibold">Delivered On:</span>{" "}
                        {new Date(current.delivered_at).toLocaleDateString(
                          "en-IN",
                          { timeZone: "Asia/Kolkata" }
                        )}
                        ,{" "}
                        {new Date(current.delivered_at).toLocaleTimeString(
                          "en-IN",
                          {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}{" "}
                        IST
                      </div>
                    )}
                    {current.status === "Cancelled" && current.cancelled_at && (
                      <div className="text-red-700 text-sm mt-2">
                        <span className="font-semibold">Cancelled On:</span>{" "}
                        {new Date(current.cancelled_at).toLocaleDateString(
                          "en-IN",
                          { timeZone: "Asia/Kolkata" }
                        )}
                        ,{" "}
                        {new Date(current.cancelled_at).toLocaleTimeString(
                          "en-IN",
                          {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}{" "}
                        IST
                      </div>
                    )}
                    <div className="text-xs text-gray-600 mt-2 italic">
                      {current.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Invalid input */}
            {mode === null && (
              <div className="text-red-500 text-center mt-4">
                Please enter a valid 10-digit phone number or tracking number.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTracking;
