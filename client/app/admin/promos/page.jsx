'use client';
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({
    promo_name: "",
    promo_discount: "",
    promo_status: "inactive",
  });

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/promos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    setPromos(data.promos || []);
  };

  useEffect(() => { load().catch(()=>{}); }, []);

  const createPromo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/admin/promos`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({
        promo_name: form.promo_name,
        promo_discount: Number(form.promo_discount),
        promo_status: form.promo_status,
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Create failed");
    toast.success("Promo created ✅");
    setForm({ promo_name:"", promo_discount:"", promo_status:"inactive" });
    await load();
  };

  const setStatus = async (promo_id, promo_status) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/promos/${promo_id}/status`, {
      method:"PATCH",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({ promo_status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    toast.success("Updated ✅");
    await load();
  };

  return (
    <RequireRole allowedRoles={["admin"]}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Promos</h1>

        <form onSubmit={(e)=>toast.promise(createPromo(e),{loading:"Creating..."})} className="border rounded-xl p-4 grid gap-3">
          <p className="font-medium">Create Promo</p>
          <input className="border p-2 rounded" placeholder="Promo name"
            value={form.promo_name} onChange={e=>setForm({...form,promo_name:e.target.value})} required />
          <input className="border p-2 rounded" placeholder="Discount amount"
            value={form.promo_discount} onChange={e=>setForm({...form,promo_discount:e.target.value})} required />
          <select className="border p-2 rounded"
            value={form.promo_status} onChange={e=>setForm({...form,promo_status:e.target.value})}>
            <option value="inactive">inactive</option>
            <option value="active">active</option>
          </select>
          <button className="bg-slate-800 text-white py-2 rounded">Create</button>
        </form>

        <div className="space-y-3">
          {promos.map(p => (
            <div key={p.promo_id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{p.promo_name}</p>
                <p className="text-sm text-slate-500">
                  Discount: ৳{Number(p.promo_discount).toLocaleString()} • Status: {p.promo_status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={()=>toast.promise(setStatus(p.promo_id,"active"),{loading:"Updating..."})}
                  className="px-3 py-1 rounded bg-green-600 text-white"
                >
                  Activate
                </button>
                <button
                  onClick={()=>toast.promise(setStatus(p.promo_id,"inactive"),{loading:"Updating..."})}
                  className="px-3 py-1 rounded bg-slate-600 text-white"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RequireRole>
  );
}
