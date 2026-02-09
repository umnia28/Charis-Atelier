'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

const SellerNavbar = () => {
  const [name, setName] = useState("Seller");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      setName(user?.username || user?.full_name || "Seller");
    } catch {
      setName("Seller");
    }
  }, []);

  return (
    <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
      <Link href="/" className="relative text-4xl font-semibold text-slate-700">
        <span className="font-serif text-orange-600 text-5xl">Charis</span>
        <span className="font-serif text-pink-700 text-3xl">Atelier</span>

        <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-blue-800">
          Seller
        </p>
      </Link>

      <div className="flex items-center gap-3">
        <p>Hi, {name}</p>
      </div>
    </div>
  );
};

export default SellerNavbar;
