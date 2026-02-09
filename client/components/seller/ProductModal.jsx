'use client';

import { useEffect, useState } from "react";

export default function ProductModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    store_id: "",
    category_id: "",
    product_name: "",
    price: "",
    discount: 0,
    product_count: 0,
    product_description: "",
    imagesText: "", // newline separated URLs
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      store_id: initial?.store_id ? String(initial.store_id) : "",
      category_id: initial?.category_id ? String(initial.category_id) : "",
      product_name: initial?.product_name || "",
      price: initial?.price != null ? String(initial.price) : "",
      discount: initial?.discount != null ? Number(initial.discount) : 0,
      product_count: initial?.product_count != null ? Number(initial.product_count) : 0,
      product_description: initial?.product_description || "",
      imagesText: Array.isArray(initial?.images) ? initial.images.join("\n") : "",
    });
  }, [open, initial]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();

    const images = form.imagesText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    onSubmit({
      store_id: Number(form.store_id),
      category_id: form.category_id ? Number(form.category_id) : null,
      product_name: form.product_name.trim(),
      price: Number(form.price),
      discount: Number(form.discount || 0),
      product_count: Number(form.product_count || 0),
      product_description: form.product_description?.trim() || null,
      images,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {initial ? "Edit Product" : "Create Product"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <form onSubmit={submit} className="grid gap-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="Store ID"
              value={form.store_id} onChange={(e)=>setForm({...form, store_id:e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Category ID (optional)"
              value={form.category_id} onChange={(e)=>setForm({...form, category_id:e.target.value})} />
          </div>

          <input className="border p-2 rounded" placeholder="Product name"
            value={form.product_name} onChange={(e)=>setForm({...form, product_name:e.target.value})} required />

          <div className="grid grid-cols-3 gap-3">
            <input className="border p-2 rounded" type="number" placeholder="Price"
              value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} required />
            <input className="border p-2 rounded" type="number" placeholder="Discount"
              value={form.discount} onChange={(e)=>setForm({...form, discount:e.target.value})} />
            <input className="border p-2 rounded" type="number" placeholder="Stock"
              value={form.product_count} onChange={(e)=>setForm({...form, product_count:e.target.value})} />
          </div>

          <textarea className="border p-2 rounded" placeholder="Description"
            value={form.product_description} onChange={(e)=>setForm({...form, product_description:e.target.value})} />

          <textarea className="border p-2 rounded" rows={3}
            placeholder={"Images URLs (one per line)\nhttps://...\nhttps://..."}
            value={form.imagesText} onChange={(e)=>setForm({...form, imagesText:e.target.value})} />

          <button className="bg-slate-800 text-white py-2 rounded">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
