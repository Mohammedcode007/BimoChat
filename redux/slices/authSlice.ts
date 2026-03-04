
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import * as Device from "expo-device";
// import api from "../../services/api";


// /* =====================================================
//    TYPES
// ===================================================== */

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
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   loading: false,
//   isLoggedIn: false,
//   sessions: [],
//   error: null,
// };

// /* =====================================================
//    ADD LOGIN SESSION
// ===================================================== */

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

// /* =====================================================
//    CHECK AUTH
// ===================================================== */

// export const checkAuth = createAsyncThunk(
//   "auth/checkAuth",
//   async (_, thunkAPI) => {
//     try {

//       const token = await AsyncStorage.getItem("token");
//       const user = await AsyncStorage.getItem("user");

//       if (!token) return null;


//       const savedSessions = await AsyncStorage.getItem("loginSessions");

//       return {
//         token,
//         user: user ? JSON.parse(user) : null,
//         sessions: savedSessions ? JSON.parse(savedSessions) : [],
//       };

//     } catch {
//       return null;
//     }
//   }
// );

// /* =====================================================
//    REGISTER
// ===================================================== */

// export const register = createAsyncThunk(
//   "auth/register",
//   async (
//     { username, password }: { username: string; password: string },
//     thunkAPI
//   ) => {
//     try {

//       const res = await api.post("/auth/register", {
//         username,
//         password,
//       });

//       const { user, token } = res.data;

//       await AsyncStorage.setItem("token", token);
//       await AsyncStorage.setItem("user", JSON.stringify(user));


//       const sessions = await addLoginSession();

//       return { user, token, sessions };

//     } catch (err: any) {
//       return thunkAPI.rejectWithValue(
//         err.response?.data?.message || "Registration failed"
//       );
//     }
//   }
// );

// /* =====================================================
//    LOGIN
// ===================================================== */

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
//       await AsyncStorage.setItem("user", JSON.stringify(user));


//       const sessions = await addLoginSession();

//       return { user, token, sessions };

//     } catch (err: any) {
//       return thunkAPI.rejectWithValue(
//         err.response?.data?.message || "Login failed"
//       );
//     }
//   }
// );

// /* =====================================================
//    LOGOUT
// ===================================================== */

// export const logout = createAsyncThunk(
//   "auth/logout",
//   async (_, thunkAPI) => {
//     try {

//       await api.post("/auth/logout");

//       await AsyncStorage.removeItem("token");
//       await AsyncStorage.removeItem("user");


//       return true;

//     } catch (err: any) {
//       return thunkAPI.rejectWithValue("Logout failed");
//     }
//   }
// );

// /* =====================================================
//    TOGGLE INVISIBLE
// ===================================================== */

// export const toggleInvisible = createAsyncThunk(
//   "auth/toggleInvisible",
//   async (invisible: boolean, thunkAPI) => {
//     try {

//       await api.patch("/auth/presence/invisible", {
//         invisible
//       });

//       return invisible;

//     } catch (err: any) {
//       return thunkAPI.rejectWithValue(
//         err.response?.data?.message || "Failed to update visibility"
//       );
//     }
//   }
// );

// /* =====================================================
//    SLICE
// ===================================================== */

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {

//     clearError: state => {
//       state.error = null;
//     },

//     updateUser: (state, action) => {
//       state.user = action.payload;
//       AsyncStorage.setItem("user", JSON.stringify(action.payload));
//     },
//   },

//   extraReducers: builder => {

//     builder

//       .addCase(checkAuth.fulfilled, (state, action) => {
//         if (action.payload) {
//           state.token = action.payload.token;
//           state.user = action.payload.user;
//           state.sessions = action.payload.sessions;
//           state.isLoggedIn = true;
//         }
//       })

//       .addCase(register.fulfilled, (state, action) => {
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.sessions = action.payload.sessions;
//         state.isLoggedIn = true;
//       })

//       .addCase(login.fulfilled, (state, action) => {
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.sessions = action.payload.sessions;
//         state.isLoggedIn = true;
//       })

//       .addCase(logout.fulfilled, state => {
//         state.user = null;
//         state.token = null;
//         state.isLoggedIn = false;
//         state.sessions = [];
//         state.error = null;
//       })

//       .addCase(toggleInvisible.fulfilled, (state, action) => {
//         if (state.user) {
//           state.user.isInvisible = action.payload;

//           if (action.payload === true) {
//             state.user.lastSeen = new Date().toISOString();
//           }

//           AsyncStorage.setItem("user", JSON.stringify(state.user));
//         }
//       });
//   },
// });

// export const { clearError, updateUser } = authSlice.actions;
// export default authSlice.reducer;

// redux/slices/authSlice.ts
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
  hydrated: boolean; // ✅ جديد: هل تم فحص AsyncStorage؟
  isLoggedIn: boolean;
  sessions: LoginSession[];
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  hydrated: false, // ✅ يبدأ false
  isLoggedIn: false,
  sessions: [],
  error: null,
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
   CHECK AUTH
===================================================== */

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, thunkAPI) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");

    if (!token) return null;

    const savedSessions = await AsyncStorage.getItem("loginSessions");

    return {
      token,
      user: user ? JSON.parse(user) : null,
      sessions: savedSessions ? JSON.parse(savedSessions) : [],
    };
  } catch {
    return null;
  }
});

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
    await api.post("/auth/logout");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    return true;
  } catch {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

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
  },

  extraReducers: (builder) => {
    builder
      // ✅ checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
        // hydrated يبقى false لحين انتهاء الفحص
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
          // ✅ مهم: لو لا يوجد token، ثبت الحالة بوضوح
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

      // register
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

      // login
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

      // logout
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

      // toggleInvisible
      .addCase(toggleInvisible.fulfilled, (state, action) => {
        if (state.user) {
          state.user.isInvisible = action.payload;
          if (action.payload === true) {
            state.user.lastSeen = new Date().toISOString();
          }
          AsyncStorage.setItem("user", JSON.stringify(state.user));
        }
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;