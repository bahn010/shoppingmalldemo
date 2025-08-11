import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemTypes: 0,
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
      // 백엔드에서 반환하는 에러 메시지 사용
      const errorMessage = error.response?.data?.message || "장바구니 추가 실패";
      
      dispatch(showToastMessage({ 
        message: errorMessage, 
        status: "error" 
      }));
      return rejectWithValue(errorMessage);
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
      const itemCount = cart?.items?.length || 0;
      return itemCount;
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
      state.cartItemTypes = 0;
    },
    clearCart: (state) => {
      state.cartList = [];
      state.cartItemTypes = 0;
      state.totalPrice = 0;
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
        // 장바구니에 새 아이템 추가
        const newCart = action.payload.cart;
        const cartItems = newCart?.items || [];
        state.cartList = cartItems;
        
        // cartItemTypes 업데이트
        state.cartItemTypes = cartItems.length;
        
        // totalPrice 계산
        state.totalPrice = cartItems.reduce((total, item) => {
          if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
            return total + (item.productId.price * item.quantity);
          }
          return total;
        }, 0);
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
        // 응답 데이터 구조 확인 및 안전한 접근
        const cartItems = action.payload?.cart?.items || [];
        state.cartList = cartItems;
        
        // totalPrice 계산 시 안전한 접근
        state.totalPrice = cartItems.reduce((total, item) => {
          if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
            return total + (item.productId.price * item.quantity);
          }
          return total;
        }, 0);
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
        const cartItems = updatedCart?.items || [];
        state.cartList = cartItems;
        
        // cartItemTypes 업데이트
        state.cartItemTypes = cartItems.length;
        
        // totalPrice 계산 시 안전한 접근
        state.totalPrice = cartItems.reduce((total, item) => {
          if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
            return total + (item.productId.price * item.quantity);
          }
          return total;
        }, 0);
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
        // 장바구니에서 해당 아이템 제거
        const { productId, size } = action.meta.arg;
        state.cartList = state.cartList.filter(
          item => !(item.productId._id === productId && item.size === size)
        );
        
        // cartItemTypes 업데이트
        state.cartItemTypes = state.cartList.length;
        
        // totalPrice 재계산
        state.totalPrice = state.cartList.reduce((total, item) => {
          if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
            return total + (item.productId.price * item.quantity);
          }
          return total;
        }, 0);
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartQty.fulfilled, (state, action) => {
        state.cartItemTypes = action.payload;
      })
      .addCase(getCartQty.rejected, (state, action) => {
        state.cartItemTypes = 0;
      });
  },
});

export default cartSlice.reducer;
export const { initialCart, clearCart } = cartSlice.actions;
