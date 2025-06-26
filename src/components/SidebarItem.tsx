import React from "react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;              // For navigation
  onClick?: () => void;     // Optional click handler
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, onClick }) => {
  const content = (
    <div className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 cursor-pointer transition">
      {icon}
      <span>{label}</span>
    </div>
  );

  return to ? (
    <Link to={to} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <div onClick={onClick}>
      {content}
    </div>
  );
};

export default SidebarItem;
