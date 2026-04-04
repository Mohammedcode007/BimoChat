
// redux/slices/authSlice.ts

import { cleanupFCMTokenListener, removeFCMTokenFromBackend } from "@/services/fcm";
import { isTokenExpired } from "@/utils/token";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Device from "expo-device";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface LoginSession {
  id: string;
  device: string;
  country: string;
  time: string;
}

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  isLoggedIn: boolean;
  sessions: LoginSession[];
  error: string | null;

  // ✅ Forgot Password / OTP
  forgotPasswordLoading: boolean;
  verifyOtpLoading: boolean;
  resetPasswordLoading: boolean;

  forgotPasswordSuccess: boolean;
  otpVerified: boolean;
  passwordResetSuccess: boolean;

  resetEmail: string | null;
  otpCooldownSeconds: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  hydrated: false,
  isLoggedIn: false,
  sessions: [],
  error: null,

  // ✅ Forgot Password / OTP
  forgotPasswordLoading: false,
  verifyOtpLoading: false,
  resetPasswordLoading: false,

  forgotPasswordSuccess: false,
  otpVerified: false,
  passwordResetSuccess: false,

  resetEmail: null,
  otpCooldownSeconds: null,
};

/* =====================================================
   ADD LOGIN SESSION
===================================================== */

const addLoginSession = async () => {
  const device =
    Device.osName === "Android"
      ? "Android"
      : Device.osName === "iOS"
        ? "iPhone"
        : "Web / Other";

  const country = "مصر";

  const newSession: LoginSession = {
    id: Date.now().toString(),
    device,
    country,
    time: new Date().toLocaleString(),
  };

  const saved = await AsyncStorage.getItem("loginSessions");
  const sessions: LoginSession[] = saved ? JSON.parse(saved) : [];

  sessions.unshift(newSession);

  await AsyncStorage.setItem("loginSessions", JSON.stringify(sessions));

  return sessions;
};

/* =====================================================
   GOOGLE LOGIN
===================================================== */

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (
    {
      idToken,
      username,
      email,
      photo,
    }: {
      idToken: string;
      username?: string;
      email?: string;
      photo?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/auth/google", {
        idToken,
        username,
        email,
        photo,
      });

      const { user, token } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      const sessions = await addLoginSession();

      return { user, token, sessions };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Google login failed"
      );
    }
  }
);

/* =====================================================
   CHECK AUTH
===================================================== */

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      if (!token) return null;

      const expired = isTokenExpired(token);

      if (expired) {
        await AsyncStorage.multiRemove(["token", "user"]);
        return null;
      }

      const savedSessions = await AsyncStorage.getItem("loginSessions");

      return {
        token,
        user: user ? JSON.parse(user) : null,
        sessions: savedSessions ? JSON.parse(savedSessions) : [],
      };
    } catch {
      return null;
    }
  }
);

/* =====================================================
   REGISTER
===================================================== */

export const register = createAsyncThunk(
  "auth/register",
  async ({ username, password }: { username: string; password: string }, thunkAPI) => {
    try {
      const res = await api.post("/auth/register", { username, password });
      const { user, token } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      const sessions = await addLoginSession();
      return { user, token, sessions };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

/* =====================================================
   LOGIN
===================================================== */

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      const { user, token } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      const sessions = await addLoginSession();
      return { user, token, sessions };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

/* =====================================================
   LOGOUT
===================================================== */

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    // ✅ احذف التوكن من المستخدم الحالي قبل مسح auth
    await removeFCMTokenFromBackend();

    try {
      await api.post("/auth/logout");
    } catch {
      // تجاهل فشل logout من السيرفر
    }

    cleanupFCMTokenListener();

    await AsyncStorage.multiRemove(["token", "user"]);

    return true;
  } catch {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});
// export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
//   try {
//     try {
//       await api.post("/auth/logout");
//     } catch {
//       // تجاهل فشل logout من السيرفر
//     }

//     await AsyncStorage.multiRemove(["token", "user"]);
//     return true;
//   } catch {
//     return thunkAPI.rejectWithValue("Logout failed");
//   }
// });

/* =====================================================
   TOGGLE INVISIBLE
===================================================== */

export const toggleInvisible = createAsyncThunk(
  "auth/toggleInvisible",
  async (invisible: boolean, thunkAPI) => {
    try {
      await api.patch("/auth/presence/invisible", { invisible });
      return invisible;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update visibility"
      );
    }
  }
);

/* =====================================================
   FORGOT PASSWORD
===================================================== */

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();

      const res = await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      return {
        message: res.data?.message || "Verification code sent",
        email: normalizedEmail,
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to send verification code"
      );
    }
  }
);

