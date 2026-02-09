'use client';

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductModal from "@/components/seller/ProductModal";

const API = "http://localhost:5000";

export default function SellerProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load products");
    setProducts(data.products || []);
  };

  useEffect(() => {
    setLoading(true);
    load().catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const create = async (payload) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Create failed");
    await load();
    setOpen(false);
  };

  const update = async (payload) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/products/${editing.product_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    await load();
    setEditing(null);
    setOpen(false);
  };

  const del = async (product_id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/products/${product_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");
    setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
  };

  return (
    <div className="text-slate-700">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>

        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="bg-slate-800 text-white px-4 py-2 rounded"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 mt-6">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-slate-500 mt-6">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.product_id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{p.product_name}</div>
                    <div className="text-xs text-slate-500">
                      ID: {p.product_id} • Store: {p.store_name} (#{p.store_id})
                    </div>
                  </td>

                  <td className="p-3 text-center">৳{Number(p.price).toLocaleString()}</td>
                  <td className="p-3 text-center">৳{Number(p.discount).toLocaleString()}</td>
                  <td className="p-3 text-center">{p.product_count}</td>
                  <td className="p-3 text-center">{p.status}</td>

                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => { setEditing(p); setOpen(true); }}
                      className="px-3 py-1 rounded border hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toast.promise(del(p.product_id), { loading: "Deleting..." })}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      <ProductModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        onSubmit={(payload) =>
          toast.promise(editing ? update(payload) : create(payload), {
            loading: editing ? "Updating..." : "Creating...",
            success: "Saved ✅",
            error: (e) => e.message || "Failed",
          })
        }
      />
    </div>
  );
}
