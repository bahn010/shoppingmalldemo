import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, size, quantity = 1 }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/cart", { productId, size, quantity });
      dispatch(showToastMessage({ 
        message: "상품이 장바구니에 추가되었습니다.", 
        status: "success" 
      }));
      dispatch(getCartQty());
      return response.data;
    } catch (error) {
      dispatch(showToastMessage({ 
        message: error.response?.data?.message || "장바구니 추가 실패", 
        status: "error" 
      }));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ productId, size }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete("/cart", { 
        data: { productId, size }
      });
      dispatch(showToastMessage({ 
        message: "상품이 장바구니에서 삭제되었습니다.", 
        status: "success" 
      }));
      dispatch(getCartQty());
      return response.data;
    } catch (error) {
      dispatch(showToastMessage({ 
        message: error.response?.data?.message || "삭제 실패", 
        status: "error" 
      }));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ productId, size, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put("/cart", { productId, size, quantity });
      dispatch(getCartQty());
      return response.data;
    } catch (error) {
      dispatch(showToastMessage({ 
        message: error.response?.data?.message || "수량 변경 실패", 
        status: "error" 
      }));
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart");
      const cart = response.data.cart;
      const totalQty = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      return totalQty;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartList = action.payload.cart?.items || [];
        state.totalPrice = state.cartList.reduce(
          (total, item) => total + (item.productId.price * item.quantity), 0
        );
      })
      .addCase(getCartList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cartList = [];
        state.totalPrice = 0;
      })
      .addCase(updateQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        // 로컬 상태 업데이트
        const updatedCart = action.payload.cart;
        state.cartList = updatedCart?.items || [];
        state.totalPrice = state.cartList.reduce(
          (total, item) => total + (item.productId.price * item.quantity), 0
        );
      })
      .addCase(updateQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        // getCartList를 다시 호출하여 최신 상태를 가져오도록 함
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartQty.fulfilled, (state, action) => {
        state.cartItemCount = action.payload;
      })
      .addCase(getCartQty.rejected, (state, action) => {
        state.cartItemCount = 0;
      });
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
