'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  StoreIcon,
  ShoppingBasketIcon,
  TagsIcon,
  BoxesIcon,
} from "lucide-react";

export default function SellerSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/seller", icon: HomeIcon },
    { name: "Store", href: "/seller/store", icon: StoreIcon },
    { name: "Products", href: "/seller/products", icon: ShoppingBasketIcon },
    { name: "Orders", href: "/seller/orders", icon: TagsIcon },
    { name: "Stock", href: "/seller/stock", icon: BoxesIcon },
  ];

  return (
    <div className="min-w-60 border-r border-slate-200">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 ${
            pathname === l.href ? "bg-slate-100 font-medium" : ""
          }`}
        >
          <l.icon size={18} />
          {l.name}
        </Link>
      ))}
    </div>
  );
}
