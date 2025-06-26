import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const WhatsAppButton: React.FC = () => {
  const location = useLocation();

  // Hide on dashboard
  if (location.pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <a
      href="https://wa.me/919177656116"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
    >
      <FaWhatsapp size={28} />
    </a>
  );
};

export default WhatsAppButton;
