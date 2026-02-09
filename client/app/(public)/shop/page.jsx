'use client'
import { Suspense, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchDbProducts } from "@/lib/features/product/productSlice"

function ShopContent() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ""
  const router = useRouter()
  const dispatch = useDispatch()

  const products = useSelector(state => state.product.list)

  // ✅ load DB products into redux (merged with dummy)
  useEffect(() => {
    dispatch(fetchDbProducts(search))
  }, [dispatch, search])

  const filteredProducts = search
    ? products.filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="min-h-[70vh] mx-6">
      <div className=" max-w-7xl mx-auto">
        <h1
          onClick={() => router.push('/shop')}
          className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
        >
          {search && <MoveLeftIcon size={20} />} All <span className="text-slate-700 font-medium">Products</span>
        </h1>

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}



/*'use client';

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  // ✅ your dummy products (productDummyData) already stored in redux
  const dummyProducts = useSelector((state) => state.product.list);

  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDb = async () => {
    const res = await fetch(`${API}/api/products?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load products");

    // ✅ map DB fields -> UI fields
    const mapped = (data.products || []).map((p) => ({
      id: String(p.product_id), // keep as string for consistency
      name: p.product_name,
      description: p.product_description || "",
      price: Number(p.price),
      images: [p.thumbnail || "/placeholder.png"], // safe
      category: p.category_name || "Uncategorized",
      inStock: (p.product_count ?? 0) > 0,
      storeId: String(p.store_id),
      store: { name: p.store_name }, // optional if your card expects store.name
      createdAt: p.date_added,
    }));

    setDbProducts(mapped);
  };

  useEffect(() => {
    setLoading(true);
    loadDb().catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [search]);

  // ✅ merge (dummy + db) no duplicates by id
  const mergedProducts = useMemo(() => {
    const map = new Map();
    for (const p of dummyProducts || []) map.set(String(p.id), p);
    for (const p of dbProducts || []) map.set(String(p.id), p);
    return Array.from(map.values());
  }, [dummyProducts, dbProducts]);

  if (loading) return <p className="p-6 text-slate-500">Loading...</p>;

  return (
    <div className="p-6">
      <p className="text-slate-500 mb-4">
        Showing {mergedProducts.length} products (Dummy + DB)
      </p>

      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mergedProducts.map((p) => (
          <div key={p.id} className="border rounded-xl p-4">
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-slate-500">{p.category}</p>
            <p className="mt-2">৳{Number(p.price).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
*/