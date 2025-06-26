import React, { useRef, useState } from "react";
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
  // Box
} from "lucide-react";
import { Link } from "react-router-dom";
import Barcode from "react-barcode";
import SidebarItem from "../components/SidebarItem";
import Card from "../components/Card";
import CustomSelect from "../components/CustomSelect";

const Dashboard = () => {
  const [shipments, setShipments] = useState([
    {
      id: "SHP001",
      origin: "New York",
      destination: "Los Angeles",
      status: "In Transit",
      date: "2025-06-10",
    },
    {
      id: "SHP002",
      origin: "Chicago",
      destination: "Houston",
      status: "Delivered",
      date: "2025-06-09",
    },
    {
      id: "SHP003",
      origin: "Delhi",
      destination: "Mumbai",
      status: "Pending",
      date: "2025-06-11",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    status: "Pending",
    date: "",
  });
  const [barcodeValue, setBarcodeValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore event handlers
    }
  };

  const openCreateModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setForm({ origin: "", destination: "", status: "Pending", date: "" });
    setBarcodeValue("");
  };

  const openEditModal = (shipment: any, index: number) => {
    setShowModal(true);
    setIsEditing(true);
    setEditingIndex(index);
    setForm({
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      date: shipment.date,
    });
    setBarcodeValue(shipment.id);
  };

  const handleSubmit = () => {
    if (isEditing && editingIndex !== null) {
      const updated = [...shipments];
      updated[editingIndex] = { ...updated[editingIndex], ...form };
      setShipments(updated);
    } else {
      const id = `SHP${Math.floor(Math.random() * 90000 + 10000)}`;
      const newShipment = { id, ...form };
      setShipments([newShipment, ...shipments]);
      setBarcodeValue(id);
    }
    setShowModal(false);
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
            <SidebarItem icon={<Truck />} label="Shipments" />
          </div>
          <div>
            <SidebarItem icon={<Package />} label="Packages" />
          </div>
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
          <div>
            <SidebarItem icon={<Settings />} label="Settings" />
          </div>
        </nav>

        <button className="flex items-center text-red-500 hover:text-red-700 mt-10">
          <LogOut className="mr-2" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Welcome, Admin</h2>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Shipment</span>
          </button>
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
            value="87"
          />
          <Card
            icon={<Users className="text-purple-600" />}
            title="Registered Clients"
            value="42"
          />
        </div>

        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Recent Shipments
          </h3>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Shipment ID</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((ship, index) => (
                  <tr
                    key={ship.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{ship.id}</td>
                    <td className="px-4 py-3">{ship.origin}</td>
                    <td className="px-4 py-3">{ship.destination}</td>
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
                    <td className="px-4 py-3">{ship.date}</td>
                    <td className="px-4 py-3">
                      {ship.status === "In Transit" && (
                        <button
                          onClick={() => openEditModal(ship, index)}
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4 mt-10 mb-10 relative z-50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Edit Shipment" : "Create Shipment"}
            </h3>
            <input
              type="text"
              name="origin"
              placeholder="Origin"
              value={form.origin}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="destination"
              placeholder="Destination"
              value={form.destination}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CustomSelect
              options={["Pending", "In Transit", "Delivered"]}
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value })}
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition"
            >
              Finalize Shipment
            </button>
            {barcodeValue && (
              <>
                <div className="mt-4 text-center" ref={printRef}>
                  <h4 className="text-lg font-semibold mb-2">
                    Shipment Summary
                  </h4>
                  <p>
                    <strong>Shipment ID:</strong>
                  </p>
                  <div className="flex justify-center my-2">
                    <Barcode value={barcodeValue} />
                  </div>
                  <p>
                    <strong>From:</strong> {form.origin}
                  </p>
                  <p>
                    <strong>To:</strong> {form.destination}
                  </p>
                  <p>
                    <strong>Date:</strong> {form.date}
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="mt-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg w-full transition"
                >
                  Print Shipment
                </button>
              </>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-black text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
