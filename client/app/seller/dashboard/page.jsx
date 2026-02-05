'use client';

import Link from "next/link";
import RequireRole from "@/components/RequireRole";

export default function SellerDashboardHome() {
  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="min-h-screen p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800">
          Seller Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your store, products, stock, and orders.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* ✅ Store */}
          <Link
            href="/seller/store"
            className="border rounded-xl p-5 hover:bg-slate-50 transition"
          >
            <p className="text-lg font-medium">Store</p>
            <p className="text-sm text-slate-500 mt-1">
              Create / view your store
            </p>
          </Link>

          {/* ✅ Products */}
          <Link
            href="/seller/products"
            className="border rounded-xl p-5 hover:bg-slate-50 transition"
          >
            <p className="text-lg font-medium">Products</p>
            <p className="text-sm text-slate-500 mt-1">
              Add, edit, and manage products
            </p>
          </Link>

          {/* ✅ Orders */}
          <Link
            href="/seller/orders"
            className="border rounded-xl p-5 hover:bg-slate-50 transition"
          >
            <p className="text-lg font-medium">Orders</p>
            <p className="text-sm text-slate-500 mt-1">
              View customer orders
            </p>
          </Link>

          {/* ✅ Stock */}
          <Link
            href="/seller/stock"
            className="border rounded-xl p-5 hover:bg-slate-50 transition"
          >
            <p className="text-lg font-medium">Stock</p>
            <p className="text-sm text-slate-500 mt-1">
              Update product stock & variants
            </p>
          </Link>
        </div>
      </div>
    </RequireRole>
  );
}
