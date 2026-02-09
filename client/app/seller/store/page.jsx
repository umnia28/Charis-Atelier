'use client';

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function SellerStorePage() {
  const router = useRouter();

  const [store, setStore] = useState(null);
  const [stores, setStores] = useState([]); // ✅ all stores list
  const [form, setForm] = useState({ store_name: "", ref_no: "" });
  const [loading, setLoading] = useState(true);

  // ✅ Load public stores list
  const loadStores = async () => {
    const res = await fetch(`${API}/api/seller/stores`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load stores");
    setStores(Array.isArray(data.stores) ? data.stores : []);
  };

  // ✅ Load my store
  const loadMyStore = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/seller/store`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load store");
    setStore(data.store);
  };

  const loadAll = async () => {
    await Promise.allSettled([loadStores(), loadMyStore()]);
  };

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));
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

    setStore(data.store);

    // refresh store list so it appears in "Existing stores"
    await loadStores();

    // helps other pages/components read updated state instantly
    router.refresh();

    return data;
  };

  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* ✅ Existing stores list */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Stores</h1>

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : stores.length === 0 ? (
            <p className="text-slate-500">No stores found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stores.map((s) => (
                <div key={s.store_id} className="border rounded-xl p-4">
                  <p className="font-medium text-lg">{s.store_name}</p>
                  <p className="text-sm text-slate-500">Store ID: {s.store_id}</p>
                  <p className="text-sm text-slate-500">Status: {s.store_status}</p>
                  <p className="text-sm text-slate-500">Ref: {s.ref_no || "—"}</p>
                  <p className="text-xs text-slate-400">
                    Created: {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ My store / Create store */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">My Store</h2>

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
                ✅ Use this <b>Store ID</b> when creating products.
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
              className="border rounded-xl p-4 grid gap-3 max-w-xl"
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

      </div>
    </RequireRole>
  );
}
