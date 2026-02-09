'use client';

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function AdminSellerApprovals() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]); // ✅ always array

  const load = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/admin/sellers/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // ✅ Helpful debug (remove later)
    console.log("PENDING SELLERS RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to load pending sellers");
    }

    // ✅ GUARANTEE array
    setSellers(Array.isArray(data.sellers) ? data.sellers : []);
  };

  useEffect(() => {
    setLoading(true);
    load()
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ✅ ALWAYS use safe array in UI
  const safeSellers = Array.isArray(sellers) ? sellers : [];

  const approve = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/sellers/${userId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Approve failed");

    toast.success("Approved ✅");
    setSellers((prev) => (Array.isArray(prev) ? prev.filter((s) => s.user_id !== userId) : []));
  };

  const reject = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/sellers/${userId}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Reject failed");

    toast.success("Rejected ✅");
    setSellers((prev) => (Array.isArray(prev) ? prev.filter((s) => s.user_id !== userId) : []));
  };

  return (
    <RequireRole allowedRoles={["admin"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800">Seller Approvals</h1>
        <p className="text-slate-500 mt-1">Approve or reject pending seller applications.</p>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading...</p>
        ) : safeSellers.length === 0 ? (
          <p className="mt-6 text-slate-500">No pending requests ✅</p>
        ) : (
          <div className="mt-6 space-y-3">
            {safeSellers.map((s) => (
              <div
                key={s.user_id}
                className="border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">{s.business_name}</p>
                  <p className="text-sm text-slate-500">
                    {s.username} • {s.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toast.promise(approve(s.user_id), { loading: "Approving..." })}
                    className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => toast.promise(reject(s.user_id), { loading: "Rejecting..." })}
                    className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject
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
