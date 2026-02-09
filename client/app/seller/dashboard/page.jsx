'use client';

import SellerLayout from "@/components/seller/SellerLayout";

export default function SellerDashboardPage() {
  return (
    <SellerLayout>
      <div className="text-slate-500">
        <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>
        <p className="mt-2">Welcome seller.</p>
      </div>
    </SellerLayout>
  );
}
