import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      return response.data;
    } catch (err) {
      console.log("Login error:", err);
      const errorMessage = err.message || "로그인에 실패했습니다.";
      dispatch(showToastMessage({ message: errorMessage, status: "error" }));
      return rejectWithValue(errorMessage);
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
    { email, name, password, adminSecret, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {

      const response = await api.post("/user", {email, name, password, adminSecret})
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
    try {
      const token = sessionStorage.getItem("token")
      
      if (!token) {
        return rejectWithValue("No token found");
      }
      
      const response = await api.get("/auth/me");
      return response.data;

    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue(err.error);
      }
      
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
  },
});
export const { clearErrors, clearUser } = userSlice.actions;
export default userSlice.reducer;
