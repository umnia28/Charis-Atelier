'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const FALLBACK_USER = "/placeholder-user.png";
const FALLBACK_STORE = "/placeholder-store.png";

// ✅ paste this helper INSIDE this file (above the component)
const resolveImageSrc = (img, fallback = FALLBACK_STORE) => {
  if (!img) return fallback;

  // ✅ Next static import object: { src, width, height, blurDataURL, ... }
  if (typeof img === "object" && typeof img.src === "string") return img;

  // ✅ Normal URL string
  if (typeof img === "string") return img.trim() ? img : fallback;

  return fallback;
};

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Description')

  // ✅ prevent crashing if product not loaded
  if (!product) return null;

  const ratings = Array.isArray(product.rating) ? product.rating : [];
  const store = product.store; // might be undefined

  return (
    <div className="my-18 text-sm text-slate-600">

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
        {['Description', 'Reviews'].map((tab) => (
          <button
            key={tab}
            className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Description */}
      {selectedTab === "Description" && (
        <p className="max-w-xl">{product.description ?? "No description available."}</p>
      )}

      {/* Reviews */}
      {selectedTab === "Reviews" && (
        <div className="flex flex-col gap-3 mt-14">
          {ratings.map((item, idx) => (
            <div key={idx} className="flex gap-5 mb-10">
              <Image
                src={resolveImageSrc(item?.user?.image, FALLBACK_USER)}
                alt={item?.user?.name ?? "User"}
                className="size-10 rounded-full"
                width={100}
                height={100}
              />

              <div>
                <div className="flex items-center">
                  {Array(5).fill('').map((_, i) => (
                    <StarIcon
                      key={i}
                      size={18}
                      className="text-transparent mt-0.5"
                      fill={(Number(item?.rating) || 0) >= i + 1 ? "#00C950" : "#D1D5DB"}
                    />
                  ))}
                </div>

                <p className="text-sm max-w-lg my-4">{item?.review ?? ""}</p>
                <p className="font-medium text-slate-800">{item?.user?.name ?? "Anonymous"}</p>
                <p className="mt-3 font-light">
                  {item?.createdAt ? new Date(item.createdAt).toDateString() : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store Page */}
      {store ? (
        <div className="flex gap-3 mt-14">
          <Image
            // ✅ HERE is the main fix: supports object OR string
            src={resolveImageSrc(store.logo, FALLBACK_STORE)}
            alt={store.name ?? "Store"}
            className="size-11 rounded-full ring ring-slate-400"
            width={100}
            height={100}
          />

          <div>
            <p className="font-medium text-slate-600">Product by {store.name ?? "Store"}</p>

            {store.username ? (
              <Link
                href={`/shop/${store.username}`}
                className="flex items-center gap-1.5 text-green-500"
              >
                view store <ArrowRight size={14} />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProductDescription
