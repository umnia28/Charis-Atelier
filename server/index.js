import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import sellerRoutes from "./routes/seller.routes.js";
import productRoutes from "./routes/product.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import addressRoutes from "./routes/address.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import orderRoutes from "./routes/order.routes.js";
import sellerOrdersRoutes from "./routes/seller.orders.routes.js";
import adminOrdersRoutes from "./routes/admin.orders.routes.js";
import sellerApplyRoutes from "./routes/seller.apply.routes.js";
import adminSellersRoutes from "./routes/admin.sellers.routes.js";
import sellerProductsRoutes from "./routes/seller.products.routes.js";
import adminPromosRoutes from "./routes/admin.promos.routes.js";
import sellerStoreRoutes from "./routes/seller.store.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import publicProductsRoutes from "./routes/products.public.routes.js";
import uploadRoutes from "./routes/upload.routes.js";




dotenv.config();
const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.90.104:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller/orders", sellerOrdersRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/seller", sellerApplyRoutes);
app.use("/api/admin/sellers", adminSellersRoutes);
app.use("/api/seller/products", sellerProductsRoutes);
app.use("/api/admin/promos", adminPromosRoutes);
app.use("/api/seller", sellerStoreRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/public/products", publicProductsRoutes);
app.use("/api/upload", uploadRoutes);




app.get('/', (req, res) => res.send('Backend is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

