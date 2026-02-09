'use client';

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const API = "http://localhost:5000";

export default function SellerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load orders");
    setItems(data.items || []);
  };

  useEffect(() => {
    setLoading(true);
    load().catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  // group rows by order_id (seller can have multiple items per same order)
  const orders = useMemo(() => {
    const map = new Map();
    for (const row of items) {
      if (!map.has(row.order_id)) {
        map.set(row.order_id, {
          order_id: row.order_id,
          date_added: row.date_added,
          payment_status: row.payment_status,
          payment_method: row.payment_method,
          total_price: row.total_price,
          transaction_id: row.transaction_id,
          latest_status: row.latest_status,
          customer: {
            id: row.customer_id,
            username: row.customer_username,
            email: row.customer_email,
          },
          lines: [],
        });
      }
      map.get(row.order_id).lines.push({
        order_item_id: row.order_item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        qty: row.qty,
        price: row.price,
        discount_amount: row.discount_amount,
      });
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <div className="text-slate-700">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="text-slate-500 mt-2">Orders that include your products.</p>

      {loading ? (
        <p className="text-slate-500 mt-6">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-500 mt-6">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.order_id} className="border rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Order #{o.order_id}</p>
                  <p className="text-xs text-slate-500">
                    {o.date_added ? new Date(o.date_added).toLocaleString() : ""}
                    {" • "}
                    {o.customer?.username} ({o.customer?.email})
                  </p>
                </div>

                <div className="text-sm text-slate-600 flex gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-slate-100">
                    {o.latest_status || "no status"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100">
                    {o.payment_status}
                  </span>
                  <Link
                    className="px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-900"
                    href={`/orders/${o.order_id}`}
                  >
                    Open Tracking
                  </Link>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left py-2">Product</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.lines.map((l) => (
                      <tr key={l.order_item_id} className="border-t">
                        <td className="py-2">{l.product_name} (#{l.product_id})</td>
                        <td className="py-2 text-center">{l.qty}</td>
                        <td className="py-2 text-center">৳{Number(l.price).toLocaleString()}</td>
                        <td className="py-2 text-center">৳{Number(l.discount_amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
