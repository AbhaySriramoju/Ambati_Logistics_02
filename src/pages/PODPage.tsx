import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Hardcoded shipment data for demo
const MOCK_SHIPMENT = {
  tracking_number: "1234567890",
  recipient_name: "John Doe",
  delivery_address: "123 Main St, Cityville, State, 123456, Country",
  shipping_method: "Express",
  expected_delivery_date: "2025-07-20",
};

const PODPage = () => {
  const [session, setSession] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deliveryOutcome, setDeliveryOutcome] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for session
    const sess = localStorage.getItem("pod_session");
    if (!sess) {
      navigate("/pod-login");
    } else {
      setSession(JSON.parse(sess));
    }
  }, [navigate]);

  // Simulate shipment fetch
  const handleFetchShipment = async () => {
    setError("");
    setSuccess("");
    setShipment(null);
    // Fetch shipment directly from shipments table using tracking_number
    const { data: shipmentData, error: shipmentError } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", trackingNumber)
      .single();
    if (shipmentError || !shipmentData) {
      setError("Tracking number not found or already delivered.");
      return;
    }
    setShipment(shipmentData);
  };

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo, just preview, no compression
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!shipment) {
      setError("Please enter a valid tracking number and fetch shipment.");
      return;
    }
    if (!deliveryOutcome) {
      setError("Please select a delivery outcome.");
      return;
    }
    if (deliveryOutcome === "Delivered" && !image) {
      setError("Please upload a delivery photo for Delivered status.");
      return;
    }
    if (
      (deliveryOutcome === "Failed Attempt" || deliveryOutcome === "Returned") &&
      !notes
    ) {
      setError("Please enter delivery notes for this outcome.");
      return;
    }

    try {
      // Get shipment by tracking number
      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .select("id")
        .eq("tracking_number", trackingNumber)
        .single();
      if (shipmentError || !shipmentData) {
        setError("Shipment not found.");
        return;
      }
      const shipmentId = shipmentData.id;

      let imageUrl = null;
      if (deliveryOutcome === "Delivered" && image) {
        // Upload image to Supabase Storage
        const fileExt = image.name.split(".").pop();
        const fileName = `pod_${shipmentId}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pod-images")
          .upload(fileName, image);
        if (uploadError) {
          setError("Image upload failed: " + uploadError.message);
          return;
        }
        imageUrl = supabase.storage
          .from("pod-images")
          .getPublicUrl(fileName).data.publicUrl;
        // Insert proof_of_delivery row
        const { error: insertError } = await supabase
          .from("proof_of_delivery")
          .insert({
            shipment_id: shipmentId,
            image_url: imageUrl,
            notes: notes || null,
          });
        if (insertError) {
          setError("Failed to save proof: " + insertError.message);
          return;
        }
        // Update shipment status to Delivered
        const { error: updateError } = await supabase
          .from("shipments")
          .update({
            status: "Delivered",
            delivered_at: new Date().toISOString(),
            delivery_notes: notes || null,
          })
          .eq("id", shipmentId);
        if (updateError) {
          setError("Failed to update shipment: " + updateError.message);
          return;
        }
      } else if (deliveryOutcome === "Failed Attempt") {
        // Update shipment status to Failed Attempt
        const { error: updateError } = await supabase
          .from("shipments")
          .update({
            status: "Failed Attempt",
            delivery_notes: notes,
          })
          .eq("id", shipmentId);
        if (updateError) {
          setError("Failed to update shipment: " + updateError.message);
          return;
        }
      } else if (deliveryOutcome === "Returned") {
        // Update shipment status to Returned
        const { error: updateError } = await supabase
          .from("shipments")
          .update({
            status: "Returned",
            delivery_notes: notes,
            returned_at: new Date().toISOString(),
          })
          .eq("id", shipmentId);
        if (updateError) {
          setError("Failed to update shipment: " + updateError.message);
          return;
        }
      }
      setSuccess(
        `Proof of Delivery submitted successfully! Status: ${deliveryOutcome}`
      );
      setTrackingNumber("");
      setShipment(null);
      setImage(null);
      setImagePreview("");
      setNotes("");
      setDeliveryOutcome("");
    } catch (err: any) {
      setError("Unexpected error: " + (err.message || err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pod_session");
    navigate("/pod-login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-blue-100 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">Proof of Delivery</h2>
          <button
            onClick={handleLogout}
            className="text-sm text-blue-500 hover:underline"
          >
            Logout
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tracking number"
              />
              <button
                type="button"
                onClick={handleFetchShipment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700"
              >
                Fetch
              </button>
            </div>
          </div>
          {/* Section 2: Shipment Details */}
          {shipment && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="mb-1">
                <span className="font-medium">Recipient:</span>{" "}
                {shipment.to_name_or_company}
              </div>
              <div className="mb-1">
                <span className="font-medium">Address:</span>{" "}
                {shipment.to_street_address}
              </div>
              <div className="mb-1">
                <span className="font-medium">Shipping Method:</span>{" "}
                {shipment.shipping_method}
              </div>
              <div>
                <span className="font-medium">Expected Delivery:</span>{" "}
                {shipment.estimated_delivery_date}
              </div>
            </div>
          )}
          {/* Section 3: Upload Proof of Delivery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Delivery Photo
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-lg border"
                />
              </div>
            )}
          </div>
          {/* Section 4: Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Enter any notes about the delivery..."
            />
          </div>
          {/* Section 5: Delivery Outcome Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Outcome
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryOutcome"
                  value="Delivered"
                  checked={deliveryOutcome === "Delivered"}
                  onChange={() => setDeliveryOutcome("Delivered")}
                  className="mr-2"
                />
                Delivered
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryOutcome"
                  value="Failed Attempt"
                  checked={deliveryOutcome === "Failed Attempt"}
                  onChange={() => setDeliveryOutcome("Failed Attempt")}
                  className="mr-2"
                />
                Failed Attempt
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryOutcome"
                  value="Returned"
                  checked={deliveryOutcome === "Returned"}
                  onChange={() => setDeliveryOutcome("Returned")}
                  className="mr-2"
                />
                Returned
              </label>
            </div>
          </div>
          {/* Section 6: Submit */}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm font-semibold">
              {success}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition text-lg"
          >
            Submit POD
          </button>
        </form>
      </div>
    </div>
  );
};

export default PODPage;
