'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function RequireRole({ allowedRoles = [], children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("Checking access...");

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        setMsg("Please login first");
        router.push("/auth");
        return;
      }

      // If token expired -> logout
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setMsg("Session expired");
          router.push("/auth");
          return;
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth");
        return;
      }

      // Refresh role/token (important after approval)
      try {
        const res = await fetch(`${API}/api/auth/refresh-token`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setMsg("Unauthorized");
          router.push("/auth");
          return;
        }

        if (data?.token) localStorage.setItem("token", data.token);
        if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

        const role = data?.user?.role || "";
        if (!allowedRoles.includes(role)) {
          setMsg("Forbidden");
          router.push("/"); // or "/auth"
          return;
        }

        setOk(true);
      } catch {
        // fallback to local user (if backend down)
        try {
          const localUser = JSON.parse(userStr);
          const role = localUser?.role || "";
          if (!allowedRoles.includes(role)) {
            setMsg("Forbidden");
            router.push("/");
            return;
          }
          setOk(true);
        } catch {
          router.push("/auth");
        }
      }
    };

    run();
  }, [allowedRoles, router]);

  if (!ok) return <div className="p-6 text-slate-600">{msg}</div>;
  return children;
}
