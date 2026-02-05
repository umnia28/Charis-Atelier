'use client';
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    store_id: "",
    product_name: "",
    price: "",
    product_count: 0,
    discount: 0,
    images: [""],
  });

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    setProducts(data.products || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      ...form,
      store_id: Number(form.store_id),
      price: Number(form.price),
      product_count: Number(form.product_count || 0),
      discount: Number(form.discount || 0),
      images: form.images.filter((x) => x && x.trim().length > 5),
    };

    const res = await fetch(`${API}/api/seller/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Create failed");

    toast.success("Product created ✅");
    setForm({ store_id: "", product_name: "", price: "", product_count: 0, discount: 0, images: [""] });
    await load();
  };

  const del = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");
    toast.success("Deleted ✅");
    await load();
  };

  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Seller Products</h1>

        <form onSubmit={(e)=>toast.promise(addProduct(e),{loading:"Creating..."})} className="border rounded-xl p-4 grid gap-3">
          <p className="font-medium">Add Product</p>

          <input className="border p-2 rounded" placeholder="Store ID (must be yours)"
            value={form.store_id} onChange={(e)=>setForm({...form, store_id:e.target.value})} required />

          <input className="border p-2 rounded" placeholder="Product name"
            value={form.product_name} onChange={(e)=>setForm({...form, product_name:e.target.value})} required />

          <input className="border p-2 rounded" placeholder="Price"
            value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} required />

          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="Base stock"
              value={form.product_count} onChange={(e)=>setForm({...form, product_count:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Discount"
              value={form.discount} onChange={(e)=>setForm({...form, discount:e.target.value})} />
          </div>

          <div className="grid gap-2">
            <p className="text-sm text-slate-500">Image URLs (optional)</p>
            {form.images.map((url, idx) => (
              <input
                key={idx}
                className="border p-2 rounded"
                placeholder={`Image URL ${idx + 1}`}
                value={url}
                onChange={(e) => {
                  const copy = [...form.images];
                  copy[idx] = e.target.value;
                  setForm({ ...form, images: copy });
                }}
              />
            ))}
            <button
              type="button"
              className="text-sm underline text-slate-700 w-fit"
              onClick={() => setForm({ ...form, images: [...form.images, ""] })}
            >
              + Add another image
            </button>
          </div>

          <button className="bg-slate-800 text-white py-2 rounded">Create</button>
        </form>

        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.product_id} className="border rounded-xl p-4 flex justify-between">
              <div>
                <p className="font-medium">{p.product_name}</p>
                <p className="text-sm text-slate-500">
                  Store: {p.store_name} • Price: ৳{Number(p.price).toLocaleString()} • Stock: {p.product_count}
                </p>
              </div>
              <button
                onClick={() => toast.promise(del(p.product_id), { loading: "Deleting..." })}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </RequireRole>
  );
}
