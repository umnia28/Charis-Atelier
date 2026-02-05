"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, getToken, isTokenExpired, logout } from "./auth.utils";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = getToken();

      // 🚨 No token or expired token → logout
      if (!token || isTokenExpired(token)) {
        logout();
        router.push("/auth");
        return;
      }

      // Token exists & not expired → verify with backend
      const user = await fetchMe();
      if (!user) {
        logout();
        router.push("/auth");
        return;
      }

      setReady(true);
    })();
  }, [router]);

  if (!ready) return <div className="p-6">Checking authentication…</div>;

  return children;
}
