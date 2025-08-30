import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

export default function Warehouse() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const navigate = useNavigate();
  // Define the warehouse type for TypeScript
  type Warehouse = {
    id: string;
    name: string;
    location: string;
    capacity: string;
    status: string;
  };
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Inventory feature state removed
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    status: "Active",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editIndex !== null) {
      // Edit mode: update warehouse in Supabase
      const warehouseToEdit = warehouses[editIndex];
      const { error } = await supabase
        .from("warehouses")
        .update({
          name: formData.name,
          location: formData.location,
          capacity: formData.capacity,
          status: formData.status.toLowerCase(),
        })
        .eq("id", warehouseToEdit.id);
      if (error) {
        alert("Error updating warehouse: " + error.message);
        return;
      }
      setEditIndex(null);
    } else {
      // Get current user for user_id
      let user_id = undefined;
      try {
        const { data: { user } } = await import("../lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
        user_id = user?.id;
      } catch {}

      // Create mode: insert warehouse in Supabase
      const { error } = await supabase.from("warehouses").insert([
        {
          name: formData.name,
          location: formData.location,
          capacity: formData.capacity,
          status: formData.status.toLowerCase(),
          ...(user_id ? { user_id } : {}),
        },
      ]);
      if (error) {
        alert("Error creating warehouse: " + error.message);
        return;
      }
    }
    setFormData({ name: "", location: "", capacity: "", status: "Active" });
    setShowModal(false);
    fetchWarehouses();
  };

  // Fetch warehouses from Supabase
  const fetchWarehouses = async () => {
    let user_id = undefined;
    try {
      const { data: { user } } = await import("../lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
      user_id = user?.id;
    } catch {}

    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      alert("Error fetching warehouses: " + error.message);
      setWarehouses([]);
    } else {
      setWarehouses(data || []);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    const wh = warehouses[idx];
    setFormData({
      name: wh.name,
      location: wh.location,
      capacity: wh.capacity,
      status: wh.status,
    });
    setShowModal(true);
  };

  const handleDelete = (idx: number) => {
    setDeleteIdx(idx);
    setShowDeleteModal(true);
  };

  // Inventory feature handlers removed

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 mt-2 sticky top-20 z-50 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-blue-600">Warehouses</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, location, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-64"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Create Warehouse
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Capacity</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses
                  .filter((wh) => {
                    const search = searchTerm.trim().toLowerCase();
                    if (!search) return true;
                    const shortId = `wh${wh.id.slice(-4).toLowerCase()}`;
                    return (
                      wh.name.toLowerCase().includes(search) ||
                      wh.location.toLowerCase().includes(search) ||
                      wh.status.toLowerCase().includes(search) ||
                      shortId.includes(search)
                    );
                  })
                  .map((wh, idx) => (
                    <React.Fragment key={wh.id}>
                      <tr className="border-t">
                        <td className="px-4 py-2 align-middle">{`WH${wh.id
                          .slice(-4)
                          .toUpperCase()}`}</td>
                        <td className="px-4 py-2 align-middle">{wh.name}</td>
                        <td className="px-4 py-2 align-middle">
                          {wh.location}
                        </td>
                        <td className="px-4 py-2 align-middle">
                          {wh.capacity}
                        </td>
                        <td className="px-4 py-2 align-middle">
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
                        <td className="px-4 py-2 flex gap-2 align-middle">
                          <button
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded shadow hover:bg-blue-200 transition text-xs font-semibold"
                            onClick={() => handleEdit(idx)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-100 text-red-700 px-3 py-1 rounded shadow hover:bg-red-200 transition text-xs font-semibold"
                            onClick={() => handleDelete(idx)}
                          >
                            Delete
                          </button>
                          {/* Delete Confirmation Modal */}
                          {showDeleteModal && deleteIdx !== null && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                              <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl relative">
                                <button
                                  onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteIdx(null);
                                  }}
                                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                >
                                  <X size={20} />
                                </button>
                                <h2 className="text-xl font-bold mb-4 text-red-600 text-center">
                                  Delete Warehouse
                                </h2>
                                <p className="mb-6 text-center text-gray-700">
                                  Are you sure you want to delete{" "}
                                  <span className="font-semibold">
                                    {warehouses[deleteIdx].name}
                                  </span>
                                  ?
                                </p>
                                <div className="flex gap-4 justify-center">
                                  <button
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                    onClick={() => {
                                      setShowDeleteModal(false);
                                      setDeleteIdx(null);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    onClick={async () => {
                                      if (deleteIdx === null) return;
                                      const warehouseId =
                                        warehouses[deleteIdx].id;
                                      try {
                                        const { error } = await supabase
                                          .from("warehouses")
                                          .delete()
                                          .eq("id", warehouseId);
                                        if (error) throw error;
                                        setWarehouses((prev) =>
                                          prev.filter((_, i) => i !== deleteIdx)
                                        );
                                        setShowDeleteModal(false);
                                        setDeleteIdx(null);
                                        // Optionally, refetch from backend for consistency
                                        fetchWarehouses();
                                      } catch (err) {
                                        alert(
                                          "Error deleting warehouse: " +
                                            (err.message || err)
                                        );
                                        setShowDeleteModal(false);
                                        setDeleteIdx(null);
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                      {/* Inventory row removed */}
                    </React.Fragment>
                  ))}
                {warehouses.filter((wh) => {
                  const search = searchTerm.trim().toLowerCase();
                  if (!search) return true;
                  const shortId = `wh${wh.id.slice(-4).toLowerCase()}`;
                  return (
                    wh.name.toLowerCase().includes(search) ||
                    wh.location.toLowerCase().includes(search) ||
                    wh.status.toLowerCase().includes(search) ||
                    shortId.includes(search)
                  );
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No warehouses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditIndex(null);
                  setFormData({
                    name: "",
                    location: "",
                    capacity: "",
                    status: "Active",
                  });
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-600">
                {editIndex !== null ? "Edit Warehouse" : "Create Warehouse"}
              </h2>
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
                  onClick={handleSave}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Inventory modal removed */}
      </div>
    </div>
  );
}
