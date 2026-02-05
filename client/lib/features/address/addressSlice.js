import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ✅ GET addresses from DB
export const fetchAddresses = createAsyncThunk("address/fetchAddresses", async () => {
  const res = await fetch(`${API}/api/addresses`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load addresses");
  return data.addresses;
});

// ✅ POST address to DB
export const createAddress = createAsyncThunk("address/createAddress", async (payload) => {
  const res = await fetch(`${API}/api/addresses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save address");
  return data.address;
});

const addressSlice = createSlice({
  name: "address",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAddresses: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        // newest on top
        state.list.unshift(action.payload);
      });
  },
});

export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
