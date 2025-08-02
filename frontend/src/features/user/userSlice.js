import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {}
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {};
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
  async (_, { rejectWithValue }) => {}
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
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
