"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    contact_no: "",
    full_name: "",
    gender: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const url =
      mode === "login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

    const body =
      mode === "login"
        ? {
            emailOrUsername: form.email.trim(), // use this as "identifier"
            password: form.password,
          }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            contact_no: form.contact_no || null,
            full_name: form.full_name || null,
            gender: form.gender || null,
          };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMsg(`${mode === "login" ? "Login" : "Signup"} successful ✅`);

      // redirect after a short moment
      router.push("/");
    } catch (err) {
      setMsg("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm border rounded p-6">
      <h2 className="text-xl font-semibold mb-4">
        {mode === "login" ? "Login" : "Create Account"}
      </h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === "register" && (
          <>
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={onChange}
              required
              className="border px-3 py-2 rounded"
            />

            <input
              name="full_name"
              placeholder="Full name (optional)"
              value={form.full_name}
              onChange={onChange}
              className="border px-3 py-2 rounded"
            />

            <input
              name="contact_no"
              placeholder="Contact number (optional)"
              value={form.contact_no}
              onChange={onChange}
              className="border px-3 py-2 rounded"
            />

            <input
              name="gender"
              placeholder="Gender (optional)"
              value={form.gender}
              onChange={onChange}
              className="border px-3 py-2 rounded"
            />
          </>
        )}

        <input
          name="email"
          placeholder={mode === "login" ? "Email or Username" : "Email"}
          value={form.email}
          onChange={onChange}
          required
          className="border px-3 py-2 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
          className="border px-3 py-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      <p className="text-sm mt-4">
        {mode === "login" ? (
          <>
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="text-blue-600 underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-blue-600 underline"
            >
              Login
            </button>
          </>
        )}
      </p>

      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  );
}
