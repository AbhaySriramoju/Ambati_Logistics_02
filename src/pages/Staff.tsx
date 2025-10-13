import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, X } from "lucide-react";

export default function Staff() {
  // Input change handlers for create/edit forms
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };
  const [staffList, setStaffList] = useState<any[]>([]);

  // --- Admin Role State ---
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch staff and determine if current user is admin
  const fetchStaff = async () => {
    try {
      const { data: { user } } = await import("../lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
      // Fetch current user's staff record to get their role
      let adminCheck = false;
      if (user?.id) {
        const { data: myStaff, error: myStaffError } = await supabase
          .from("staff")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (!myStaffError && myStaff && (myStaff.role === "admin" || myStaff.role === "Admin")) {
          adminCheck = true;
        }
      }
      setIsAdmin(adminCheck);
      // Fetch all staff - RLS will automatically limit what the user can see
      const { data, error } = await supabase
        .from("staff")
        .select("*");
      if (error) {
        alert("Error fetching staff: " + error.message);
        return;
      }
      const mapped = (data || []).map((item: any, idx: number) => ({
        uuid: item.id,
        displayId: item.staff_code || `S${1000 + idx}`,
        name: item.user_name,
        position: item.position,
        email: item.email,
        phone: item.phone_number,
        status: item.status,
        role: item.role,
        access_level: item.access_level,
      }));

      setStaffList(mapped);
    } catch (err) {
      console.error(err);
      alert("Error fetching staff.");
    }
  };

  // Fetch staff from Supabase on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    status: "Active",
    role: "Staff",
    access_level: "User", // Capital U
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    status: "Active",
    role: "Staff",
    access_level: "User", // Capital U
  });

  // Search/filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");

  // Validation state
  const [formErrors, setFormErrors] = useState<any>({});
  const [editFormErrors, setEditFormErrors] = useState<any>({});

  // --- User Search & Role Assignment Workflow ---
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [assignRole, setAssignRole] = useState("");
  const [assignPosition, setAssignPosition] = useState("");
  const [assignStatus, setAssignStatus] = useState("Active");
  const [showStaffToast, setShowStaffToast] = useState(false);
  const toastTimeoutRef = useRef<any>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState("");

  // User search logic (direct Supabase query, not Edge Function)
  useEffect(() => {
    if (!userSearchTerm) {
      setUserSearchResults([]);
      setUserSearchLoading(false);
      setUserSearchError("");
      return;
    }
    setUserSearchLoading(true);
    setUserSearchError("");
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, auth_user_id, name, email, phone") // <-- add id here
          .or(
            `name.ilike.%${userSearchTerm}%,email.ilike.%${userSearchTerm}%,phone.ilike.%${userSearchTerm}%`
          )
          .limit(10);
        setUserSearchLoading(false);
        if (error) {
          setUserSearchResults([]);
          setUserSearchError("Error fetching users");
        } else if (Array.isArray(data)) {
          setUserSearchResults(data);
        } else {
          setUserSearchResults([]);
        }
      } catch {
        setUserSearchLoading(false);
        setUserSearchResults([]);
        setUserSearchError("Network error");
      }
    };
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  // Remove checkStaff effect and isExistingStaff state
  useEffect(() => {
    if (selectedUser) {
      setAssignRole("");
      setAssignPosition("");
      setAssignStatus("Active");
    }
  }, [selectedUser]);

  // Assign or update staff role safely
  const handleStaffAssignSave = async () => {
    if (!selectedUser || !selectedUser.auth_user_id) {
      setUserSearchError("User ID is missing. Please select a valid user.");
      return;
    }

    try {
      // 1️⃣ Look up local users.id (for possible future use, but not for staff table)
      const { data: userRow, error: userLookupError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", selectedUser.auth_user_id)
        .maybeSingle();

      if (userLookupError || !userRow?.id) {
        setUserSearchError("User not found in users table. Please add user first.");
        return;
      }

      // 2️⃣ Generate staff_code
      let staff_code = "S1000";
      const { data: latestStaff } = await supabase
        .from("staff")
        .select("staff_code")
        .order("staff_code", { ascending: false })
        .limit(1);

      if (latestStaff?.length && /^S\d+$/.test(latestStaff[0].staff_code)) {
        const n = parseInt(latestStaff[0].staff_code.slice(1), 10);
        staff_code = `S${n + 1}`;
      }

      // 3️⃣ Insert or update staff manually (no onConflict, no user_roles writes)
      const { data: existingStaff } = await supabase
        .from("staff")
        .select("*")
        .eq("user_id", selectedUser.auth_user_id)
        .maybeSingle();

      let response;
      if (existingStaff) {
        // Update existing staff (only role and position, optionally status)
        response = await supabase
          .from("staff")
          .update({
            staff_code,
            role: assignRole,
            position: assignPosition,
            status: assignStatus,
            user_name: selectedUser.name,
            email: selectedUser.email,
            phone_number: selectedUser.phone,
          })
          .eq("user_id", selectedUser.auth_user_id);
      } else {
        // Insert new staff
        response = await supabase
          .from("staff")
          .insert({
            user_id: selectedUser.auth_user_id, // auth_user_id stays here
            staff_code,
            role: assignRole,
            position: assignPosition,
            status: assignStatus,
            user_name: selectedUser.name,
            email: selectedUser.email,
            phone_number: selectedUser.phone,
          });
      }
      // Log response for debugging
      console.log("Staff insert/update response:", response);

      // 4️⃣ Reset UI
      setShowStaffToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setShowStaffToast(false), 2000);

      await fetchStaff();
      setSelectedUser(null);
      setUserSearchTerm("");
      setUserSearchResults([]);
      setAssignRole("");
      setAssignPosition("");
      setAssignStatus("Active");
    } catch (error: any) {
      console.error(error);
      setShowStaffToast(false);
      setUserSearchError("Error assigning staff role: " + (error?.message || error));
    }
  };
  // Helper: Validate form
  const validateForm = (data: any) => {
    const errors: any = {};
    if (!data.name.trim()) errors.name = "Name is required.";
    if (!data.position.trim()) errors.position = "Position is required.";
    if (!data.email.trim()) errors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(data.email))
      errors.email = "Invalid email.";
    if (!data.phone.trim()) errors.phone = "Phone is required.";
    else if (!/^\d{10}$/.test(data.phone))
      errors.phone = "Invalid phone (10 digits).";
    if (!data.role.trim()) errors.role = "Role is required.";
    if (!data.status.trim()) errors.status = "Status is required.";
    return errors;
  };

  // Create staff
  const handleCreate = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    try {
      // Get current user for user_id
      let user_id = undefined;
      try {
        const { data: { user } } = await import("../lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
        user_id = user?.id;
      } catch {}

      // Fetch max staff_code for this user from backend (guaranteed unique)
      let nextStaffCode = "S1000";
      if (user_id) {
        const { data: maxData, error: maxError } = await supabase
          .from("staff")
          .select("staff_code")
          .eq("user_id", user_id)
          .order("staff_code", { ascending: false })
          .limit(1)
          .single();
        if (!maxError && maxData && maxData.staff_code && /^S\d+$/.test(maxData.staff_code)) {
          const n = parseInt(maxData.staff_code.slice(1), 10);
          nextStaffCode = `S${n + 1}`;
        }
      }

      const { data, error } = await supabase.from("staff").insert([
        {
          user_name: formData.name,
          position: formData.position,
          email: formData.email,
          phone_number: formData.phone,
          role: formData.role,
          status: formData.status,
          access_level: formData.access_level,
          staff_code: nextStaffCode,
          ...(user_id ? { user_id } : {}),
        },
      ]);
      if (error) {
        alert("Error creating staff: " + error.message);
        return;
      }
      // Refetch staff from backend to update UI, filter by user_id
      let fetch_user_id = undefined;
      try {
        const { data: { user } } = await import("../lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
        fetch_user_id = user?.id;
      } catch {}
      const { data: fetchData, error: fetchError } = await supabase
        .from("staff")
        .select("*")
        .eq("user_id", fetch_user_id);
      if (fetchError) {
        alert("Error fetching staff: " + fetchError.message);
        return;
      }
      const mapped = (fetchData || []).map((item: any, idx: number) => {
        return {
          uuid: item.id,
          displayId: item.staff_code || `S${1000 + idx}`,
          name: item.user_name,
          position: item.position,
          email: item.email,
          phone: item.phone_number,
          status: item.status,
          role: item.role,
          access_level: item.access_level,
        };
      });
      setStaffList(mapped);
      setFormData({
        name: "",
        position: "",
        email: "",
        phone: "",
        status: "Active",
        role: "Staff",
        access_level: "User", // Capital U
      });
      setFormErrors({});
      setShowModal(false);
    } catch (err) {
      alert("Network error: " + err);
    }
  };

  // Edit staff
  const openEditModal = (staff: any) => {
    // Always get the latest staff object from staffList by uuid
    const found = staffList.find((s) => s.uuid === staff.uuid);
    const s = found || staff; // fallback for first open
    setSelectedStaff(s);
    setEditFormData({
      name: s.name,
      position: s.position,
      email: s.email,
      phone: s.phone,
      status: s.status,
      role: s.role,
      access_level: s.access_level || "User",
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };
  // Edit staff (backend update)
  const handleEdit = async () => {
    const errors = validateForm(editFormData);
    if (Object.keys(errors).length) {
      setEditFormErrors(errors);
      return;
    }
    if (!selectedStaff || !selectedStaff.uuid) {
      alert(
        "Error: Staff record is missing a valid ID. Please refresh the page and try again."
      );
      return;
    }
    // Update in Supabase
    try {
      const { error } = await supabase
        .from("staff")
        .update({
          user_name: editFormData.name,
          position: editFormData.position,
          email: editFormData.email,
          phone_number: editFormData.phone,
          status: editFormData.status,
          role: editFormData.role,
          staff_code: selectedStaff.displayId, // Ensure staff_code is always updated
        })
        .eq("id", selectedStaff.uuid);
      if (error) {
        alert("Error updating staff: " + error.message);
        return;
      }
      // Refetch staff from backend
      const { data, error: fetchError } = await supabase
        .from("staff")
        .select("*");
      if (fetchError) {
        alert("Error fetching staff: " + fetchError.message);
        return;
      }
      const mapped = (data || []).map((item: any, idx: number) => {
        return {
          uuid: item.id,
          displayId: item.staff_code || `S${1000 + idx}`,
          name: item.user_name,
          position: item.position,
          email: item.email,
          phone: item.phone_number,
          status: item.status,
          role: item.role,
          access_level: item.access_level,
        };
      });
      setStaffList(mapped);
      setShowEditModal(false);
      setSelectedStaff(null);
    } catch (err) {
      alert("Network error: " + err);
    }
  };

  // Delete staff
  const openDeleteModal = (staff: any) => {
    // Always get the latest staff object from staffList by uuid
    const found = staffList.find((s) => s.uuid === staff.uuid);
    setSelectedStaff(found || staff);
    setShowDeleteModal(true);
  };
  // Delete staff (backend delete)
  const handleDelete = async () => {
    if (!selectedStaff || !selectedStaff.uuid) {
      alert(
        "Error: Staff record is missing a valid ID. Please refresh the page and try again."
      );
      return;
    }
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", selectedStaff.uuid);
      if (error) {
        alert("Error deleting staff: " + error.message);
        return;
      }
      // Refetch staff from backend
      const { data, error: fetchError } = await supabase
        .from("staff")
        .select("*");
      if (fetchError) {
        alert("Error fetching staff: " + fetchError.message);
        return;
      }
      const mapped = (data || []).map((item: any, idx: number) => {
        return {
          uuid: item.id,
          displayId: `S${1000 + idx}`,
          name: item.user_name,
          position: item.position,
          email: item.email,
          phone: item.phone_number,
          status: item.status,
          role: item.role,
          access_level: item.access_level,
        };
      });
      setStaffList(mapped);
      setShowDeleteModal(false);
      setSelectedStaff(null);
    } catch (err) {
      alert("Network error: " + err);
    }
  };

  // Filtered staff for table
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      (staff.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (staff.position?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (staff.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (staff.phone || "").includes(search);
    // If you want to use status/role filters, uncomment below:
    // const matchesStatus = filterStatus === "All" || staff.status === filterStatus;
    // const matchesRole = filterRole === "All" || staff.role === filterRole;
    // return matchesSearch && matchesStatus && matchesRole;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* User Search & Role Assignment */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="mb-4">
          <input
            type="text"
            value={userSearchTerm}
            onChange={e => {
              setUserSearchTerm(e.target.value);
              setSelectedUser(null);
            }}
            placeholder="Search users by name or email..."
            className="border rounded px-3 py-2 w-full mt-10"
          />
          {userSearchLoading && (
            <div className="text-xs text-gray-500 mt-2">Searching...</div>
          )}
          {userSearchError && (
            <div className="text-xs text-red-500 mt-2">{userSearchError}</div>
          )}
          {userSearchTerm && !userSearchLoading && !selectedUser && (
            <div className="bg-white border rounded shadow mt-2 max-h-60 overflow-y-auto">
              {userSearchResults.length > 0 ? (
                userSearchResults.map(user => (
                  <div
                    key={user.id}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserSearchResults([]);
                    }}
                  >
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-gray-500">No users found.</div>
              )}
            </div>
          )}
        </div>
        {selectedUser && (
          <div className="border rounded bg-blue-50/50 p-4 mb-4">
            <div className="mb-2 font-bold text-blue-700">Selected User</div>
            <div>Name: {selectedUser.name}</div>
            <div>Email: {selectedUser.email}</div>
            <div>Phone: {selectedUser.phone}</div>
            <form
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              onSubmit={e => {
                e.preventDefault();
                handleStaffAssignSave();
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={assignRole}
                  onChange={e => setAssignRole(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                  required
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="delivery staff / drivers">Delivery Staff / Drivers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input
                  type="text"
                  value={assignPosition}
                  onChange={e => setAssignPosition(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={assignStatus}
                  onChange={e => setAssignStatus(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-3 flex gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded shadow"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="border px-6 py-2 rounded"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {showStaffToast && (
          <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow z-50">
            Staff updated successfully
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-20 left-4 z-50 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition"
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
          <h1 className="text-3xl font-bold text-blue-600">Staff</h1>
          {/* Removed search input and Create Staff button as requested */}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Position</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.uuid} className="border-t">
                  <td className="px-4 py-2">{`S${staff.uuid
                    .slice(-4)
                    .toUpperCase()}`}</td>
                  <td className="px-4 py-2">{staff.name}</td>
                  <td className="px-4 py-2">{staff.position}</td>
                  <td className="px-4 py-2">{staff.email}</td>
                  <td className="px-4 py-2">{staff.phone}</td>
                  <td className="px-4 py-2">{staff.role || "Staff"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        staff.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded shadow hover:bg-blue-200 transition text-xs font-semibold"
                      onClick={() => openEditModal(staff)}
                      disabled={!isAdmin}
                      style={!isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-100 text-red-700 px-3 py-1 rounded shadow hover:bg-red-200 transition text-xs font-semibold"
                      onClick={() => openDeleteModal(staff)}
                      disabled={!isAdmin}
                      style={!isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No staff records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormErrors({});
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-600">
                Create Staff
              </h2>
              <div className="space-y-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Full Name"
                />
                {formErrors.name && (
                  <div className="text-red-500 text-xs">{formErrors.name}</div>
                )}
                <input
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.position ? "border-red-500" : ""
                  }`}
                  placeholder="Position"
                />
                {formErrors.position && (
                  <div className="text-red-500 text-xs">
                    {formErrors.position}
                  </div>
                )}
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Email"
                />
                {formErrors.email && (
                  <div className="text-red-500 text-xs">{formErrors.email}</div>
                )}
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.phone ? "border-red-500" : ""
                  }`}
                  placeholder="Phone Number"
                />
                {formErrors.phone && (
                  <div className="text-red-500 text-xs">{formErrors.phone}</div>
                )}
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Delivery Staff / Drivers">
                    Delivery Staff / Drivers
                  </option>
                  <option value="admin">admin</option>
                </select>
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

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFormErrors({});
                  setSelectedStaff(null);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-600">
                Edit Staff
              </h2>
              <div className="space-y-4">
                <input
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    editFormErrors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Full Name"
                />
                {editFormErrors.name && (
                  <div className="text-red-500 text-xs">
                    {editFormErrors.name}
                  </div>
                )}
                <input
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    editFormErrors.position ? "border-red-500" : ""
                  }`}
                  placeholder="Position"
                />
                {editFormErrors.position && (
                  <div className="text-red-500 text-xs">
                    {editFormErrors.position}
                  </div>
                )}
                <input
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    editFormErrors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Email"
                />
                {editFormErrors.email && (
                  <div className="text-red-500 text-xs">
                    {editFormErrors.email}
                  </div>
                )}
                <input
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    editFormErrors.phone ? "border-red-500" : ""
                  }`}
                  placeholder="Phone Number"
                />
                {editFormErrors.phone && (
                  <div className="text-red-500 text-xs">
                    {editFormErrors.phone}
                  </div>
                )}
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="delivery staff / drivers">
                    Delivery Staff / Drivers
                  </option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  onClick={handleEdit}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl relative">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStaff(null);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-red-600 text-center">
                Delete Staff
              </h2>
              <p className="mb-6 text-center text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedStaff?.name}</span>?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedStaff(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// When you POST to backend, map frontend fields to backend fields as needed
// Example: name -> user_name, phone -> phone_number
