'use client';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function AdminSellersPage() {
  const [pending, setPending] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/sellers/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    setPending(data.pending || []);
  };

  useEffect(() => { load().catch(e => setErr(e.message)); }, []);

  const approve = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/sellers/${userId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Approve failed");
    toast.success("Approved ✅");
    await load();
  };

  const reject = async (userId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/admin/sellers/${userId}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Reject failed");
    toast.success("Rejected ✅");
    await load();
  };

  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Pending Seller Requests</h1>

      {pending.length === 0 ? (
        <p className="text-slate-500">No pending sellers.</p>
      ) : (
        <div className="space-y-3">
          {pending.map(s => (
            <div key={s.user_id} className="border rounded p-4 flex justify-between">
              <div>
                <p className="font-medium">{s.business_name}</p>
                <p className="text-sm text-slate-500">{s.username} — {s.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.promise(approve(s.user_id), { loading: "Approving..." })}
                  className="px-3 py-1 rounded bg-green-600 text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => toast.promise(reject(s.user_id), { loading: "Rejecting..." })}
                  className="px-3 py-1 rounded bg-red-600 text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
