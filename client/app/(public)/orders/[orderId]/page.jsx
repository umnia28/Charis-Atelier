'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API = "http://localhost:5000";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setErr("");
      const token = localStorage.getItem("token");
      if (!token) return setErr("Please login first");

      const res = await fetch(`${API}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (!res.ok) return setErr(d.message || "Failed to load order");

      setData(d);
    };
    load();
  }, [orderId]);

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">Loading...</div>;

  const { order, items, timeline, tracker } = data;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border rounded p-4">
        <h1 className="text-xl font-semibold">Order #{order.order_id}</h1>
        <p className="text-sm text-slate-500">{new Date(order.date_added).toLocaleString()}</p>
        <p className="mt-2">Payment: <b>{order.payment_status}</b> ({order.payment_method || "—"})</p>
        {order.transaction_id && <p>Txn: <b>{order.transaction_id}</b></p>}
        <p className="mt-2 font-semibold">Total: ৳ {Number(order.total_price).toLocaleString()}</p>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Items</h2>
        <div className="space-y-2">
          {items.map(it => (
            <div key={it.order_item_id} className="flex justify-between border-b pb-2">
              <div>
                <p className="font-medium">{it.product_name}</p>
                <p className="text-sm text-slate-500">{it.store_name}</p>
                <p className="text-sm">Qty: {it.qty}</p>
              </div>
              <div className="text-right">
                <p>৳ {Number(it.price).toLocaleString()}</p>
                {Number(it.discount_amount) > 0 && (
                  <p className="text-sm text-green-700">Discount: ৳ {Number(it.discount_amount).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Status Timeline</h2>
        <div className="space-y-3">
          {timeline.map((t, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="mt-1 h-3 w-3 rounded-full bg-slate-700" />
              <div>
                <p className="font-medium">{t.status_type}</p>
                <p className="text-sm text-slate-500">{new Date(t.status_time).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {tracker && (
          <div className="mt-4 p-3 bg-slate-50 rounded">
            <p className="font-medium">Tracking</p>
            <p className="text-sm">Progress: {tracker.progress || "—"}</p>
            <p className="text-sm">ETA: {tracker.estimated_delivery_date || "—"}</p>
            <p className="text-sm">{tracker.tracker_description || ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}
