/*'use client';

import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  TagsIcon,
  BoxesIcon,
} from "lucide-react";

import { dummySellerDashboardData } from "@/assets/assets";

export default function SellerDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "৳";

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    stock: 0,
    allOrders: [],
  });

  const cards = [
    { title: "Products", value: dashboardData.products, icon: ShoppingBasketIcon },
    { title: "Revenue", value: currency + dashboardData.revenue, icon: CircleDollarSignIcon },
    { title: "Orders", value: dashboardData.orders, icon: TagsIcon },
    { title: "Stock Units", value: dashboardData.stock, icon: BoxesIcon },
  ];

  useEffect(() => {
    setDashboardData(dummySellerDashboardData);
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <RequireRole allowedRoles={["seller"]}>
      <div className="text-slate-500 p-6">
        <h1 className="text-2xl">
          Seller <span className="text-slate-800 font-medium">Dashboard</span>
        </h1>

        // Cards 
        <div className="flex flex-wrap gap-5 my-10 mt-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg"
            >
              <div className="flex flex-col gap-3 text-xs">
                <p>{card.title}</p>
                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
              </div>
              <card.icon className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>

        <OrdersAreaChart allOrders={dashboardData.allOrders} />
      </div>
    </RequireRole>
  );
}
*/

'use client';

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  TagsIcon,
  StoreIcon,
} from "lucide-react";
import { dummySellerDashboardData } from "@/assets/assets";

export default function SellerDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "৳";

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    allOrders: [],
  });

  const dashboardCardsData = [
    { title: "Total Products", value: dashboardData.products, icon: ShoppingBasketIcon },
    { title: "Total Revenue", value: currency + dashboardData.revenue, icon: CircleDollarSignIcon },
    { title: "Total Orders", value: dashboardData.orders, icon: TagsIcon },
    { title: "Total Stores", value: dashboardData.stores, icon: StoreIcon },
  ];

  useEffect(() => {
    setDashboardData(dummySellerDashboardData); // later replace with real API
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500">
      <h1 className="text-2xl">
        Seller <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg"
          >
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">{card.value}</b>
            </div>
            <card.icon
              size={50}
              className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
            />
          </div>
        ))}
      </div>

      <OrdersAreaChart allOrders={dashboardData.allOrders} />
    </div>
  );
}
