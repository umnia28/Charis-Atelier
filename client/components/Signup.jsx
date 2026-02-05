import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    contact_no: "",
    full_name: "",
    gender: "",
  });
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || "Signup failed");
      return;
    }

    // Save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setMsg("Signup successful ✅");
  };

  return (
    <form onSubmit={onSubmit}>
      <input name="username" placeholder="username" value={form.username} onChange={onChange} />
      <input name="email" placeholder="email" value={form.email} onChange={onChange} />
      <input name="password" type="password" placeholder="password" value={form.password} onChange={onChange} />
      <input name="contact_no" placeholder="contact" value={form.contact_no} onChange={onChange} />
      <input name="full_name" placeholder="full name" value={form.full_name} onChange={onChange} />
      <input name="gender" placeholder="gender" value={form.gender} onChange={onChange} />

      <button type="submit">Sign Up</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
