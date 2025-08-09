import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get("/product", { params: {...query} });
      if (response.status !== 200) {
        throw new Error(response.data.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      if (response.status !== 200) {
        throw new Error(response.data.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async ({ formData, searchQuery = {} }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);
      if (response.status !== 200) {
        throw new Error(response.data.error);
      }
      // 토스트 메시지 띄우기
      dispatch(showToastMessage({
        message: "상품이 성공적으로 생성되었습니다.",
        status: "success",
      }));
      // 상품 목록 새로고침 (현재 검색 조건 유지)
      dispatch(getProductList(searchQuery));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async ({ id, searchQuery = {} }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/${id}`);
      if (response.status !== 200) {
        throw new Error(response.data.error);
      }
      // 토스트 메시지 띄우기
      dispatch(showToastMessage({
        message: "상품이 성공적으로 삭제되었습니다.",
        status: "success",
      }));
      // 상품 목록 새로고침 (현재 검색 조건 유지)
      dispatch(getProductList(searchQuery));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ _id, searchQuery = {}, ...formData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/product/${_id}`, formData);
      if (response.status !== 200) {
        throw new Error(response.data.error);
      }
      // 토스트 메시지 띄우기
      dispatch(showToastMessage({
        message: "상품이 성공적으로 수정되었습니다.",
        status: "success",
      }));
      // 상품 목록 새로고침 (현재 검색 조건 유지)
      dispatch(getProductList(searchQuery));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const checkSkuDuplicate = createAsyncThunk(
  "products/checkSkuDuplicate",
  async ({ sku, productId }, { rejectWithValue }) => {
    try {
      const params = { sku };
      if (productId) {
        params.productId = productId;
      }
      const response = await api.get("/product/check-sku", { params });
      if (response.status !== 200) {
        throw new Error(response.data.error);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
    skuValidation: {
      isChecking: false,
      isDuplicate: false,
      message: "",
      isValid: false,
    },
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
    clearSkuValidation: (state) => {
      state.skuValidation = {
        isChecking: false,
        isDuplicate: false,
        message: "",
        isValid: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || action.payload || "상품 생성 중 오류가 발생했습니다.";
      state.success = false;
    });
    builder.addCase(editProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(editProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(editProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || action.payload || "상품 수정 중 오류가 발생했습니다.";
      state.success = false;
    });
    builder.addCase(deleteProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });
    builder.addCase(getProductList.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProductList.fulfilled, (state, action) => {
      state.loading = false;
      state.productList = action.payload.data;
      state.totalPageNum = action.payload.totalPageNum;
      state.error = "";
    });
    builder.addCase(getProductList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(getProductDetail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProductDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload.data;
      state.error = "";
    });
    builder.addCase(getProductDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(checkSkuDuplicate.pending, (state) => {
      state.skuValidation.isChecking = true;
    });
    builder.addCase(checkSkuDuplicate.fulfilled, (state, action) => {
      state.skuValidation.isChecking = false;
      state.skuValidation.isDuplicate = action.payload.isDuplicate;
      state.skuValidation.message = action.payload.message;
      state.skuValidation.isValid = !action.payload.isDuplicate;
    });
    builder.addCase(checkSkuDuplicate.rejected, (state, action) => {
      state.skuValidation.isChecking = false;
      state.skuValidation.isDuplicate = false;
      state.skuValidation.message = "SKU 검증 중 오류가 발생했습니다.";
      state.skuValidation.isValid = false;
    });
  },
});

export const { setSelectedProduct, setFilteredList, clearError, clearSkuValidation } =
  productSlice.actions;
export default productSlice.reducer;
