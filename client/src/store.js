import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { errMsg } from "./api";

// mode: "login" | "register" — le login essaie client puis vendeur (admin)
export const authenticate = createAsyncThunk("auth/go", async ({ mode, ...form }, { rejectWithValue }) => {
  try {
    let r;
    if (mode === "register") r = await api.post("/user/register", form);
    else {
      try { r = await api.post("/user/login", form); }
      catch (e) { if (e.response?.status !== 400) throw e; r = await api.post("/admin/login", form); }
    }
    return { user: r.data.user || r.data.admin, token: r.data.token };
  } catch (e) { return rejectWithValue(errMsg(e)); }
});

const saved = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };

const auth = createSlice({
  name: "auth",
  initialState: { user: saved(), loading: false, error: null },
  reducers: {
    logout: (s) => { s.user = null; localStorage.removeItem("user"); localStorage.removeItem("token"); },
  },
  extraReducers: (b) => b
    .addCase(authenticate.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(authenticate.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
    .addCase(authenticate.fulfilled, (s, { payload }) => {
      s.loading = false; s.user = payload.user;
      localStorage.setItem("user", JSON.stringify(payload.user));
      localStorage.setItem("token", payload.token);
    }),
});

export const fetchCart = createAsyncThunk("cart/fetch", async () => (await api.get("/cart")).data);
const cart = createSlice({
  name: "cart",
  initialState: { items: [], total: 0 },
  reducers: { reset: () => ({ items: [], total: 0 }) },
  extraReducers: (b) => b.addCase(fetchCart.fulfilled, (_, a) => a.payload),
});

const savedWish = () => { try { return JSON.parse(localStorage.getItem("wish")) || []; } catch { return []; } };
const wish = createSlice({
  name: "wish",
  initialState: savedWish(),
  reducers: {
    toggleWish: (s, a) => {
      const i = s.indexOf(a.payload);
      if (i >= 0) s.splice(i, 1); else s.push(a.payload);
      localStorage.setItem("wish", JSON.stringify(s));
    },
  },
});

export const { logout } = auth.actions;
export const { toggleWish } = wish.actions;
export const resetCart = cart.actions.reset;
export default configureStore({ reducer: { auth: auth.reducer, cart: cart.reducer, wish: wish.reducer } });
