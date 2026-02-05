'use client';

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function SellerStorePage() {
  const router = useRouter();

  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ store_name: "", ref_no: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/store`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load store");
    setStore(data.store);
  };

  useEffect(() => {
    setLoading(true);
    load()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      store_name: form.store_name.trim(),
      ref_no: form.ref_no.trim() ? form.ref_no.trim() : null,
    };

    const res = await fetch(`${API}/api/seller/store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Create failed");

    toast.success("Store created ✅");
    setStore(data.store);

    // helps other pages/components read updated state instantly
    router.refresh();
  };

  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="p-6 max-w-xl mx-auto space-y-5">
        <h1 className="text-2xl font-semibold">My Store</h1>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : store ? (
          <div className="border rounded-xl p-4">
            <p className="font-medium text-lg">{store.store_name}</p>
            <p className="text-sm text-slate-500">Store ID: {store.store_id}</p>
            <p className="text-sm text-slate-500">Status: {store.store_status}</p>
            {store.ref_no && <p className="text-sm text-slate-500">Ref: {store.ref_no}</p>}
            <p className="text-sm text-slate-500">
              Created: {new Date(store.created_at).toLocaleString()}
            </p>

            <p className="mt-4 text-sm text-slate-700">
              ✅ Use this Store ID when creating products.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) =>
              toast.promise(create(e), {
                loading: "Creating...",
                success: "Store created ✅",
                error: (err) => err.message || "Create failed",
              })
            }
            className="border rounded-xl p-4 grid gap-3"
          >
            <p className="font-medium">Create your store</p>

            <input
              className="border p-2 rounded"
              placeholder="Store name"
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              required
            />

            <input
              className="border p-2 rounded"
              placeholder="Ref No (optional, must be unique)"
              value={form.ref_no}
              onChange={(e) => setForm({ ...form, ref_no: e.target.value })}
            />

            <button className="bg-slate-800 text-white py-2 rounded">
              Create Store
            </button>

            <p className="text-xs text-slate-500">
              Note: You must be <b>approved</b> by admin before creating a store.
            </p>
          </form>
        )}
      </div>
    </RequireRole>
  );
}
