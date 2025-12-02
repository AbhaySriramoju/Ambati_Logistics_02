import React, { useEffect, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  created_at: string;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Detect mobile/tablet
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    setLoading(true);
    setError("");

    try {
      let query = supabase
        .from("contacts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        setError(fetchError.message || "Failed to fetch messages");
        setMessages([]);
        setTotal(0);
      } else {
        setMessages(data || []);
        setTotal(count || 0);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" size={28} />
              <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Messages Table or Cards */}
        {isMobile ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No messages found.</div>
            ) : (
              messages.map((msg) => {
                const isLong = msg.message.length > 200;
                return (
                  <div key={msg.id} className="bg-white rounded-lg shadow border p-4">
                    <div className="font-semibold text-gray-900 mb-1">{msg.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{msg.email} | {msg.phone}</div>
                    <div className="mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{msg.service}</span>
                    </div>
                    <div
                      className={`text-gray-700 text-sm ${expandedId === msg.id ? "" : "line-clamp-2"} cursor-pointer`}
                      onClick={() => {
                        if (isLong) setModalMessage(msg.message);
                        else setExpandedId(expandedId === msg.id ? null : msg.id);
                      }}
                      title={msg.message.length > 100 ? "Tap to expand" : undefined}
                    >
                      {msg.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{formatDate(msg.created_at)}</div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Service</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Message</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">Loading messages...</td>
                    </tr>
                  ) : messages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">No messages found.</td>
                    </tr>
                  ) : (
                    messages.map((msg) => {
                      const isLong = msg.message.length > 200;
                      return (
                        <tr key={msg.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">{msg.name}</td>
                          <td className="px-6 py-4 text-gray-700">{msg.email}</td>
                          <td className="px-6 py-4 text-gray-700">{msg.phone}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{msg.service}</span>
                          </td>
                          <td
                            className={`px-6 py-4 text-gray-700 max-w-xs cursor-pointer ${expandedId === msg.id ? "whitespace-normal" : "truncate"}`}
                            title={isLong ? "Click to expand" : undefined}
                            onClick={() => {
                              if (isLong) setModalMessage(msg.message);
                              else setExpandedId(expandedId === msg.id ? null : msg.id);
                            }}
                          >
                            {expandedId === msg.id && !isLong ? (
                              <span>{msg.message}</span>
                            ) : (
                              <span>{msg.message}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm">{formatDate(msg.created_at)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for long messages */}
        {modalMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ minWidth: 40, minHeight: 40 }}
                onClick={() => setModalMessage(null)}
                aria-label="Close message modal"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-2">Full Message</h2>
              <div className="text-gray-800 whitespace-pre-line break-words">{modalMessage}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
