'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { orderDummyData } from "@/assets/assets";

export default function Orders() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        setOrders(orderDummyData)
    }, []);

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}
        </div>
    )
}

/*'use client';
import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:5000";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setErr("");
      const token = localStorage.getItem("token");
      if (!token) return setErr("Please login first");

      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.message || "Failed to load orders");

      setOrders(data.orders || []);
    };
    load();
  }, []);

  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-slate-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Link
              key={o.order_id}
              href={`/orders/${o.order_id}`}
              className="block border rounded p-4 hover:bg-slate-50"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Order #{o.order_id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(o.date_added).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Payment: <b>{o.payment_status}</b></p>
                  <p className="font-semibold">৳ {Number(o.total_price).toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
 */