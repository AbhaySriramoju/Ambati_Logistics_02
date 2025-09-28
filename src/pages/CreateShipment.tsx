import React, { useState, useRef, useEffect } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CustomSelect from "../components/CustomSelect";
import Barcode from "react-barcode";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Shipping cost map
const shippingCosts: Record<string, number> = {
  Standard: 1000,
  Express: 2000,
  Overnight: 3000,
  Freight: 5000,
};

// GST and final amount constants
const GST_RATE = 0.18; // 18% GST
const MAX_PRICE = 100000000; // ₹10 crore

interface Address {
  name: string;
  street: string;
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
  value?: number;
  packageType: string;
}

interface Shipment {
  id: string;
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
  totalValue?: number;
}

// Utility to get current IST time in ISO format
// Utility to get IST time plus 12 hours in ISO format
function getCurrentISTISOString() {
  const now = new Date();
  // IST is UTC+5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 5.5 * 60 * 60 * 1000);
  // Format as 'YYYY-MM-DD HH:mm:ss+05:30' for IST
  const pad = (n) => n.toString().padStart(2, "0");
  const year = istTime.getFullYear();
  const month = pad(istTime.getMonth() + 1);
  const day = pad(istTime.getDate());
  const hour = pad(istTime.getHours());
  const min = pad(istTime.getMinutes());
  const sec = pad(istTime.getSeconds());
  // Add 12 hours to IST time
  istTime.setHours(istTime.getHours() + 12);
  const hour12 = pad(istTime.getHours());
  const min12 = pad(istTime.getMinutes());
  const sec12 = pad(istTime.getSeconds());
  const year12 = istTime.getFullYear();
  const month12 = pad(istTime.getMonth() + 1);
  const day12 = pad(istTime.getDate());
  return `${year12}-${month12}-${day12} ${hour12}:${min12}:${sec12}+05:30`;
}

