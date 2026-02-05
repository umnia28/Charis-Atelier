'use client';
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function SellerOrdersPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setErr("");
      const token = localStorage.getItem("token");
      if (!token) return setErr("Please login");

      const res = await fetch(`${API}/api/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Failed to load");

      setRows(data.seller_order_items || []);
    };
    load();
  }, []);

  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Seller Orders</h1>

      {rows.length === 0 ? (
        <p className="text-slate-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.order_item_id} className="border rounded p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Order #{r.order_id}</p>
                  <p className="text-sm text-slate-500">{new Date(r.date_added).toLocaleString()}</p>
                  <p className="text-sm">Store: {r.store_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Payment: <b>{r.payment_status}</b></p>
                </div>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3">
                <div>
                  <p className="font-medium">{r.product_name}</p>
                  <p className="text-sm">Qty: {r.qty}</p>
                </div>
                <p className="font-semibold">৳ {(Number(r.price) * Number(r.qty)).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
