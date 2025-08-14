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
  updatingItems: {}, // 개별 아이템의 수량 변경 상태를 추적
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
      dispatch(getCartList());
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
      dispatch(getCartList());
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
  async ({ productId, size, quantity }, { rejectWithValue, dispatch, getState }) => {
    try {
      // 낙관적 업데이트를 위해 현재 상태를 저장
      const state = getState();
      const currentItem = state.cart.cartList.find(
        item => item.productId._id === productId && item.size === size
      );
      
      if (!currentItem) {
        throw new Error("아이템을 찾을 수 없습니다.");
      }
      
      const response = await api.put("/cart", { productId, size, quantity });
      return response.data;
    } catch (error) {
      // 에러 발생 시 원래 수량으로 되돌리기 위해 현재 상태 반환
      const state = getState();
      const currentItem = state.cart.cartList.find(
        item => item.productId._id === productId && item.size === size
      );
      
      dispatch(showToastMessage({ 
        message: error.response?.data?.message || "수량 변경 실패", 
        status: "error" 
      }));
      return rejectWithValue({ error: error.response?.data?.message, originalItem: currentItem });
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
    // 낙관적 업데이트를 위한 리듀서
    updateQuantityOptimistically: (state, action) => {
      const { productId, size, quantity } = action.payload;
      const item = state.cartList.find(
        item => item.productId._id === productId && item.size === size
      );
      
      if (item) {
        item.quantity = quantity;
        // totalPrice 즉시 재계산
        state.totalPrice = state.cartList.reduce((total, item) => {
          if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
            return total + (item.productId.price * item.quantity);
          }
          return total;
        }, 0);
      }
    },
    // 수량 변경 실패 시 원래 상태로 되돌리기
    revertQuantityUpdate: (state, action) => {
      const { productId, size, originalQuantity } = action.payload;
      const item = state.cartList.find(
        item => item.productId._id === productId && item.size === size
      );
      
      if (item) {
        item.quantity = originalQuantity;
        // totalPrice 재계산
        state.totalPrice = state.cartList.reduce((total, item) => {
          if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
            return total + (item.productId.price * item.quantity);
          }
          return total;
        }, 0);
      }
    },
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
      .addCase(updateQty.pending, (state, action) => {
        const { productId, size } = action.meta.arg;
        // 개별 아이템의 로딩 상태 설정
        state.updatingItems[`${productId}-${size}`] = true;
      })
      .addCase(updateQty.fulfilled, (state, action) => {
        const { productId, size } = action.meta.arg;
        // 개별 아이템의 로딩 상태 해제
        delete state.updatingItems[`${productId}-${size}`];
        state.error = "";
        
        // 서버 응답으로 최종 상태 동기화
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
        const { productId, size } = action.meta.arg;
        // 개별 아이템의 로딩 상태 해제
        delete state.updatingItems[`${productId}-${size}`];
        state.error = action.payload?.error || action.payload;
        
        // 원래 수량으로 되돌리기
        if (action.payload?.originalItem) {
          const item = state.cartList.find(
            item => item.productId._id === productId && item.size === size
          );
          if (item) {
            item.quantity = action.payload.originalItem.quantity;
            // totalPrice 재계산
            state.totalPrice = state.cartList.reduce((total, item) => {
              if (item.productId && typeof item.productId.price === 'number' && typeof item.quantity === 'number') {
                return total + (item.productId.price * item.quantity);
              }
              return total;
            }, 0);
          }
        }
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
export const { initialCart, clearCart, updateQuantityOptimistically, revertQuantityUpdate } = cartSlice.actions;
