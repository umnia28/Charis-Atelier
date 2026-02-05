'use client';
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function AdminRefundsPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load orders");
    setOrders(data.orders || []);
  };

  useEffect(() => { load().catch(e => setErr(e.message)); }, []);

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`,
      },
      body: JSON.stringify({ reason: "Cancelled by admin" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cancel failed");
    toast.success("Cancelled ✅");
    await load();
  };

  const refundOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/orders/${orderId}/refund`, {
      method: "POST",
      headers: { Authorization:`Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Refund failed");
    toast.success("Refunded ✅");
    await load();
  };

  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <RequireRole allowedRoles={["admin"]}>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Refunds & Cancels</h1>

        {orders.length === 0 ? (
          <p className="text-slate-500">No orders found.</p>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.order_id} className="border rounded-xl p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium">Order #{o.order_id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(o.date_added).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Payment: <b>{o.payment_status}</b> ({o.payment_method || "—"})
                  </p>
                  {o.transaction_id && <p className="text-sm">Txn: {o.transaction_id}</p>}
                  {o.reason_for_cancellation && (
                    <p className="text-sm text-red-700">Cancelled: {o.reason_for_cancellation}</p>
                  )}
                  <p className="font-semibold mt-1">৳ {Number(o.total_price).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toast.promise(cancelOrder(o.order_id), { loading: "Cancelling..." })}
                    className="px-3 py-1 rounded bg-red-600 text-white"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => toast.promise(refundOrder(o.order_id), { loading: "Refunding..." })}
                    className="px-3 py-1 rounded bg-green-700 text-white"
                  >
                    Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}
