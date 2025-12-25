import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "CharisAtelier: Where Artistry and Timeless Craft Converge",
    description: "CharisAtelier: Where Artistry and Timeless Craft Converge",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            </head>
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
