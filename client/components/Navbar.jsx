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

                    {/* Desktop Menu */}
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

                        {/* Login / User Info */}
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
                            <Link href="/login">
                                <button className="px-10 py-4 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-300 rounded-lg text-slate-800 font-Georgia text-1xl hover:bg-slate-800 hover:text-white">
                                    Log in/Sign Up
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="sm:hidden">
                        {userName ? (
                            <button 
                                onClick={handleLogout} 
                                className="px-7 py-1.5 bg-red-500 hover:bg-red-600 text-sm text-white rounded"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link href="/login">
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



{/*    MY PREV CODE
'use client'
import { LucideShoppingBasket, Search, ShoppingBasket, ShoppingCart, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="font-serif text-purple-800 text-5xl">Charis</span><span className="font-serif text-orange-600 text-3xl">Atelier</span><span className="text-blue-500 font-serif text-5xl leading-0"></span>
                    </Link>

                    
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-800">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Type your search" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCartIcon size={25} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        <Link href="/login">
                        <button className="px-10 py-4 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-300 rounded-lg text-slate-800 font-Georgia text-1xl sm:text-1xl hover:bg-slate-800 hover:text-white active:scale-95 transition-all duration-300">
                            Log in/Sign Up
                        </button>
                        </Link>

                    </div>

                    
                    <div className="sm:hidden">
                        <button className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded">
                            Login
                        </button>
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
*/}