/* =====================================================
   VERIFY RESET OTP
===================================================== */

export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async (
    { email, otp }: { email: string; otp: string },
    thunkAPI
  ) => {
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedOtp = String(otp || "").trim();

      const res = await api.post("/auth/verify-reset-otp", {
        email: normalizedEmail,
        otp: normalizedOtp,
      });

      return {
        message: res.data?.message || "OTP verified successfully",
        email: normalizedEmail,
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Invalid or expired code"
      );
    }
  }
);

/* =====================================================
   RESET PASSWORD
===================================================== */

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      email,
      otp,
      newPassword,
    }: {
      email: string;
      otp: string;
      newPassword: string;
    },
    thunkAPI
  ) => {
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedOtp = String(otp || "").trim();
      const cleanPassword = String(newPassword || "").trim();

      const res = await api.post("/auth/reset-password", {
        email: normalizedEmail,
        otp: normalizedOtp,
        newPassword: cleanPassword,
      });

      return {
        message: res.data?.message || "Password reset successfully",
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    updateUser: (state, action) => {
      state.user = action.payload;
      AsyncStorage.setItem("user", JSON.stringify(action.payload));
    },

    forceLogout: (state) => {
      state.loading = false;
      state.hydrated = true;
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.sessions = [];
      state.error = null;
    },

    // ✅ مسح حالة forgot password / otp
    clearForgotPasswordState: (state) => {
      state.forgotPasswordLoading = false;
      state.verifyOtpLoading = false;
      state.resetPasswordLoading = false;

      state.forgotPasswordSuccess = false;
      state.otpVerified = false;
      state.passwordResetSuccess = false;

      state.resetEmail = null;
      state.otpCooldownSeconds = null;
      state.error = null;
    },

    // ✅ عند الانتقال بين الشاشات
    setResetEmail: (state, action) => {
      state.resetEmail = action.payload;
    },

    clearOtpVerified: (state) => {
      state.otpVerified = false;
    },

    clearPasswordResetSuccess: (state) => {
      state.passwordResetSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =========================
         GOOGLE LOGIN
      ========================= */
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessions = action.payload.sessions;
        state.isLoggedIn = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Google login failed";
      })

      /* =========================
         CHECK AUTH
      ========================= */
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;

        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.sessions = action.payload.sessions;
          state.isLoggedIn = true;
        } else {
          state.token = null;
          state.user = null;
          state.sessions = [];
          state.isLoggedIn = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.hydrated = true;
        state.token = null;
        state.user = null;
        state.sessions = [];
        state.isLoggedIn = false;
      })

      /* =========================
         REGISTER
      ========================= */
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessions = action.payload.sessions;
        state.isLoggedIn = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Registration failed";
      })

      /* =========================
         LOGIN
      ========================= */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessions = action.payload.sessions;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      })

      /* =========================
         LOGOUT
      ========================= */
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.hydrated = true;
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.sessions = [];
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Logout failed";
      })

      /* =========================
         TOGGLE INVISIBLE
      ========================= */
      .addCase(toggleInvisible.fulfilled, (state, action) => {
        if (state.user) {
          state.user.isInvisible = action.payload;
          if (action.payload === true) {
            state.user.lastSeen = new Date().toISOString();
          }
          AsyncStorage.setItem("user", JSON.stringify(state.user));
        }
      })

      /* =========================
         FORGOT PASSWORD
      ========================= */
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordSuccess = false;
        state.passwordResetSuccess = false;
        state.otpVerified = false;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.resetEmail = action.payload.email;
        state.otpCooldownSeconds = 60;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = false;
        state.error = (action.payload as string) || "Failed to send verification code";
      })

      /* =========================
         VERIFY RESET OTP
      ========================= */
      .addCase(verifyResetOtp.pending, (state) => {
        state.verifyOtpLoading = true;
        state.otpVerified = false;
        state.error = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state, action) => {
        state.verifyOtpLoading = false;
        state.otpVerified = true;
        state.resetEmail = action.payload.email;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.otpVerified = false;
        state.error = (action.payload as string) || "Invalid or expired code";
      })

      /* =========================
         RESET PASSWORD
      ========================= */
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.passwordResetSuccess = false;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.passwordResetSuccess = true;
        state.forgotPasswordSuccess = false;
        state.otpVerified = false;
        state.otpCooldownSeconds = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.passwordResetSuccess = false;
        state.error = (action.payload as string) || "Failed to reset password";
      });
  },
});

export const {
  clearError,
  updateUser,
  forceLogout,
  clearForgotPasswordState,
  setResetEmail,
  clearOtpVerified,
  clearPasswordResetSuccess,
} = authSlice.actions;

export default authSlice.reducer;