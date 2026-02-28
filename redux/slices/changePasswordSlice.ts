import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

interface ChangePasswordState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ChangePasswordState = {
  loading: false,
  success: false,
  error: null,
};

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    thunkAPI
  ) => {
    try {
      const cur = (currentPassword ?? "").trim();
      const next = (newPassword ?? "").trim();

      if (!cur) return thunkAPI.rejectWithValue("Current password is required");
      if (!next) return thunkAPI.rejectWithValue("New password is required");
      if (next.length < 6)
        return thunkAPI.rejectWithValue("New password must be at least 6 characters");

      const res = await api.patch("/users/password", {
        oldPassword: cur,     // ✅ مهم: اسم الحقل كما في الباك
        newPassword: next,
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to change password"
      );
    }
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {
    resetChangePasswordState: () => initialState,
    clearChangePasswordError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Failed to change password";
      });
  },
});

export const { resetChangePasswordState, clearChangePasswordError } =
  changePasswordSlice.actions;

export default changePasswordSlice.reducer;