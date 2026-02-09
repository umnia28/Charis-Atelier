import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:5000";

export const fetchDbProducts = createAsyncThunk(
  "product/fetchDbProducts",
  async (search = "") => {
    const res = await fetch(`${API}/api/public/products?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load products");
    return data.products || [];
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDbProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDbProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // ✅ ONLY DB
      })
      .addCase(fetchDbProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;



/*import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productDummyData } from "@/assets/assets";

const API = "http://localhost:5000";

/**
 * Expecting Express endpoint:
 * GET http://localhost:5000/api/public/products?search=
 *
 * Response shape:
 * {
 *   products: [
 *     {
 *       id, name, description, price, mrp,
 *       images: ["/uploads/..", ...],
 *       rating: [],
 *       store: { id, name, username, logo }
 *     }
 *   ]
 * }
 *
export const fetchDbProducts = createAsyncThunk(
  "product/fetchDbProducts",
  async (search = "") => {
    const res = await fetch(
      `${API}/api/public/products?search=${encodeURIComponent(search)}`
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to load products");

    // must be an array
    return Array.isArray(data?.products) ? data.products : [];
  }
);

// Optional: normalize for safety (keeps your UI from crashing)
const normalizeUiProduct = (p) => ({
  id: p?.id ?? "",
  name: p?.name ?? "",
  description: p?.description ?? "",
  price: Number(p?.price ?? 0),
  mrp: p?.mrp != null ? Number(p.mrp) : null,

  // MUST be array of strings like "/uploads/.."
  images: Array.isArray(p?.images) ? p.images : [],

  // keep rating array so your ProductCard is safe
  rating: Array.isArray(p?.rating) ? p.rating : [],

  store: p?.store
    ? {
        id: p.store.id ?? null,
        name: p.store.name ?? "",
        username: p.store.username ?? "",
        logo: p.store.logo ?? null,
      }
    : null,
});

const productSlice = createSlice({
  name: "product",
  initialState: {
    list: productDummyData, // keep dummy for now
    dbList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDbProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDbProducts.fulfilled, (state, action) => {
        state.loading = false;

        // normalize DB products
        const db = action.payload.map(normalizeUiProduct);
        state.dbList = db;

        // Merge dummy + db (avoid duplicates by id)
        const merged = [...productDummyData];
        const existingIds = new Set(merged.map((x) => String(x.id)));

        for (const p of db) {
          if (!existingIds.has(String(p.id))) merged.push(p);
        }

        state.list = merged;
      })
      .addCase(fetchDbProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to fetch products";
      });
  },
});

export default productSlice.reducer;
*/






/*import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productDummyData } from "@/assets/assets";

const API = "http://localhost:5000";

const mapDbProductToUi = (p) => ({
  id: String(p.product_id),                // important for cart keys
  name: p.product_name,
  description: p.product_description || "",
  price: Number(p.price),
  images: [p.thumbnail || "/placeholder.png"], // ensure at least 1 image
  category: p.category_name || "Uncategorized",
  storeId: String(p.store_id),
  inStock: (p.product_count ?? 0) > 0,
  createdAt: p.date_added,
});

export const fetchShopProducts = createAsyncThunk(
  "product/fetchShopProducts",
  async () => {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load products");
    return data.products;
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    list: productDummyData,     // ✅ keep dummy products always
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopProducts.fulfilled, (state, action) => {
        const dbProducts = action.payload.map(mapDbProductToUi);

        // ✅ merge without duplicates by id
        const existing = new Set(state.list.map((x) => String(x.id)));
        for (const p of dbProducts) {
          if (!existing.has(String(p.id))) state.list.push(p);
        }

        state.loading = false;
      })
      .addCase(fetchShopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
*/