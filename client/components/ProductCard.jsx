'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const FALLBACK_IMG = "/placeholder.png";

const toPublicImageUrl = (img, fallback = FALLBACK_IMG) => {
  if (!img) return fallback;

  // Next static import object support
  if (typeof img === "object" && typeof img.src === "string") return img;

  if (typeof img !== "string") return fallback;

  const s = img.trim();
  if (!s) return fallback;

  // already absolute
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // DB stored as "/uploads/..."
  if (s.startsWith("/uploads/")) return `${API}${s}`;

  // local public file ("/placeholder.png", "/some.png")
  if (s.startsWith("/")) return s;

  // anything else fallback
  return fallback;
};

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

  const ratingsArr = Array.isArray(product?.rating) ? product.rating : []
  const avg =
    ratingsArr.length > 0
      ? ratingsArr.reduce((acc, curr) => acc + Number(curr?.rating || 0), 0) / ratingsArr.length
      : 0
  const rating = Math.round(avg)

  const firstImg = Array.isArray(product?.images) && product.images.length > 0
    ? product.images[0]
    : null;

  const imgSrc = toPublicImageUrl(firstImg);

  return (
    <Link href={`/product/${product.id}`} className='group max-xl:mx-auto'>
      <div className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden w-60 h-60 group">
        <Image
          src={imgSrc}
          alt={product?.name || "Product"}
          width={800}
          height={800}
          className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
        <div>
          <p>{product?.name}</p>
          <div className='flex'>
            {Array(5).fill('').map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className='text-transparent mt-0.5'
                fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
              />
            ))}
          </div>
        </div>
        <p>{currency}{product?.price}</p>
      </div>
    </Link>
  )
}

export default ProductCard

