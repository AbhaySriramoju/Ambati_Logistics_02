import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState([
    {
      id: "WH001",
      name: "Central Warehouse",
      location: "Hyderabad",
      capacity: "5000 units",
      status: "Active",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    status: "Active",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    const newWarehouse = {
      id: `WH${String(warehouses.length + 1).padStart(3, "0")}`,
      ...formData,
    };
    setWarehouses([...warehouses, newWarehouse]);
    setFormData({ name: "", location: "", capacity: "", status: "Active" });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Warehouses</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Create Warehouse
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Capacity</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((wh) => (
                <tr key={wh.id} className="border-t">
                  <td className="px-4 py-2">{wh.id}</td>
                  <td className="px-4 py-2">{wh.name}</td>
                  <td className="px-4 py-2">{wh.location}</td>
                  <td className="px-4 py-2">{wh.capacity}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        wh.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {wh.status}
                    </span>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No warehouses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-600">Create Warehouse</h2>
              <div className="space-y-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Warehouse Name"
                />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Location"
                />
                <input
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Capacity (e.g. 5000 units)"
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  onClick={handleCreate}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
