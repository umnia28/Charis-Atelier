'use client';

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import OrderTimeline from "@/components/OrderTimeline";

const API = "http://localhost:5000";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.orderId;

  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);

  const loadTimeline = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/orders/${orderId}/timeline`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load timeline");
    setTimeline(data.timeline || []);
  };

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    loadTimeline().catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-700">
      <h1 className="text-2xl font-semibold">Order #{orderId}</h1>
      <p className="text-slate-500 mt-2">Track status updates and progress.</p>

      {loading ? (
        <p className="text-slate-500 mt-6">Loading...</p>
      ) : (
        <OrderTimeline timeline={timeline} />
      )}
    </div>
  );
}
