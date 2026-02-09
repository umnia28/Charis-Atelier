import SellerLayout from "@/components/seller/SellerLayout";

export const metadata = {
  title: "CharisAtelier - Seller",
  description: "Seller dashboard",
};

export default function RootSellerLayout({ children }) {
  return <SellerLayout>{children}</SellerLayout>;
}

