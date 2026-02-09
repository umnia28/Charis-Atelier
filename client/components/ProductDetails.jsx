'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const FALLBACK_IMG = "/placeholder.png";

// ✅ Make any DB "/uploads/.." usable in Next Image
const toPublicImageUrl = (img, fallback = FALLBACK_IMG) => {
  if (!img) return fallback;

  if (typeof img === "object" && typeof img.src === "string") return img;

  if (typeof img !== "string") return fallback;

  const s = img.trim();
  if (!s) return fallback;

  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/uploads/")) return `${API}${s}`;
  if (s.startsWith("/")) return s;

  return fallback;
};

const ProductDetails = ({ product }) => {
  const productId = product?.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "৳";

  const cart = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const images = useMemo(() => {
    const raw = product?.images ?? [];
    return raw.filter((img) => {
      if (!img) return false;
      if (typeof img === "string") return img.trim().length > 0;
      if (typeof img === "object" && typeof img.src === "string") return true;
      return false;
    });
  }, [product]);

  const [mainImage, setMainImage] = useState(images[0] ?? FALLBACK_IMG);

  const addToCartHandler = () => {
    if (!productId) return;
    dispatch(addToCart({ productId }));
  };

  const ratingArr = Array.isArray(product?.rating) ? product.rating : [];
  const averageRating =
    ratingArr.length > 0
      ? ratingArr.reduce((acc, item) => acc + (Number(item?.rating) || 0), 0) / ratingArr.length
      : 0;

  const mainSrc = toPublicImageUrl(mainImage, FALLBACK_IMG);

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(image)}
              className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer"
            >
              <Image
                src={toPublicImageUrl(image, FALLBACK_IMG)}
                className="group-hover:scale-103 group-active:scale-95 transition"
                alt=""
                width={45}
                height={45}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center bg-gray-100 rounded-lg w-full max-w-md h-96 overflow-hidden">
          <Image
            src={mainSrc}
            alt={product?.name ?? "Product"}
            width={800}
            height={1200}
            className="object-contain w-full h-full"
          />
        </div>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">{product?.name}</h1>

        <div className="flex items-center mt-2">
          {Array(5).fill("").map((_, index) => (
            <StarIcon
              key={index}
              size={14}
              className="text-transparent mt-0.5"
              fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
            />
          ))}
          <p className="text-sm ml-3 text-slate-500">{ratingArr.length} Reviews</p>
        </div>

        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
          <p>{currency}{product?.price}</p>
          <p className="text-xl text-slate-500 line-through">{currency}{product?.mrp}</p>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          <p>
            Save {product?.mrp ? (((product.mrp - product.price) / product.mrp) * 100).toFixed(0) : 0}% right now
          </p>
        </div>

        <div className="flex items-end gap-5 mt-10">
          {productId && cart?.[productId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg text-slate-800 font-semibold">Quantity</p>
              <Counter productId={productId} />
            </div>
          )}

          <button
            onClick={() => (!cart?.[productId] ? addToCartHandler() : router.push("/cart"))}
            className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition"
          >
            {!cart?.[productId] ? "Add to Cart" : "View Cart"}
          </button>
        </div>

        <hr className="border-gray-300 my-5" />

        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3"><CreditCardIcon className="text-slate-400" /> 100% Secured Payment</p>
          <p className="flex gap-3"><EarthIcon className="text-slate-400" /> Free shipping for orders above 999Tk</p>
          <p className="flex gap-3"><UserIcon className="text-slate-400" /> Authentic Handmade Products</p>
          </div>
      </div>
    </div>
  );
};

export default ProductDetails;
