import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCartQty, clearCart } from "../cart/cartSlice";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// Define initial state
const initialState = {
  orderList: [],
  orderNum: "",
  selectedOrder: {},
  error: "",
  loading: false,
  totalPageNum: 1,
};

// Async thunks
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/order/create", payload);
      if (response.data.success) {
        // 주문 성공 후 장바구니 즉시 비우기
        dispatch(clearCart());
        dispatch(showToastMessage({ status: "success", message: "주문이 성공적으로 생성되었습니다." }));
        return response.data.order;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "주문 생성 중 오류가 발생했습니다.");
    }
  }
);

export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/order");
      if (response.data.success) {
        return response.data.orders;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "주문 조회 중 오류가 발생했습니다.");
    }
  }
);

export const getOrderList = createAsyncThunk(
  "order/getOrderList",
  async (query, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/order/admin", { params: query });
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "주문 목록 조회 중 오류가 발생했습니다.");
    }
  }
);

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/order/${id}`, { status });
      if (response.data.success) {
        dispatch(showToastMessage({ status: "success", message: "주문 상태가 업데이트되었습니다." }));
        return response.data.order;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "주문 상태 업데이트 중 오류가 발생했습니다.");
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearOrderNum: (state) => {
      state.orderNum = "";
    },
  },
  extraReducers: (builder) => {
    // createOrder
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderNum = action.payload.orderNum;
        state.error = "";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // getOrder
    builder
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList = action.payload;
        state.error = "";
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // getOrderList
    builder
      .addCase(getOrderList.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(getOrderList.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList = action.payload.orders;
        state.totalPageNum = action.payload.totalPages;
        state.error = "";
      })
      .addCase(getOrderList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateOrder
    builder
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        // 주문 목록에서 업데이트된 주문 찾아서 상태 변경
        const index = state.orderList.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orderList[index] = action.payload;
        }
        state.error = "";
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedOrder, clearOrderNum } = orderSlice.actions;
export default orderSlice.reducer;
