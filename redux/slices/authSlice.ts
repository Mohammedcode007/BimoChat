// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import * as Device from "expo-device";
// import api from "../../services/api";
// import { connectSocket, disconnectSocket } from "../../services/socket";

// /* ================= TYPES ================= */

// interface LoginSession {
//   id: string;
//   device: string;
//   country: string;
//   time: string;
// }

// interface AuthState {
//   user: any | null;
//   token: string | null;
//   loading: boolean;
//   isLoggedIn: boolean;
//   sessions: LoginSession[];
// }

// /* ================= INITIAL STATE ================= */

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   loading: false,
//   isLoggedIn: false,
//   sessions: [],
// };

// /* ================= ADD LOGIN SESSION ================= */

// const addLoginSession = async () => {
//   const device =
//     Device.osName === "Android"
//       ? "Android"
//       : Device.osName === "iOS"
//       ? "iPhone"
//       : "Web / Other";

//   const country = "مصر";

//   const newSession: LoginSession = {
//     id: Date.now().toString(),
//     device,
//     country,
//     time: new Date().toLocaleString(),
//   };

//   const saved = await AsyncStorage.getItem("loginSessions");
//   const sessions: LoginSession[] = saved ? JSON.parse(saved) : [];

//   sessions.unshift(newSession);

//   await AsyncStorage.setItem("loginSessions", JSON.stringify(sessions));

//   return sessions;
// };

// /* ================= CHECK AUTH ================= */

// export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
//   const token = await AsyncStorage.getItem("token");

//   if (!token) return null;

//   connectSocket(token);

//   const savedSessions = await AsyncStorage.getItem("loginSessions");

//   return {
//     token,
//     sessions: savedSessions ? JSON.parse(savedSessions) : [],
//   };
// });

// /* ================= LOGIN ================= */

// export const login = createAsyncThunk(
//   "auth/login",
//   async (
//     { username, password }: { username: string; password: string },
//     thunkAPI
//   ) => {
//     try {
//       const res = await api.post("/auth/login", {
//         username,
//         password,
//       });

//       const { user, token } = res.data;

//       await AsyncStorage.setItem("token", token);

//       connectSocket(token);

//       const sessions = await addLoginSession();

//       return { user, token, sessions };
//     } catch (err: any) {
//       return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
//   }
// );

// /* ================= LOGOUT ================= */

// export const logout = createAsyncThunk("auth/logout", async () => {
//   await AsyncStorage.removeItem("token");
//   disconnectSocket();
//   return true;
// });

// /* ================= SLICE ================= */

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {},
//   extraReducers: builder => {
//     builder

//       /* ===== CHECK AUTH ===== */
//       .addCase(checkAuth.pending, state => {
//         state.loading = true;
//       })
//       .addCase(checkAuth.fulfilled, (state, action) => {
//         state.loading = false;

//         if (action.payload) {
//           state.token = action.payload.token;
//           state.isLoggedIn = true;
//           state.sessions = action.payload.sessions;
//         }
//       })
//       .addCase(checkAuth.rejected, state => {
//         state.loading = false;
//       })

//       /* ===== LOGIN ===== */
//       .addCase(login.pending, state => {
//         state.loading = true;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.sessions = action.payload.sessions;
//         state.isLoggedIn = true;
//       })
//       .addCase(login.rejected, state => {
//         state.loading = false;
//       })

//       /* ===== LOGOUT ===== */
//       .addCase(logout.fulfilled, state => {
//         state.user = null;
//         state.token = null;
//         state.isLoggedIn = false;
//       });
//   },
// });

// export default authSlice.reducer;

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Device from "expo-device";
import api from "../../services/api";
import { connectSocket, disconnectSocket } from "../../services/socket";

/* ================= TYPES ================= */

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
  isLoggedIn: boolean;
  sessions: LoginSession[];
  error: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  isLoggedIn: false,
  sessions: [],
  error: null,
};

/* ================= ADD LOGIN SESSION ================= */

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

/* ================= CHECK AUTH ================= */

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) return null;

  connectSocket(token);

  const savedSessions = await AsyncStorage.getItem("loginSessions");

  return {
    token,
    sessions: savedSessions ? JSON.parse(savedSessions) : [],
  };
});

/* ================= REGISTER ================= */

export const register = createAsyncThunk(
  "auth/register",
  async (
    { username, password }: { username: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/auth/register", {
        username,
        password,
      });

      const { user, token } = res.data;

      await AsyncStorage.setItem("token", token);

      connectSocket(token);

      const sessions = await addLoginSession();

      return { user, token, sessions };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

/* ================= LOGIN ================= */

export const login = createAsyncThunk(
  "auth/login",
  async (
    { username, password }: { username: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const { user, token } = res.data;

      await AsyncStorage.setItem("token", token);

      connectSocket(token);

      const sessions = await addLoginSession();

      return { user, token, sessions };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

/* ================= LOGOUT ================= */

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("token");
  disconnectSocket();
  return true;
});

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder

      /* ===== CHECK AUTH ===== */
      .addCase(checkAuth.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.token = action.payload.token;
          state.sessions = action.payload.sessions;
          state.isLoggedIn = true;
        }
      })
      .addCase(checkAuth.rejected, state => {
        state.loading = false;
      })

      /* ===== REGISTER ===== */
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessions = action.payload.sessions;
        state.isLoggedIn = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== LOGIN ===== */
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessions = action.payload.sessions;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== LOGOUT ===== */
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.sessions = [];
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
