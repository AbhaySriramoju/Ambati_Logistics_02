import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Client {
  id: string;
  client_code: string;
  client_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  gstin: string;
  pan: string;
}

const initialForm: Omit<Client, "id"> = {
  client_code: "",
  client_name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  gstin: "",
  pan: "",
};

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase.from("clients").select("*").order("client_code");
    if (error) setErrorMsg(error.message || "Failed to fetch clients.");
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors: Partial<typeof form> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) errors[key as keyof typeof form] = "Required";
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save (Add/Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!validateForm()) return;
    setSubmitLoading(true);
    if (editingId) {
      // Update
      const { error } = await supabase
        .from("clients")
        .update(form)
        .eq("id", editingId);
      if (error) setErrorMsg(error.message || "Failed to update client.");
    } else {
      // Insert
      const { error } = await supabase.from("clients").insert([form]);
      if (error) setErrorMsg(error.message || "Failed to add client.");
    }
    setSubmitLoading(false);
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    fetchClients();
  };

  // Handle Edit
  const handleEdit = (client: Client) => {
    setForm({
      client_code: client.client_code,
      client_name: client.client_name,
      contact_email: client.contact_email,
      contact_phone: client.contact_phone,
      address: client.address,
      gstin: client.gstin,
      pan: client.pan,
    });
    setEditingId(client.id);
    setShowModal(true);
    setFormErrors({});
    setErrorMsg("");
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitLoading(true);
    setErrorMsg("");
    const { error } = await supabase.from("clients").delete().eq("id", deleteId);
    if (error) setErrorMsg(error.message || "Failed to delete client.");
    setDeleteId(null);
    setSubmitLoading(false);
    fetchClients();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Clients</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setForm(initialForm);
              setFormErrors({});
              setErrorMsg("");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
          >
            Add Client
          </button>
        </div>
        {errorMsg && (
          <div className="mb-4 text-red-600 font-semibold">{errorMsg}</div>
        )}
        <div className="bg-white rounded-lg shadow border">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 border">Client Code</th>
                <th className="px-4 py-2 border">Client Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Contact Number</th>
                <th className="px-4 py-2 border">Address</th>
                <th className="px-4 py-2 border">GSTIN</th>
                <th className="px-4 py-2 border">PAN</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2 border">{client.client_code}</td>
                    <td className="px-4 py-2 border">{client.client_name}</td>
                    <td className="px-4 py-2 border">{client.contact_email}</td>
                    <td className="px-4 py-2 border">{client.contact_phone}</td>
                    <td className="px-4 py-2 border">{client.address}</td>
                    <td className="px-4 py-2 border">{client.gstin}</td>
                    <td className="px-4 py-2 border">{client.pan}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(client.id)}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-700">
                {editingId ? "Edit Client" : "Add Client"}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client Code
                  </label>
                  <input
                    type="text"
                    value={form.client_code}
                    onChange={(e) =>
                      setForm({ ...form, client_code: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.client_code ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.client_code && (
                    <div className="text-xs text-red-500">
                      {formErrors.client_code}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) =>
                      setForm({ ...form, client_name: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.client_name ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.client_name && (
                    <div className="text-xs text-red-500">
                      {formErrors.client_name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) =>
                      setForm({ ...form, contact_email: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.contact_email ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.contact_email && (
                    <div className="text-xs text-red-500">
                      {formErrors.contact_email}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm({ ...form, contact_phone: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.contact_phone ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.contact_phone && (
                    <div className="text-xs text-red-500">
                      {formErrors.contact_phone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.address ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.address && (
                    <div className="text-xs text-red-500">
                      {formErrors.address}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) =>
                      setForm({ ...form, gstin: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.gstin ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.gstin && (
                    <div className="text-xs text-red-500">
                      {formErrors.gstin}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={form.pan}
                    onChange={(e) =>
                      setForm({ ...form, pan: e.target.value })
                    }
                    className={`w-full border rounded px-3 py-2 ${
                      formErrors.pan ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.pan && (
                    <div className="text-xs text-red-500">
                      {formErrors.pan}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                  >
                    {submitLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation */}
        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
              <h3 className="text-lg font-bold text-red-600 mb-2">
                Delete Client
              </h3>
              <p className="mb-4 text-gray-700">
                Are you sure you want to delete this client?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                >
                  {submitLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;
