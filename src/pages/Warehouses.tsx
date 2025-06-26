import React, { useState } from "react";
import {
  Warehouse,
  LogOut,
  Truck,
  Package,
  Users,
  Settings,
  BarChart2,
  Plus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sidebar Item
const SidebarItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <div
    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 cursor-pointer transition"
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const Warehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([
    { id: "WH001", name: "Main Warehouse", location: "New York" },
    { id: "WH002", name: "Secondary Hub", location: "Los Angeles" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", location: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddWarehouse = () => {
    const id = `WH${Math.floor(Math.random() * 9000 + 1000)}`;
    const newWarehouse = { id, ...form };
    setWarehouses([newWarehouse, ...warehouses]);
    setForm({ name: "", location: "" });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-white w-full md:w-64 p-6 shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">LogiTrack</h1>
          <p className="text-sm text-gray-500">Logistics Dashboard</p>
        </div>
        <nav className="space-y-4">
          <SidebarItem icon={<BarChart2 />} label="Overview" onClick={() => navigate("/")} />
          <SidebarItem icon={<Truck />} label="Shipments" />
          <SidebarItem icon={<Package />} label="Packages" />
          <SidebarItem icon={<Users />} label="Clients" />
          <SidebarItem icon={<Warehouse />} label="Warehouses" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </nav>
        <button className="flex items-center text-red-500 hover:text-red-700 mt-10">
          <LogOut className="mr-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Warehouses</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Warehouse</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-50 text-gray-700">
              <tr>
                <th className="px-4 py-3">Warehouse ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((wh) => (
                <tr key={wh.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{wh.id}</td>
                  <td className="px-4 py-3">{wh.name}</td>
                  <td className="px-4 py-3">{wh.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4 mt-10 mb-10 relative z-50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">Create Warehouse</h3>
            <input
              type="text"
              name="name"
              placeholder="Warehouse Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddWarehouse}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition"
            >
              Add Warehouse
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-2xl"
            >
              <X />
            </button> 
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