const CreateShipment = () => {
  const navigate = useNavigate();
  // State for client code dropdown
  const [clientOptions, setClientOptions] = useState<{ id: number; client_code: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientFetchError, setClientFetchError] = useState<string | null>(null);
  // Add gst_amount and final_amount to form state
  const [form, setForm] = useState<any>({
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
        value: 0,
        packageType: "Box",
      },
    ],
    base_price: 0, // Add base_price to shipment form
    status: "Pending",
    pickupDate: new Date().toISOString().split("T")[0],
    shippingMethod: "Standard",
    totalWeight: 0,
    clientCode: "",
    gst_amount: 0,
    final_amount: 0,
  });

  // Fetch client codes using Supabase client
  useEffect(() => {
    let isMounted = true;
    setLoadingClients(true);
    setClientFetchError(null);
    import("../lib/supabaseClient").then(async (mod) => {
      try {
        // Optionally, you can get the user session if needed
        // const { data: { user } } = await mod.supabase.auth.getUser();
        const { data, error } = await mod.supabase
          .from("clients")
          .select("id, client_code");
        if (error) throw error;
        if (isMounted) setClientOptions(data || []);
      } catch (err: any) {
        if (isMounted) {
          setClientFetchError(err.message || "Failed to load client codes");
          setClientOptions([]);
        }
      } finally {
        if (isMounted) setLoadingClients(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Inline error state for each field
  const [errors, setErrors] = useState<{
    shipFrom?: Partial<Record<keyof Address, string>>;
    shipTo?: Partial<Record<keyof Address, string>>;
    packages?: Array<Partial<Record<keyof Package, string>>>;
  }>({});
  const [barcodeValue, setBarcodeValue] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Ensure trackingNumber is always present in form state
  React.useEffect(() => {
    if (
      !form.trackingNumber ||
      typeof form.trackingNumber !== "string" ||
      form.trackingNumber.trim() === ""
    ) {
      // Generate a numeric tracking number (timestamp-based, unique)
      setForm((prev) => ({
        ...prev,
        trackingNumber: `${Date.now()}`,
      }));
    }
  }, [form.trackingNumber]);

  const handleAddressChange = (
    type: "shipFrom" | "shipTo",
    field: keyof Address,
    value: string
  ) => {
    setForm((prev: any) => ({
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
    // Always recalculate base_price as the sum of all package values
    const newBasePrice = newPackages.reduce((sum, pkg) => sum + (pkg.value || 0), 0);
    setForm((prev) => ({
      ...prev,
      packages: newPackages,
      totalWeight: calculateTotalWeight(newPackages),
      base_price: newBasePrice,
    }));
  };

  const calculateTotalWeight = (packages: Package[]) => {
    return packages.reduce(
      (total, pkg) => total + pkg.weight * pkg.quantity,
      0
    );
  };

  const addPackage = () => {
    setForm((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          description: "",
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          quantity: 1,
          value: 0,
          packageType: "Box",
        },
      ],
    }));
  };

  const removePackage = (index: number) => {
    if (form.packages.length <= 1) return;
    const newPackages = form.packages.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      packages: newPackages,
      totalWeight: calculateTotalWeight(newPackages),
    }));
  };

  // Add error state for submission
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");

  // Calculate GST and final amount whenever base_price changes
  useEffect(() => {
    const gst = form.base_price * GST_RATE;
    const final = form.base_price + gst;
    setForm((prev: any) => ({
      ...prev,
      gst_amount: gst,
      final_amount: final,
    }));
  }, [form.base_price]);

  // Unified submit handler for create and edit
  const handleSubmit = async () => {
    setSubmitError(null); // Reset error before submit
    // ...existing validation code...
    const newErrors: {
      shipFrom?: Partial<Record<keyof Address, string>>;
      shipTo?: Partial<Record<keyof Address, string>>;
      packages?: Array<Partial<Record<keyof Package, string>>>;
    } = { shipFrom: {}, shipTo: {}, packages: [] };
    let hasError = false;
    // ...existing validation code...
    if (!form.shipFrom.name.trim()) {
      newErrors.shipFrom!.name = "Full Name or Company Name is required.";
      hasError = true;
    }
    if (!form.shipFrom.contactNumber.trim()) {
      newErrors.shipFrom!.contactNumber = "Contact Number is required.";
      hasError = true;
    } else if (!/^\d{10}$/.test(form.shipFrom.contactNumber.trim())) {
      newErrors.shipFrom!.contactNumber =
        "Contact Number must be exactly 10 digits.";
      hasError = true;
    }
    ["street", "city", "state", "postalCode", "country"].forEach((field) => {
      if (!(form.shipFrom as any)[field]?.trim()) {
        newErrors.shipFrom![field as keyof Address] = "This field is required.";
        hasError = true;
      }
    });
    if (!form.shipTo.name.trim()) {
      newErrors.shipTo!.name = "Full Name or Company Name is required.";
      hasError = true;
    }
    if (!form.shipTo.contactNumber.trim()) {
      newErrors.shipTo!.contactNumber = "Contact Number is required.";
      hasError = true;
    } else if (!/^\d{10}$/.test(form.shipTo.contactNumber.trim())) {
      newErrors.shipTo!.contactNumber =
        "Contact Number must be exactly 10 digits.";
      hasError = true;
    }
    ["street", "city", "state", "postalCode", "country"].forEach((field) => {
      if (!(form.shipTo as any)[field]?.trim()) {
        newErrors.shipTo![field as keyof Address] = "This field is required.";
        hasError = true;
      }
    });
    if (form.packages.length === 0) {
      newErrors.packages = [
        { description: "At least one package is required." },
      ];
      hasError = true;
    } else {
      newErrors.packages = form.packages.map((pkg) => {
        const pkgErrors: Partial<Record<keyof Package, string>> = {};
        if (!pkg.description.trim()) {
          pkgErrors.description = "Description is required.";
          hasError = true;
        }
        if (!pkg.weight || pkg.weight <= 0) {
          pkgErrors.weight = "Weight must be greater than 0.";
          hasError = true;
        }
        if (!pkg.quantity || pkg.quantity <= 0) {
          pkgErrors.quantity = "Quantity must be greater than 0.";
          hasError = true;
        }
        return pkgErrors;
      });
    }
    setErrors(newErrors);
    if (hasError) return;

    // Always send a unique tracking_number (numbers only)
    const trackingNumberToSend =
      typeof form.trackingNumber === "string" &&
      form.trackingNumber.trim() !== ""
        ? form.trackingNumber.replace(/\D/g, "") || `${Date.now()}`
        : `${Date.now()}`;
    // Get current user for user_id (if column exists in DB)
    let user_id = undefined;
    try {
      const { data: { user } } = await import("../lib/supabaseClient").then(mod => mod.supabase.auth.getUser());
      user_id = user?.id;
    } catch {}

    function nullIfEmpty(val: any): any {
      return val === undefined || val === null || val === "" ? null : val;
    }

    // Prevent overflow: base_price must not exceed MAX_PRICE
    if (form.base_price > MAX_PRICE) {
      setErrorModalMsg("Base price cannot exceed ₹10,00,00,000 (₹10 crore). Please adjust package prices.");
      setShowErrorModal(true);
      return;
    }

    // If editing (form.id exists), call update endpoint
    if (form.id) {
      // Prepare packages for backend
      const packagesPayload = form.packages.map(pkg => ({
        description: pkg.description,
        package_type: pkg.packageType,
        weight: pkg.weight,
        quantity: pkg.quantity,
        length: pkg.length,
        width: pkg.width,
        height: pkg.height,
        price: pkg.value,
      }));
      // Use 'id' instead of 'shipment_id' for the main shipment key
      const shipmentData = {
        id: form.id, // <-- changed from shipment_id
        status: nullIfEmpty(form.status),
        shipping_method: nullIfEmpty(form.shippingMethod),
        notes: nullIfEmpty(form.notes),
        create_date: nullIfEmpty(form.pickupDate),
        estimated_delivery_date: nullIfEmpty(form.deliveryDate),
        delivered_at: null, // You can set this if needed
        base_price: form.base_price,
        gst_amount: form.gst_amount,
        final_amount: form.final_amount,
        from_name_or_company: nullIfEmpty(form.shipFrom.name),
        from_contact_number: nullIfEmpty(form.shipFrom.contactNumber),
        from_email: nullIfEmpty(form.shipFrom.email),
        from_street_address: nullIfEmpty(form.shipFrom.street),
        from_city: nullIfEmpty(form.shipFrom.city),
        from_state: nullIfEmpty(form.shipFrom.state),
        from_postal_code: nullIfEmpty(form.shipFrom.postalCode),
        from_country: nullIfEmpty(form.shipFrom.country),
        to_name_or_company: nullIfEmpty(form.shipTo.name),
        to_contact_number: nullIfEmpty(form.shipTo.contactNumber),
        to_email: nullIfEmpty(form.shipTo.email),
        to_street_address: nullIfEmpty(form.shipTo.street),
        to_city: nullIfEmpty(form.shipTo.city),
        to_state: nullIfEmpty(form.shipTo.state),
        to_postal_code: nullIfEmpty(form.shipTo.postalCode),
        to_country: nullIfEmpty(form.shipTo.country),
        packages: packagesPayload,
      };
      // Call edge function
      const token = localStorage.getItem("sb-access-token");
      const response = await fetch(`/shipment-update/${form.id}`, {
        method: "PUT",
        headers:
         {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(shipmentData),
      });
      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = { error: 'Invalid JSON response' };
      }
      // Debug: log response and result
      console.log('Update shipment response:', response);
      console.log('Update shipment result:', result);
      if (!response.ok) {
        let msg = result.error || "Failed to update shipment.";
        if (
          msg.includes("violates check constraint") ||
          msg.includes("shipments_price_check")
        ) {
          msg = "Please, Enter the price.";
        }
        setSubmitError(msg);
        return;
      }
      setBarcodeValue(form.id);
      setErrors({});
      navigate("/dashboard");
      return;
    }

    // Otherwise, create new shipment (existing logic)
    const shipmentData = {
      status: nullIfEmpty(form.status),
      shipping_method: nullIfEmpty(form.shippingMethod),
      notes: nullIfEmpty(form.notes),
      estimated_delivery_date: nullIfEmpty(form.deliveryDate),
      from_name_or_company: nullIfEmpty(form.shipFrom.name),
      from_contact_number: nullIfEmpty(form.shipFrom.contactNumber),
      from_email: nullIfEmpty(form.shipFrom.email),
      from_street_address: nullIfEmpty(form.shipFrom.street),
      from_city: nullIfEmpty(form.shipFrom.city),
      from_state: nullIfEmpty(form.shipFrom.state),
      from_postal_code: nullIfEmpty(form.shipFrom.postalCode),
      from_country: nullIfEmpty(form.shipFrom.country),
      to_name_or_company: nullIfEmpty(form.shipTo.name),
      to_contact_number: nullIfEmpty(form.shipTo.contactNumber),
      to_email: nullIfEmpty(form.shipTo.email),
      to_street_address: nullIfEmpty(form.shipTo.street),
      to_city: nullIfEmpty(form.shipTo.city),
      to_state: nullIfEmpty(form.shipTo.state),
      to_postal_code: nullIfEmpty(form.shipTo.postalCode),
      to_country: nullIfEmpty(form.shipTo.country),
      tracking_number: trackingNumberToSend,
      total_weight: form.totalWeight,
      client_code: nullIfEmpty(form.clientCode),
      created_at: getCurrentISTISOString(),
      ...(user_id ? { user_id } : {}),
      base_price: form.base_price,
      gst_amount: form.gst_amount,
      final_amount: form.final_amount,
    };
    // Debug: log data before sending
    console.log("shipmentData", shipmentData);
    const { data: shipment, error: shipmentError } = await import(
      "../lib/supabaseClient"
    ).then((mod) =>
      mod.supabase.from("shipments").insert([shipmentData]).select().single()
    );
    if (shipmentError) {
      let msg = shipmentError.message || "Failed to create shipment.";
      if (
        msg.includes("violates check constraint") ||
        msg.includes("shipments_price_check")
      ) {
        // Remove price mandatory error
        msg = shipmentError.message || "Failed to create shipment.";
      }
      setSubmitError(msg);
      return;
    }
    if (form.packages.length > 0) {
      const formattedPackages = form.packages.map((pkg) => ({
        shipment_id: shipment.id,
        item_name: nullIfEmpty(pkg.description) || "Package",
        description: nullIfEmpty(pkg.description),
        package_type: nullIfEmpty(pkg.packageType),
        weight_kg:
          typeof pkg.weight === "number" && pkg.weight > 0 ? pkg.weight : null,
        quantity:
          typeof pkg.quantity === "number" && pkg.quantity > 0
            ? pkg.quantity
            : null,
        length_cm:
          typeof pkg.length === "number" && pkg.length > 0 ? pkg.length : null,
        width_cm:
          typeof pkg.width === "number" && pkg.width > 0 ? pkg.width : null,
        height_cm:
          typeof pkg.height === "number" && pkg.height > 0 ? pkg.height : null,
        price_inr:
          typeof pkg.price === "number" && pkg.price > 0 ? pkg.price : null, // ✅ FIXED
      }));

      // Debug: log packages before sending
      // console.log("formattedPackages", formattedPackages);
      const { error: packageError } = await import(
        "../lib/supabaseClient"
      ).then((mod) =>
        mod.supabase.from("shipment_items").insert(formattedPackages)
      );
      if (packageError) {
        let msg = packageError.message || "Failed to add packages.";
        setSubmitError(msg);
        return;
      }
    }
    setBarcodeValue(shipment.id);
    setErrors({});
    navigate("/dashboard");
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 mt-6 sticky top-20 z-50 self-start inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition"
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
      <div className="bg-white rounded-2xl w-full max-w-2xl p-10 space-y-8 mt-12 mb-12 shadow-2xl border border-blue-100">
        {/* Show submit error above form */}
        {submitError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg p-3 font-semibold">
            {submitError}
          </div>
        )}
        {/* Client Code Dropdown (dynamic, always present) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Code <span className="text-red-500">*</span>
          </label>
          <select
            value={form.clientCode}
            onChange={e => setForm({ ...form, clientCode: e.target.value })}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loadingClients || !!clientFetchError}
          >
            <option value="">{loadingClients ? "Loading..." : clientFetchError ? "Failed to load client codes" : "Select Client Code"}</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.client_code}>{client.client_code}</option>
            ))}
          </select>
          {form.clientCode === "" && !loadingClients && !clientFetchError && (
            <div className="text-red-500 text-xs mt-1 flex items-center">
              <WarningAmberIcon fontSize="small" className="mr-1 text-yellow-500" />
              Client code is required.
            </div>
          )}
          {clientFetchError && (
            <div className="text-red-500 text-xs mt-1 flex items-center">
              <WarningAmberIcon fontSize="small" className="mr-1 text-yellow-500" />
              {clientFetchError}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16V8a2 2 0 012-2h2l2-3h6l2 3h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">
            Create Shipment
          </h3>
          <p className="text-gray-500 text-base">
            Fill in the details below to create a new shipment order.
          </p>
        </div>
        {/* Ship From Section */}
        <div className="border border-blue-100 p-6 rounded-xl bg-blue-50/50">
          <h4 className="font-medium text-gray-700 mb-3">Ship From</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name or Company Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.shipFrom.name}
                onChange={(e) =>
                  handleAddressChange("shipFrom", "name", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.shipFrom?.name && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.name}
                </div>
              )}
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipFrom?.contactNumber && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.contactNumber}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={form.shipFrom.street}
                onChange={(e) =>
                  handleAddressChange("shipFrom", "street", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipFrom?.street && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.street}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.shipFrom.email}
                onChange={(e) =>
                  handleAddressChange("shipFrom", "email", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  handleAddressChange("shipFrom", "city", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipFrom?.city && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.city}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                value={form.shipFrom.state}
                onChange={(e) =>
                  handleAddressChange("shipFrom", "state", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipFrom?.state && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.state}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={form.shipFrom.postalCode}
                onChange={(e) =>
                  handleAddressChange("shipFrom", "postalCode", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipFrom?.postalCode && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.postalCode}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={form.shipFrom.country}
                onChange={(e) =>
                  handleAddressChange("shipFrom", "country", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipFrom?.country && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipFrom.country}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Ship To Section */}
        <div className="border border-blue-100 p-6 rounded-xl bg-blue-50/50">
          <h4 className="font-medium text-gray-700 mb-3">Ship To</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name or Company Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.shipTo.name}
                onChange={(e) =>
                  handleAddressChange("shipTo", "name", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.shipTo?.name && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={form.shipTo.contactNumber}
                onChange={(e) =>
                  handleAddressChange("shipTo", "contactNumber", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipTo?.contactNumber && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.contactNumber}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={form.shipTo.street}
                onChange={(e) =>
                  handleAddressChange("shipTo", "street", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipTo?.street && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.street}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.shipTo.email}
                onChange={(e) =>
                  handleAddressChange("shipTo", "email", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  handleAddressChange("shipTo", "city", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipTo?.city && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.city}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                value={form.shipTo.state}
                onChange={(e) =>
                  handleAddressChange("shipTo", "state", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipTo?.state && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.state}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={form.shipTo.postalCode}
                onChange={(e) =>
                  handleAddressChange("shipTo", "postalCode", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipTo?.postalCode && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.postalCode}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={form.shipTo.country}
                onChange={(e) =>
                  handleAddressChange("shipTo", "country", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shipTo?.country && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    className="mr-1 text-yellow-500"
                  />
                  {errors.shipTo.country}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Packages Section */}
        <div className="border border-blue-100 p-6 rounded-xl bg-blue-50/50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">Packages</h4>
            {/* <button
            onClick={addPackage}
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add Package
          </button> */}
          </div>
          {form.packages.map((pkg, index) => (
            <div
              key={index}
              className="mb-4 last:mb-0 border-b pb-4 last:border-b-0"
            >
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium text-gray-600">
                  Package {index + 1}
                </h5>
                {form.packages.length > 1 && (
                  <button
                    onClick={() => removePackage(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.packages?.[index]?.description && (
                    <div className="text-red-500 text-xs mt-1 flex items-center">
                      <WarningAmberIcon
                        fontSize="small"
                        className="mr-1 text-yellow-500"
                      />
                      {errors.packages[index]?.description}
                    </div>
                  )}
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      handlePackageChange(
                        index,
                        "weight",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.packages?.[index]?.weight && (
                    <div className="text-red-500 text-xs mt-1 flex items-center">
                      <WarningAmberIcon
                        fontSize="small"
                        className="mr-1 text-yellow-500"
                      />
                      {errors.packages[index]?.weight}
                    </div>
                  )}
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
                      handlePackageChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.packages?.[index]?.quantity && (
                    <div className="text-red-500 text-xs mt-1 flex items-center">
                      <WarningAmberIcon
                        fontSize="small"
                        className="mr-1 text-yellow-500"
                      />
                      {errors.packages[index]?.quantity}
                    </div>
                  )}
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
                      handlePackageChange(
                        index,
                        "length",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      handlePackageChange(
                        index,
                        "width",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      handlePackageChange(
                        index,
                        "height",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={pkg.value}
                    onChange={(e) =>
                      handlePackageChange(
                        index,
                        "value",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          {/* Show error if no packages or top-level package error */}
          {errors.packages &&
            errors.packages[0]?.description &&
            form.packages.length === 0 && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <WarningAmberIcon
                  fontSize="small"
                  className="mr-1 text-yellow-500"
                />
                {errors.packages[0].description}
              </div>
            )}
          {/* <div className="mt-3">
            <span className="text-sm font-medium">
              Total Weight: {form.totalWeight} kg
            </span>
          </div> */}
        </div>
        {/* Shipment Details Section */}
        <div className="border border-blue-100 p-6 rounded-xl bg-blue-50/50">
          <h4 className="font-medium text-gray-700 mb-3">Shipment Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Only show Shipment ID field if editing (form.id exists) */}
            {form.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID</label>
                <input
                  type="text"
                  value={form.id}
                  readOnly
                  disabled
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  tabIndex={-1}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <CustomSelect
                options={[
                  "Order Placed",
                  "Pending",
                  "Pre-Transit",
                  "In Transit",
                  "Out for Delivery",
                  "Delivered",
                  "Failed Attempt",
                  "Delayed",
                  "Lost/Damaged",
                  "Returned",
                  "Cancelled",
                  "Other",
                ]}
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Method
              </label>
              <select
                value={form.shippingMethod}
                onChange={(e) =>
                  setForm({ ...form, shippingMethod: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Method</option>
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
                <option value="Overnight">Overnight</option>
                <option value="Freight">Freight</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.pickupDate}
                onChange={(e) =>
                  setForm({ ...form, pickupDate: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date (Estimated)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.deliveryDate || ""}
                onChange={(e) =>
                  setForm({ ...form, deliveryDate: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 border border-blue-200 rounded-lg text-blue-700 bg-white hover:bg-blue-50 font-semibold shadow-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition"
          >
            Save
          </button>
        </div>
        {/* Barcode and Print Section */}
        {barcodeValue && (
          <div className="mt-10 border-t pt-8">
            <div className="flex flex-col items-center">
              <div id="shipment-print-area" className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl border border-blue-200">
                <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">Shipment Details</h2>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Shipment ID: <span className="text-blue-700">{form.id || barcodeValue}</span></div>
                    {/* Shipment ID is view-only, not editable */}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Status: <span className="text-blue-700">{form.status}</span></div>
                    <div className="font-semibold text-gray-700 mb-1">Client Code: <span className="text-blue-700">{form.clientCode}</span></div>
                    <div className="font-semibold text-gray-700 mb-1">Tracking #: <span className="text-blue-700">{form.trackingNumber || "N/A"}</span></div>
                  </div>
                </div>
                <div className="mb-6 flex flex-col items-center">
                  <Barcode value={barcodeValue} />
                </div>
                <table className="min-w-full text-sm text-left border rounded-lg mb-4">
                  <thead className="bg-blue-50 text-blue-700 font-bold">
                    <tr>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Weight (kg)</th>
                      <th className="px-4 py-2">Dimensions (cm)</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.packages.map((pkg: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{pkg.description}</td>
                        <td className="px-4 py-2">{pkg.packageType}</td>
                        <td className="px-4 py-2">{pkg.weight}</td>
                        <td className="px-4 py-2">{pkg.length} x {pkg.width} x {pkg.height}</td>
                        <td className="px-4 py-2">{pkg.quantity}</td>
                        <td className="px-4 py-2">₹{(pkg.value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* GST and Total Amount Section */}
                {(() => {
                  const gstRate = 0.18; // 18% GST
                  const basePrice = form.base_price || 0;
                  const gstAmount = basePrice * gstRate;
                  const totalAmount = basePrice + gstAmount;
                  return (
                    <div className="mt-2 text-right">
                      <div className="font-semibold text-blue-900">GST (18%): <span className="text-blue-700">₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                      <div className="font-bold text-lg text-blue-900">Total Amount: <span className="text-blue-700">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                    </div>
                  );
                })()}
              </div>
              <button
                onClick={() => {
                  const printContents = document.getElementById("shipment-print-area")?.innerHTML;
                  const printWindow = window.open("", "", "width=900,height=700");
                  if (printWindow && printContents) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Print Shipment</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            h2 { color: #2563eb; }
                            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                            th, td { border: 1px solid #ccc; padding: 8px; }
                            th { background: #e3f0ff; }
                            .section { margin-bottom: 24px; }
                          </style>
                        </head>
                        <body>${printContents}</body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }
                }}
                className="mt-6 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg w-full transition"
              >
                Print Shipment
              </button>
            </div>
          </div>
        )}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-red-400 relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setShowErrorModal(false)}>&times;</button>
              <h3 className="text-xl font-bold text-red-700 mb-4">Error</h3>
              <div className="mb-4 text-red-700 font-semibold">{errorModalMsg}</div>
              <div className="flex justify-end">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow transition text-lg" onClick={() => setShowErrorModal(false)}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;
