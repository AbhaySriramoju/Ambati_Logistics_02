import React, { useEffect, useRef, useState } from "react";
import {
  Package,
  Truck,
  Users,
  Settings,
  LogOut,
  BarChart2,
  Plus,
  Pencil,
  Warehouse,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Barcode from "react-barcode";
import SidebarItem from "../components/SidebarItem";
import Card from "../components/Card";
import CustomSelect from "../components/CustomSelect";
import { supabase } from "../lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

interface Address {
  name: string;
  street?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactNumber: string;
  email?: string;
}

interface Package {
  description: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  quantity: number;
  price: number;
  packageType: string;
}

interface Shipment {
  id: string;
  readableShipmentId?: string;
  shipFrom: Address;
  shipTo: Address;
  packages: Package[];
  status: string;
  pickupDate: string;
  deliveryDate?: string;
  shippingMethod: string;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  totalWeight: number;
  // totalValue?: number; // Removed: not in shipments table
}

const Dashboard = () => {
  const location = useLocation();
  // Filters and pagination state
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  // Shipment type/interface update to include createDate
  // If Shipment is imported from types, update there as well
  type Shipment = {
    id: string;
    readableShipmentId?: string;
    shipFrom: {
      name: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      contactNumber: string;
      email: string;
    };
    shipTo: {
      name: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      contactNumber: string;
      email: string;
    };
    packages: Package[];
    status: string;
    pickupDate: string;
    deliveryDate?: string;
    shippingMethod: string;
    totalWeight: number;
    notes?: string;
    createdAt?: string; // <-- Use this field for dashboard display
  };

  // Fetch shipments from Supabase
  // Move fetchShipments outside useEffect so it can be called after update
  const fetchShipments = async () => {
    setLoading(true);
    let query = supabase
      .from("shipments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }); // Use created_at for ordering
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }
    if (searchTerm) {
      // Adjust field names to match your DB schema
      query = query.or(
        [
          `shipment_id.ilike.%${searchTerm}%`,
          `tracking_number.ilike.%${searchTerm}%`,
          `from_name_or_company.ilike.%${searchTerm}%`,
          `to_name_or_company.ilike.%${searchTerm}%`,
        ].join(",")
      );
    }
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);
    const { data, error, count } = await query;
    if (error) {
      console.error("Error fetching shipments:", error.message);
      setShipments([]);
      setTotal(0);
    } else {
      // Fetch packages for all shipment IDs
      const shipmentIds = (data || []).map((row: any) => row.id);
      let allPackages: any[] = [];
      if (shipmentIds.length > 0) {
        const { data: pkgData, error: pkgError } = await supabase
          .from("shipment_items")
          .select("*")
          .in("shipment_id", shipmentIds);
        if (pkgError) {
          console.error("Error fetching packages:", pkgError.message);
          allPackages = [];
        } else {
          allPackages = pkgData || [];
        }
      }
      // Map DB fields to Shipment type, attach packages
      const mappedShipments = (data || []).map((row: any) => {
        // Use created_at for pickupDate and createdAt
        const pickupDate = row.created_at
          ? String(row.created_at).split("T")[0]
          : "";
        const createdAt = row.created_at
          ? String(row.created_at).split("T")[0]
          : "";
        const estimatedDeliveryDate = row.estimated_delivery_date
          ? String(row.estimated_delivery_date).split("T")[0]
          : row.deliveryDate
          ? String(row.deliveryDate).split("T")[0]
          : "";
        const packages = allPackages
          .filter((pkg) => pkg.shipment_id === row.id)
          .map((pkg) => ({
            description: pkg.description || "",
            weight: pkg.weight_kg || 0,
            length: pkg.length_cm || 0,
            width: pkg.width_cm || 0,
            height: pkg.height_cm || 0,
            quantity: pkg.quantity || 1,
        price: pkg.price_inr || 0,
            packageType: pkg.package_type || "Box",
            readableShipmentId: row.shipment_id ? String(row.shipment_id) : "",
          }));
        return {
          id: row.id ? String(row.id) : "", // always use UUID for id
          readableShipmentId: row.shipment_id ? String(row.shipment_id) : "", // readable ID for display
          shipFrom: {
            name: row.from_name_or_company
              ? String(row.from_name_or_company)
              : "",
            street: row.from_street_address
              ? String(row.from_street_address)
              : "",
            city: row.from_city ? String(row.from_city) : "",
            state: row.from_state ? String(row.from_state) : "",
            postalCode: row.from_postal_code
              ? String(row.from_postal_code)
              : "",
            country: row.from_country ? String(row.from_country) : "",
            contactNumber: row.from_contact_number
              ? String(row.from_contact_number)
              : "",
            email: row.from_email ? String(row.from_email) : "",
          },
          shipTo: {
            name: row.to_name_or_company ? String(row.to_name_or_company) : "",
            street: row.to_street_address ? String(row.to_street_address) : "",
            city: row.to_city ? String(row.to_city) : "",
            state: row.to_state ? String(row.to_state) : "",
            postalCode: row.to_postal_code ? String(row.to_postal_code) : "",
            country: row.to_country ? String(row.to_country) : "",
            contactNumber: row.to_contact_number
              ? String(row.to_contact_number)
              : "",
            email: row.to_email ? String(row.to_email) : "",
          },
          packages,
          status: row.status ? String(row.status) : "",
          pickupDate,
          createdAt,
          deliveryDate: estimatedDeliveryDate,
          shippingMethod: row.shipping_method
            ? String(row.shipping_method)
            : "",
          carrier: row.carrier ? String(row.carrier) : "",
          trackingNumber: row.tracking_number
            ? String(row.tracking_number)
            : "",
          notes: row.notes ? String(row.notes) : "",
          totalWeight:
            typeof row.total_weight === "number" ? row.total_weight : 0,
        };
      });
      // No need to sort again, backend already returns newest first
      setShipments(mappedShipments);
      setTotal(count || 0);
      console.log(
        "Dashboard order:",
        mappedShipments.map((s) => s.pickupDate)
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, searchTerm, dateFrom, dateTo, page, pageSize]);

  // ...removed localStorage logic...

  const [showSuccess, setShowSuccess] = useState(
    location.state?.shipmentCreated || false
  );

  React.useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // After using location.state, clear it so refresh doesn't re-add
  React.useEffect(() => {
    if (location.state?.shipmentCreated || location.state?.newShipment) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Shipment, "id">>({
    shipFrom: {
      name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      contactNumber: "",
      email: "",
    },
    shipTo: {
      name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      contactNumber: "",
      email: "",
    },
    packages: [
      {
        description: "",
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        quantity: 1,
        price: 0,
        packageType: "Box",
      },
    ],
    status: "Pending",
    pickupDate: new Date().toISOString().split("T")[0], // Always today, not editable
    deliveryDate: new Date().toISOString().split("T")[0], // Default to today
    shippingMethod: "Standard",
    totalWeight: 0,
    createdAt: new Date().toISOString().split("T")[0], // Always default to today
  });
  const [barcodeValue, setBarcodeValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleAddressChange = (
    type: "shipFrom" | "shipTo",
    field: keyof Address,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handlePackageChange = (
    index: number,
    field: keyof Package,
    value: string | number
  ) => {
    const newPackages = [...form.packages];
    newPackages[index] = {
      ...newPackages[index],
      [field]: value,
    };

    // Calculate total price (sum of all package prices)
    const totalPrice = newPackages.reduce(
      (sum, pkg) => sum + (typeof pkg.price === 'number' ? pkg.price : 0),
      0
    );

    setForm((prev) => ({
      ...prev,
      packages: newPackages,
      totalWeight: calculateTotalWeight(newPackages),
      base_price: totalPrice, // Store in form for later use
    }));
  };

  const calculateTotalWeight = (packages: Package[]) => {
    return packages.reduce(
      (total, pkg) => total + pkg.weight * pkg.quantity,
      0
    );
  };

  const openEditModal = (shipment: Shipment, index: number) => {
    setShowModal(true);
    setIsEditing(true);
    setEditingIndex(index);
    setForm({
      ...shipment,
      pickupDate: shipment.pickupDate.split("T")[0],
      deliveryDate: shipment.deliveryDate?.split("T")[0],
      readableShipmentId: shipment.readableShipmentId || "",
    });
    setBarcodeValue(shipment.readableShipmentId || shipment.id);
  };

  const openNewModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditingIndex(null);
    setForm({
      shipFrom: {
        name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        contactNumber: "",
        email: "",
      },
      shipTo: {
        name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        contactNumber: "",
        email: "",
      },
      packages: [
        {
          description: "",
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          quantity: 1,
          price: 0,
          packageType: "Box",
        },
      ],
      status: "Pending",
      pickupDate: new Date().toISOString().split("T")[0],
      deliveryDate: "",
      shippingMethod: "Standard",
      totalWeight: 0,
      createdAt: new Date().toISOString().split("T")[0], // default to today
      readableShipmentId: "",
    });
    setBarcodeValue("");
  };

  const handleSubmit = async () => {
    // Calculate total price (sum of all package values)
    const totalPrice = form.packages.reduce(
      (sum, pkg) => sum + (typeof pkg.price === 'number' ? pkg.price : 0),
      0
    );

    if (isEditing && editingIndex !== null) {
      setLoading(true);
      const shipmentUpdateId = shipments[editingIndex].id;
      // Build the update payload with all fields matching your DB schema
      const shipmentUpdatePayload: any = {
        shipment_id: form.readableShipmentId,
        status: form.status,
        shipping_method: form.shippingMethod,
        notes: form.notes || null,
        from_name_or_company: form.shipFrom.name,
        from_contact_number: form.shipFrom.contactNumber,
        from_email: form.shipFrom.email,
        from_street_address: form.shipFrom.street,
        from_city: form.shipFrom.city,
        from_state: form.shipFrom.state,
        from_postal_code: form.shipFrom.postalCode,
        from_country: form.shipFrom.country,
        to_name_or_company: form.shipTo.name,
        to_contact_number: form.shipTo.contactNumber,
        to_email: form.shipTo.email,
        to_street_address: form.shipTo.street,
        to_city: form.shipTo.city,
        to_state: form.shipTo.state,
        to_postal_code: form.shipTo.postalCode,
        to_country: form.shipTo.country,
        total_weight: form.totalWeight,
        base_price: totalPrice, // <-- Add this line to update price
        created_at: form.createdAt
          ? new Date(form.createdAt).toISOString()
          : new Date().toISOString(),
        estimated_delivery_date: form.deliveryDate
          ? new Date(form.deliveryDate).toISOString()
          : null,
      };
      try {
        const { error: shipmentError } = await supabase
          .from("shipments")
          .update(shipmentUpdatePayload)
          .eq("id", shipmentUpdateId);
        if (shipmentError) {
          console.error("Error updating shipments:", shipmentError.message);
          setLoading(false);
          return;
        }
        // Insert a new update into shipment_updates (history table)
        const updateHistoryPayload: any = {
          shipment_id: shipmentUpdateId, // UUID
          status: form.status,
          location: form.shipTo.city,
          updated_at: new Date().toISOString(),
        };
        const { error: updateError } = await supabase
          .from("shipment_updates")
          .insert([updateHistoryPayload]);
        if (updateError) {
          console.error(
            "Error inserting shipment_updates:",
            updateError.message
          );
          setLoading(false);
          return;
        }
        setBarcodeValue(form.readableShipmentId || shipmentUpdateId);
      } catch (err) {
        console.error("Error updating shipment:", err);
      }
      setLoading(false);
      setShowModal(false);
      // Refetch shipments to update dashboard with latest data
      if (typeof fetchShipments === "function") {
        fetchShipments();
      }
    } else {
      setLoading(true);
      // Map frontend form fields to backend DB columns
      const shipmentData = {
        shipment_id: form.readableShipmentId,
        status: form.status,
        shipping_method: form.shippingMethod,
        notes: form.notes || null,
        from_name_or_company: form.shipFrom.name,
        from_contact_number: form.shipFrom.contactNumber,
        from_email: form.shipFrom.email,
        from_street_address: form.shipFrom.street,
        from_city: form.shipFrom.city,
        from_state: form.shipFrom.state,
        from_postal_code: form.shipFrom.postalCode,
        from_country: form.shipFrom.country,
        to_name_or_company: form.shipTo.name,
        to_contact_number: form.shipTo.contactNumber,
        to_email: form.shipTo.email,
        to_street_address: form.shipTo.street,
        to_city: form.shipTo.city,
        to_state: form.shipTo.state,
        to_postal_code: form.shipTo.postalCode,
        to_country: form.shipTo.country,
        total_weight: form.totalWeight,
        base_price: totalPrice, // <-- Add this line to insert price
        created_at: form.createdAt
          ? new Date(form.createdAt).toISOString()
          : new Date().toISOString(),
        estimated_delivery_date: form.deliveryDate
          ? new Date(form.deliveryDate).toISOString()
          : null,
      };
      try {
        const { data, error } = await supabase
          .from("shipments")
          .insert([shipmentData])
          .select();
        if (error) {
          console.error("Error creating shipment:", error.message);
          setLoading(false);
          return;
        }
        // After creating, refetch shipments from DB to ensure correct order
        await fetchShipments();
        const createdShipment = data && data[0];
        if (createdShipment) {
          setBarcodeValue(createdShipment.shipment_id || "");
        }
      } catch (err) {
        console.error("Error creating shipment:", err);
      }
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Dialog state for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const handleDeleteConfirmed = () => {
    if (deleteDialog.index === null) {
      setDeleteDialog({ open: false, index: null });
      return;
    }
    if (deleteDialog.index === null) {
      setDeleteDialog({ open: false, index: null });
      return;
    }
    const shipmentId = shipments[deleteDialog.index].id;
    // Delete shipment and its items using Supabase client
    (async () => {
      try {
        // Delete package items first
        const { error: itemsError } = await supabase
          .from("shipment_items")
          .delete()
          .eq("shipment_id", shipmentId);
        if (itemsError) throw itemsError;
        // Delete shipment
        const { error: shipmentError } = await supabase
          .from("shipments")
          .delete()
          .eq("id", shipmentId);
        if (shipmentError) throw shipmentError;
        // Remove from local state
        setShipments((prev) => prev.filter((_, i) => i !== deleteDialog.index));
        setDeleteDialog({ open: false, index: null });
        // Optionally, refetch shipments from backend for consistency
        if (typeof fetchShipments === "function") {
          fetchShipments();
        }
      } catch (err: any) {
        alert("Error deleting shipment: " + (err.message || err));
        setDeleteDialog({ open: false, index: null });
      }
    })();
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, index: null });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="bg-white w-full md:w-64 p-6 shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Ambati</h1>
          <p className="text-sm text-gray-500">Logistics Dashboard</p>
        </div>
        <nav className="space-y-4">
          {/* <div>
            <SidebarItem icon={<BarChart2 />} label="Overview" />
          </div> */}
          <div>
            <SidebarItem icon={<Truck />} label="Shipments" to="/dashboard" />
          </div>
          <div>
            <SidebarItem icon={<Package />} label="Client Invoice" to="/client-invoice" />
          </div>
          {/* <div>
            <SidebarItem icon={<Package />} label="Packages" />
          </div> */}
          <div>
            <SidebarItem
              icon={<Warehouse />}
              label="Warehouse"
              to="/warehouse"
            />
          </div>
          <div>
            <SidebarItem icon={<Users />} label="Staff" to="/staff" />
          </div>
          {/* <div>
            <SidebarItem icon={<Settings />} label="Settings" />
          </div> */}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center text-red-500 hover:text-red-700 mt-10"
        >
          <LogOut className="mr-2" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 space-y-10">
        {/* Header and cards remain the same */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Welcome, Admin</h2>
          <div className="flex gap-2">
            <Link
              to="/create-shipment"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow text-lg flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Shipment</span>
            </Link>
            <Link
              to="/shipment-payment"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow text-lg flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pay for Shipment</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            icon={<Truck className="text-blue-600" />}
            title="Total Shipments"
            value={shipments.length.toString()}
          />
          <Card
            icon={<Package className="text-green-600" />}
            title="Active Packages"
            value={shipments
              .reduce(
                (sum, ship) =>
                  sum +
                  ship.packages.reduce((pSum, pkg) => pSum + pkg.quantity, 0),
                0
              )
              .toString()}
          />
          <Card
            icon={<Users className="text-purple-600" />}
            title="Registered Clients"
            value="42"
          />
        </div>

        {/* Shipments table */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Recent Shipments
          </h3>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">All Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Pending">Pending</option>
              <option value="Pre-Transit">Pre-Transit</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed Attempt">Failed Attempt</option>
              <option value="Delayed">Delayed</option>
              <option value="Lost/Damaged">Lost/Damaged</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="border px-3 py-2 rounded"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="overflow-x-auto rounded-lg border bg-gray-50">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Shipment ID</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Weight (kg)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6">
                      Loading...
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6">
                      No shipments found.
                    </td>
                  </tr>
                ) : (
                  shipments.map((ship, index) => (
                    <tr
                      key={ship.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 flex flex-col items-start gap-2">
                        {/* Show readable shipment ID, fallback to shipment_id or formatted UUID if missing */}
                        {ship.readableShipmentId
                          ? ship.readableShipmentId
                          : `SHP${String(ship.id).slice(0, 6).toUpperCase()}`}
                      </td>
                      <td className="px-4 py-3">
                        {ship.shipFrom.city}, {ship.shipFrom.country}
                      </td>
                      <td className="px-4 py-3">
                        {ship.shipFrom.contactNumber}
                      </td>
                      <td className="px-4 py-3">
                        {ship.shipTo.city}, {ship.shipTo.country}
                      </td>
                      <td className="px-4 py-3">{ship.totalWeight}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ship.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : ship.status === "In Transit"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ship.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Display only the date part of createdAt in IST, fallback to pickupDate if missing */}
                        {ship.createdAt
                          ? new Date(ship.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          : ship.pickupDate
                          ? new Date(ship.pickupDate).toLocaleDateString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          : ""}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(ship, index)}
                            className="text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                          <Link
                            to="/shipment-payment"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700 flex items-center space-x-1 px-2 py-1 rounded transition border border-green-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Pay</span>
                          </Link>
                          <button
                            onClick={() => setDeleteDialog({ open: true, index })}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-1 px-2 py-1 rounded transition"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>
                          {ship.status === "Ready for Payment" && (
                            <Link
                              to="/shipment-payment"
                              className="text-green-600 hover:bg-green-50 hover:text-green-700 flex items-center space-x-1 px-2 py-1 rounded transition border border-green-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Pay</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>
              Showing {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, total)} of {total}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>Page {page}</span>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border px-2 py-1 rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </section>
        {/* Delete Confirmation Dialog */}
        {deleteDialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-80 max-w-full border border-red-200 animate-fade-in">
              <h3 className="text-lg text-red-500 font-bold mb-2 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Delete Shipment
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this shipment?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-lg relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-700">
                Edit Shipment
              </h2>
              {/* Barcode and Print Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white p-2 rounded shadow flex items-center gap-2">
                  <Barcode
                    value={barcodeValue}
                    width={1.5}
                    height={40}
                    fontSize={12}
                    displayValue={false}
                  />
                  <span className="text-xs text-gray-500 select-all">
                    {barcodeValue}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (printRef.current) {
                      const printContents = printRef.current.innerHTML;
                      const printWindow = window.open(
                        "",
                        "",
                        "height=700,width=900"
                      );
                      if (printWindow) {
                        printWindow.document.write(
                          "<html><head><title>Print Shipment</title>"
                        );
                        printWindow.document.write(
                          "<style>body{font-family:sans-serif;padding:24px;} .barcode{margin-bottom:16px;} table{width:100%;border-collapse:collapse;} td,th{border:1px solid #ccc;padding:8px;} .section{margin-bottom:18px;} .section-title{font-weight:bold;margin-bottom:6px;}</style>"
                        );
                        printWindow.document.write("</head><body>");
                        printWindow.document.write(printContents);
                        printWindow.document.write("</body></html>");
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          printWindow.close();
                        }, 400);
                      }
                    }
                  }}
                  className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow text-sm"
                >
                  Print
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-6"
              >
                {/* Print Content Start */}
                <div ref={printRef}>
                  {/* Ship From Section */}
                  <div className="border border-blue-100 p-4 rounded-xl bg-blue-50/50 section">
                    <h4 className="font-medium text-gray-700 mb-3 section-title">
                      Ship From
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name or Company Name
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.name}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.contactNumber}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "contactNumber",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.street}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "street",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.shipFrom.email}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "email",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.city}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "city",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.state}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "state",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.postalCode}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "postalCode",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={form.shipFrom.country}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipFrom",
                              "country",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Ship To Section */}
                  <div className="border border-blue-100 p-4 rounded-xl bg-blue-50/50 section">
                    <h4 className="font-medium text-gray-700 mb-3 section-title">
                      Ship To
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name or Company Name
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.name}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.contactNumber}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "contactNumber",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.street}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "street",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.shipTo.email}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "email",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.city}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "city",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.state}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "state",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.postalCode}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "postalCode",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={form.shipTo.country}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipTo",
                              "country",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Packages Section */}
                  <div className="border border-blue-100 p-4 rounded-xl bg-blue-50/50 section">
                    <h4 className="font-medium text-gray-700 mb-3 section-title">
                      Packages
                    </h4>
                    <div>
                      {form.packages.map((pkg, index) => (
                        <div key={index} className="mb-4 last:mb-0 border-b pb-4 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-medium text-gray-600">
                              Package {index + 1}
                            </h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={pkg.description}
                                onChange={(e) =>
                                  handlePackageChange(index, "description", e.target.value)
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Package Type
                              </label>
                              <select
                                value={pkg.packageType}
                                onChange={(e) =>
                                  handlePackageChange(index, "packageType", e.target.value)
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              >
                                <option value="Box">Box</option>
                                <option value="Envelope">Envelope</option>
                                <option value="Pallet">Pallet</option>
                                <option value="Tube">Tube</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weight (kg)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={pkg.weight}
                                onChange={(e) =>
                                  handlePackageChange(index, "weight", parseFloat(e.target.value))
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={pkg.quantity}
                                onChange={(e) =>
                                  handlePackageChange(index, "quantity", parseInt(e.target.value))
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Length (cm)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={pkg.length}
                                onChange={(e) =>
                                  handlePackageChange(index, "length", parseFloat(e.target.value))
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Width (cm)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={pkg.width}
                                onChange={(e) =>
                                  handlePackageChange(index, "width", parseFloat(e.target.value))
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Height (cm)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={pkg.height}
                                onChange={(e) =>
                                  handlePackageChange(index, "height", parseFloat(e.target.value))
                                }
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (₹)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={typeof pkg.price === 'number' ? pkg.price : 0}
                                onChange={e => handlePackageChange(index, "price", parseFloat(e.target.value))}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Shipment Details Section */}
                  <div className="border border-blue-100 p-4 rounded-xl bg-blue-50/50 section">
                    <h4 className="font-medium text-gray-700 mb-3 section-title">
                      Shipment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
                        <div className="w-full md:w-1/2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shipment ID
                          </label>
                          <input
                            type="text"
                            value={form.readableShipmentId || ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                readableShipmentId: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                            required
                          />
                          <span className="text-xs text-gray-500">
                            Shipment id
                          </span>
                        </div>
                        <div className="w-full md:w-1/2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Delivery Date
                          </label>
                          <input
                            type="date"
                            value={form.deliveryDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                deliveryDate: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                            required
                          />
                          <span className="text-xs text-gray-500">
                            Estimated Delivery Date must be today or later.
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, status: e.target.value }))
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Pending">Pending</option>
                          <option value="Pre-Transit">Pre-Transit</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Failed Attempt">Failed Attempt</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Lost/Damaged">Lost/Damaged</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shipping Method
                        </label>
                        <select
                          value={form.shippingMethod}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              shippingMethod: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Express">Express</option>
                          <option value="Overnight">Overnight</option>
                          <option value="Freight">Freight</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={form.notes || ""}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, notes: e.target.value }))
                          }
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* End printRef content */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-blue-200 rounded-lg text-blue-700 bg-white hover:bg-blue-50 font-semibold shadow-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
