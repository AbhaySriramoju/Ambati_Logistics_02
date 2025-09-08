import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { Package } from "lucide-react";

export default function Track() {
  const [trackingInput, setTrackingInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleTrack = () => {
    if (trackingInput.trim()) {
      navigate(`/user-tracking/${encodeURIComponent(trackingInput.trim())}`);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md text-center">
        <Package className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-6">Track Your Shipment</h2>
        <p className="text-gray-600 mb-8">
          Enter your tracking number to get real-time updates on your shipment's
          location and status.
        </p>
        <input
          type="text"
          value={trackingInput}
          onChange={(e) => setTrackingInput(e.target.value)}
          placeholder="Enter tracking number or phone number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="space-y-4">
          <button
            onClick={handleTrack}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Track Shipment
          </button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="text-center">
            <Package className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              Please enter a tracking or phone number!
            </h2>
            <p className="text-gray-600">
              You must enter a valid tracking number or phone number to track
              your shipment.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
