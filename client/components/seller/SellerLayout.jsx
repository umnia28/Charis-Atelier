'use client';

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import SellerNavbar from "./SellerNavbar";
import SellerSidebar from "./SellerSidebar";
import RequireRole from "@/components/RequireRole";

export default function SellerLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="flex flex-col h-screen">
        <SellerNavbar />
        <div className="flex flex-1 overflow-hidden">
          <SellerSidebar />
          <div className="flex-1 p-5 lg:pl-12 lg:pt-12 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
