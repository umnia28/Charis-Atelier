'use client';
import { useState } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function BecomeSellerPage() {
  const [businessName, setBusinessName] = useState("");

  const apply = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login first");

    const res = await fetch(`${API}/api/seller/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ business_name: businessName }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Apply failed");

    toast.success("Application submitted ✅");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Become a Seller</h1>

      <form onSubmit={(e)=>toast.promise(apply(e), { loading:"Submitting..." })} className="space-y-3">
        <input
          className="border p-2 w-full rounded"
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
        <button className="w-full bg-slate-800 text-white py-2 rounded">
          Apply
        </button>
      </form>
    </div>
  );
}
