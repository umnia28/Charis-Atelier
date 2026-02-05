/*MY PREV CODE
'use client'
import { LucideShoppingBasket, Search, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [userName, setUserName] = useState('');
    const cartCount = useSelector(state => state.cart.total);

    // Get logged-in user info from localStorage
    useEffect(() => {
        setUserName(localStorage.getItem('name') || '');
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        setUserName('');
        router.push('/');
    };

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="font-serif text-orange-600 text-5xl">Charis</span>
                        <span className="font-serif text-pink-700 text-3xl">Atelier</span>
                    </Link>

                    
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-800">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input 
                                className="w-full bg-transparent outline-none placeholder-slate-600" 
                                type="text" 
                                placeholder="Type your search" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                required 
                            />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCartIcon size={25} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        
                        {userName ? (
                            <>
                                <span className="text-slate-800 font-semibold ml-4">Hi, {userName}</span>
                                <button 
                                    onClick={handleLogout} 
                                    className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link href="/auth">
                                <button className="px-10 py-4 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-300 rounded-lg text-slate-800 font-Georgia text-1xl hover:bg-slate-800 hover:text-white">
                                    Log in/Sign Up
                                </button>
                            </Link>
                        )}
                    </div>

                   
                    <div className="sm:hidden">
                        {userName ? (
                            <button 
                                onClick={handleLogout} 
                                className="px-7 py-1.5 bg-red-500 hover:bg-red-600 text-sm text-white rounded"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link href="/auth">
                                <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm text-white rounded">
                                    Login
                                </button>
                            </Link>
                        )}
                    </div>

                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar;

*/


'use client';

import { Search, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const cartCount = useSelector((state) => state.cart.total);

  /**
   * ✅ On load:
   * - check token
   * - auto logout if expired
   * - refresh user info
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      setUser(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        // token expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/auth");
        return;
      }

      setUser(JSON.parse(userStr));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, [router]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-3xl font-semibold text-slate-700">
          <span className="font-serif text-orange-600 text-4xl">Charis</span>
          <span className="font-serif text-pink-700 text-2xl">Atelier</span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex gap-6 text-slate-700">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full"
        >
          <Search size={18} className="text-slate-500" />
          <input
            className="bg-transparent outline-none text-sm"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Right Area */}
        <div className="flex items-center gap-4">

          {/* Cart */}
          <Link href="/cart" className="relative text-slate-700">
            <ShoppingCartIcon size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-slate-700 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth / User */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">
                Hi, <b>{user.username}</b>
              </span>

              {/* Role shortcuts */}
              {user.role === "admin" && (
                <Link href="/admin" className="text-xs text-blue-600">
                  Admin
                </Link>
              )}

              {user.role === "seller" && (
                <Link href="/seller" className="text-xs text-green-600">
                  Seller
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-300 rounded text-sm">
                Login / Sign Up
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

