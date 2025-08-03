import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      return response.data;
    } catch (err) {
      return rejectWithValue(err.error)
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {
  // 토큰 제거
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  
  // 사용자 상태 초기화
  dispatch(clearUser());
  
  // 장바구니 초기화
  dispatch(initialCart());
  
  // 토스트 메시지 표시
  dispatch(showToastMessage({ message: "로그아웃되었습니다.", status: "success" }));
};
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {

      const response = await api.post("/user", {email, name, password})
      dispatch(showToastMessage({message: "회원가입을 성공했습니다!", status: "success"}))
      navigate("/login")
      return response.data.data;

  }
    catch(err) {
      dispatch(showToastMessage({message: "회원가입을 실패했습니다!", status: "error"}))
      return rejectWithValue(err.error)
    }
    }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    console.log("🔍 DEBUG - loginWithToken started");
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      console.log("🔍 DEBUG - Token check:");
      console.log("  - Token from sessionStorage:", sessionStorage.getItem("token"));
      console.log("  - Token from localStorage:", localStorage.getItem("token"));
      console.log("  - Final token:", token);
      console.log("  - Token found:", token ? "Yes" : "No");
      
      if (!token) {
        console.log("❌ No token found, rejecting");
        return rejectWithValue("No token found");
      }
      
      console.log("🚀 Making request to /auth/me");
      console.log("🔍 DEBUG - About to make API call");
      const response = await api.get("/auth/me");
      
      console.log("✅ Response received:", response.data);
      return response.data;
    } catch (err) {
      console.log("🚨 Error in loginWithToken:");
      console.log("  - Error object:", err);
      console.log("  - Error message:", err.message);
      console.log("  - Error code:", err.code);
      console.log("  - Error response:", err.response);
      console.log("  - Error config:", err.config);
      
      // 401 Unauthorized 에러일 때만 토큰 제거
      if (err.response?.status === 401) {
        console.log("🔐 401 error, removing token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        return rejectWithValue("Token expired or invalid");
      }
      
      // 네트워크 에러나 연결 실패 시 토큰을 유지하고 조용히 실패
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        console.log("🌐 Network error, keeping token and failing silently");
        return rejectWithValue("Network error");
      }
      
      // 다른 에러는 토큰을 유지하고 에러만 반환
      console.log("⚠️ Other error, keeping token");
      return rejectWithValue(err.response?.data?.message || "Network error");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.loginError = null;
      state.registrationError = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.registrationError = null;
      state.success = true;
    })
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
    })
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registrationError = action.payload;
      state.loading = false;
    })
    builder.addCase(loginWithEmail.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.loading = false;
      state.loginError = null;
      state.success = true;
      sessionStorage.setItem("token", action.payload.token);
    })
    builder.addCase(loginWithEmail.pending, (state) => {
      state.loading = true;
    })
    builder.addCase(loginWithEmail.rejected, (state, action) => {
      state.loginError = action.payload;
      state.loading = false;
    })
    builder.addCase(loginWithToken.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.loading = false;
      state.loginError = null;
      state.success = true;
    })
    builder.addCase(loginWithToken.pending, (state) => {
      state.loading = true;
    })
    builder.addCase(loginWithToken.rejected, (state, action) => {
      console.log("loginWithToken rejected with payload:", action.payload);
      
      // 토큰이 없거나 만료된 경우에만 사용자 상태 초기화
      if (action.payload === "No token found" || action.payload === "Token expired or invalid") {
        console.log("Clearing user state due to token issue");
        state.user = null;
      } else if (action.payload === "Network error") {
        // 네트워크 에러는 조용히 처리하고 사용자 상태 유지
        console.log("Network error, keeping user state");
      } else {
        console.log("Keeping user state for other errors");
      }
      state.loading = false;
      state.loginError = null;
    })
  },
});
export const { clearErrors, clearUser } = userSlice.actions;
export default userSlice.reducer;
