'use client';
import RequireRole from "@/components/RequireRole";

export default function SellerStockPage() {
  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-slate-500 mt-2">Next: update product_count / product_attributes stock.</p>
      </div>
    </RequireRole>
  );
}
