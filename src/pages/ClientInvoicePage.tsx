import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Types
interface PendingShipment {
  id: string;
  shipment_id: string;
  client_code: string;
  created_at: string;
  // base_price: number; // Removed because column does not exist
  gst_amount: number;
  final_amount: number;
  invoice_status: string;
}
interface RaisedInvoice {
  id: string;
  invoice_number: string;
  client_code: string;
  invoice_date: string;
  total_amount: number;
  status: string;
  shipments: PendingShipment[];
}

const ClientInvoicePage: React.FC = () => {
  // State
  const [clientCode, setClientCode] = useState("");
  const [pendingShipments, setPendingShipments] = useState<PendingShipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [totals, setTotals] = useState({ base: 0, gst: 0, grand: 0 });
  const [raisedInvoices, setRaisedInvoices] = useState<RaisedInvoice[]>([]);
  const [viewMode, setViewMode] = useState<"pending" | "raised">("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<null | { clientCode: string; shipments: PendingShipment[]; totals: typeof totals }>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState<RaisedInvoice | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectAll, setSelectAll] = useState(true);

  // Fetch pending shipments
  const fetchPendingShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("id, shipment_id, client_code, created_at, gst_amount, final_amount, invoice_status")
        .ilike("client_code", clientCode.trim())
        .order("created_at", { ascending: true });
      if (error) throw error;
      setPendingShipments(data || []);
      setSelectedShipments((data || []).map((s: any) => s.id));
      setSelectAll(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch shipments");
      setPendingShipments([]);
      setSelectedShipments([]);
    }
    setLoading(false);
  };

  // Fetch raised invoices
  const fetchRaisedInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, client_code, invoice_date, total_amount, status, shipments:shipments(*)")
        .ilike("client_code", clientCode)
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      setRaisedInvoices(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invoices");
      setRaisedInvoices([]);
    }
    setLoading(false);
  };

  // Totals calculation
  useEffect(() => {
    // No price/gst/total columns, so just count shipments and sum total_weight as a placeholder
    const base = 0;
    const gst = 0;
    const grand = 0;
    setTotals({ base, gst, grand });
  }, [pendingShipments, selectedShipments]);

  // Handlers
  const handleSearch = () => {
    if (!clientCode) {
      setError("Please enter a client code.");
      return;
    }
    setViewMode("pending");
    fetchPendingShipments();
    fetchRaisedInvoices();
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedShipments(checked ? pendingShipments.map((s) => s.id) : []);
  };

  const handleSelectShipment = (id: string, checked: boolean) => {
    setSelectedShipments((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  const handlePreview = () => {
    const selected = pendingShipments.filter((s) => selectedShipments.includes(s.id));
    setPreviewData({ clientCode, shipments: selected, totals });
    setShowPreview(true);
  };

  const handleRaiseInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get latest invoice number for this client
      const { data: lastInvoice, error: lastError } = await supabase
        .from("invoices")
        .select("invoice_number")
        .ilike("client_code", clientCode)
        .order("invoice_number", { ascending: false })
        .limit(1);
      if (lastError) throw lastError;
      let nextNumber = 1;
      if (lastInvoice && lastInvoice.length > 0) {
        const lastNum = lastInvoice[0].invoice_number.split("-").pop();
        nextNumber = parseInt(lastNum, 10) + 1;
      }
      const invoiceNumber = `${clientCode}-${String(nextNumber).padStart(4, "0")}`;
      // 2. Create invoice record
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          client_code: clientCode,
          invoice_date: new Date().toISOString().slice(0, 10),
          total_amount: totals.grand,
          status: "raised",
        })
        .select();
      if (invoiceError) throw invoiceError;
      const invoiceId = invoiceData[0].id;
      // 3. Link shipments to invoice
      const { error: updateError } = await supabase
        .from("shipments")
        .update({ invoice_id: invoiceId, invoice_status: "raised" })
        .in("id", selectedShipments);
      if (updateError) throw updateError;
      setToast({ type: "success", message: `Invoice ${invoiceNumber} raised successfully!` });
      setShowPreview(false);
      fetchPendingShipments();
      fetchRaisedInvoices();
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to raise invoice." });
    }
    setLoading(false);
  };

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl p-6 shadow-2xl border border-blue-100 mt-12 mb-12">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">Client Invoices</h2>
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Code</label>
            <input
              type="text"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={clientCode}
              onChange={e => setClientCode(e.target.value)}
              placeholder="e.g. P120"
            />
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition text-lg"
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition ${viewMode === "pending" ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-500 bg-transparent"}`}
            onClick={() => setViewMode("pending")}
          >Pending Shipments</button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition ${viewMode === "raised" ? "border-blue-600 text-blue-700 bg-blue-50" : "border-transparent text-gray-500 bg-transparent"}`}
            onClick={() => setViewMode("raised")}
          >Raised Invoices</button>
        </div>
        {/* Pending Shipments Table */}
        {viewMode === "pending" && (
          <>
            {loading ? (
              <div className="text-center text-blue-500 py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left whitespace-nowrap border rounded-lg mb-4">
                    <thead className="bg-blue-50 text-blue-700 font-bold">
                      <tr>
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={e => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th className="px-4 py-3">Shipment ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Base Price</th>
                        <th className="px-4 py-3">GST Amount</th>
                        <th className="px-4 py-3">Final Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingShipments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-gray-400 py-8 bg-blue-50">No pending shipments found.</td>
                        </tr>
                      ) : (
                        pendingShipments.map((ship) => (
                          <tr key={ship.id} className={`border-b ${selectedShipments.includes(ship.id) ? "bg-blue-50" : "hover:bg-gray-50"} transition`}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedShipments.includes(ship.id)}
                                onChange={e => handleSelectShipment(ship.id, e.target.checked)}
                              />
                            </td>
                            <td className="px-4 py-3 font-mono">{ship.shipment_id || ship.id.slice(0, 8)}</td>
                            <td className="px-4 py-3">{new Date(ship.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                            <td className="px-4 py-3">N/A</td>
                            <td className="px-4 py-3">₹{ship.gst_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00"}</td>
                            <td className="px-4 py-3">₹{ship.final_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00"}</td>
                            <td className="px-4 py-3">{ship.invoice_status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Totals Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="font-semibold text-gray-700">Total Shipments Selected: <span className="text-blue-700">{selectedShipments.length}</span></div>
                  <div className="font-semibold text-gray-700">Total Base Price: <span className="text-blue-700">₹0.00</span></div>
                  <div className="font-semibold text-gray-700">Total GST: <span className="text-blue-700">₹0.00</span></div>
                  <div className="font-bold text-lg text-blue-900">Grand Total: <span className="text-blue-700">₹0.00</span></div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-4 mb-2">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold shadow transition text-lg"
                    onClick={() => { setSelectedShipments([]); setSelectAll(false); }}
                  >Cancel</button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition text-lg"
                    onClick={handlePreview}
                    disabled={selectedShipments.length === 0 || loading}
                  >Preview Invoice</button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition text-lg"
                    onClick={handleRaiseInvoice}
                    disabled={selectedShipments.length === 0 || loading}
                  >Raise Invoice</button>
                </div>
              </>
            )}
            {/* Preview Modal */}
            {showPreview && previewData && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-blue-200 relative">
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl" onClick={() => setShowPreview(false)}>&times;</button>
                  <h3 className="text-2xl font-bold text-blue-700 mb-4">Invoice Preview</h3>
                  <div className="mb-2 text-gray-700">Client Code: <span className="font-semibold">{previewData.clientCode}</span></div>
                  <div className="mb-4 text-gray-700">Shipments: <span className="font-semibold">{previewData.shipments.length}</span></div>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm text-left border rounded-lg">
                      <thead className="bg-blue-50 text-blue-700 font-bold">
                        <tr>
                          <th className="px-4 py-2">Shipment ID</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Base Price</th>
                          <th className="px-4 py-2">GST Amount</th>
                          <th className="px-4 py-2">Final Amount</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.shipments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-gray-400 py-8 bg-blue-50">No pending shipments found.</td>
                          </tr>
                        ) : (
                          previewData.shipments.map((ship) => (
                            <tr key={ship.id}>
                              <td className="px-4 py-2 font-mono">{ship.shipment_id || ship.id.slice(0, 8)}</td>
                          <td className="px-4 py-2">{new Date(ship.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                              <td className="px-4 py-2">N/A</td>
                              <td className="px-4 py-2">₹{ship.gst_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00"}</td>
                              <td className="px-4 py-2">₹{ship.final_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00"}</td>
                              <td className="px-4 py-2">{ship.invoice_status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="font-semibold text-gray-700">Total Shipments Selected: <span className="text-blue-700">{previewData.shipments.length}</span></div>
                    <div className="font-semibold text-gray-700">Total Base Price: <span className="text-blue-700">₹0.00</span></div>
                    <div className="font-semibold text-gray-700">Total GST: <span className="text-blue-700">₹0.00</span></div>
                    <div className="font-bold text-lg text-blue-900">Grand Total: <span className="text-blue-700">₹0.00</span></div>
                  </div>
                  <div className="flex gap-4 mt-6 justify-end">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition text-lg"
                      onClick={handleRaiseInvoice}
                      disabled={loading}
                    >Raise Invoice</button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold shadow transition text-lg"
                      onClick={() => setShowPreview(false)}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Raised Invoices Table */}
        {viewMode === "raised" && (
          <>
            {loading ? (
              <div className="text-center text-blue-500 py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : raisedInvoices.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No invoices found for this client/month.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left whitespace-nowrap border rounded-lg mb-4">
                  <thead className="bg-blue-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Invoice Number</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raisedInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-mono">{inv.invoice_number}</td>
                        <td className="px-4 py-3">{new Date(inv.invoice_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                        <td className="px-4 py-3">₹{inv.total_amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">{inv.status}</td>
                        <td className="px-4 py-3">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
                            onClick={() => { setInvoiceModalData(inv); setShowInvoiceModal(true); }}
                          >View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Invoice Modal */}
            {showInvoiceModal && invoiceModalData && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-blue-200 relative">
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl" onClick={() => setShowInvoiceModal(false)}>&times;</button>
                  <h3 className="text-2xl font-bold text-blue-700 mb-4">Invoice Details</h3>
                  <div className="mb-2 text-gray-700">Invoice Number: <span className="font-semibold">{invoiceModalData.invoice_number}</span></div>
                  <div className="mb-2 text-gray-700">Client Code: <span className="font-semibold">{invoiceModalData.client_code}</span></div>
                  <div className="mb-2 text-gray-700">Date: <span className="font-semibold">{new Date(invoiceModalData.invoice_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</span></div>
                  <div className="mb-4 text-gray-700">Status: <span className="font-semibold">{invoiceModalData.status}</span></div>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm text-left border rounded-lg">
                      <thead className="bg-blue-50 text-blue-700 font-bold">
                        <tr>
                          <th className="px-4 py-2">Shipment ID</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Base Price</th>
                          <th className="px-4 py-2">GST Amount</th>
                          <th className="px-4 py-2">Final Amount</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceModalData.shipments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-gray-400 py-8 bg-blue-50">No shipments found.</td>
                          </tr>
                        ) : (
                          invoiceModalData.shipments.map((ship) => (
                            <tr key={ship.id}>
                              <td className="px-4 py-2 font-mono">{ship.shipment_id || ship.id.slice(0, 8)}</td>
                              <td className="px-4 py-2">{new Date(ship.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                              <td className="px-4 py-2">N/A</td>
                              <td className="px-4 py-2">₹{ship.gst_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00"}</td>
                              <td className="px-4 py-2">₹{ship.final_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00"}</td>
                              <td className="px-4 py-2">{ship.invoice_status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="font-semibold text-gray-700">Total Shipments Selected: <span className="text-blue-700">{invoiceModalData.shipments.length}</span></div>
                    <div className="font-semibold text-gray-700">Total Base Price: <span className="text-blue-700">₹0.00</span></div>
                    <div className="font-semibold text-gray-700">Total GST: <span className="text-blue-700">₹0.00</span></div>
                    <div className="font-bold text-lg text-blue-900">Grand Total: <span className="text-blue-700">₹0.00</span></div>
                  </div>
                  <div className="flex gap-4 mt-6 justify-end">
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold shadow transition text-lg"
                      onClick={() => setShowInvoiceModal(false)}
                    >Close</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold text-lg ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>{toast.message}</div>
        )}
      </div>
    </div>
  );
};

export default ClientInvoicePage;
