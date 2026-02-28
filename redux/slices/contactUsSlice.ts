// redux/slices/contactUsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface ContactUsMessagePayload {
  content: string;
}

interface ContactUsState {
  loading: boolean;
  hydrated: boolean; // ✅ مفيد لو هتخزن draft لاحقًا (اختياري هنا)
  success: boolean;
  error: string | null;

  // (اختياري) آخر رد من السيرفر لو تحب تستخدمه
  lastResult: any | null;
}

const initialState: ContactUsState = {
  loading: false,
  hydrated: true, // هنا لا يوجد AsyncStorage ضروري، نخليها true مباشرة
  success: false,
  error: null,
  lastResult: null,
};

/* =====================================================
   SEND CONTACT US MESSAGE (TEXT ONLY)
===================================================== */

export const sendContactUsMessage = createAsyncThunk(
  "contactUs/send",
  async ({ content }: ContactUsMessagePayload, thunkAPI) => {
    try {
      const text = (content ?? "").trim();
      if (!text) {
        return thunkAPI.rejectWithValue("Message content is required");
      }
      if (text.length > 2000) {
        return thunkAPI.rejectWithValue("Message too long");
      }

      // ✅ Endpoint:
      // لو app.use("/api/contact-us", routes) والراوت POST "/" => api.post("/contact-us")
      const res = await api.post("/contact-us", { content: text });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to send message"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const contactUsSlice = createSlice({
  name: "contactUs",
  initialState,
  reducers: {
    clearContactUsError: (state) => {
      state.error = null;
    },

    resetContactUsState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.lastResult = null;
      // hydrated تظل كما هي
    },
  },
  extraReducers: (builder) => {
    builder
      // sendContactUsMessage
      .addCase(sendContactUsMessage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendContactUsMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastResult = action.payload;
      })
      .addCase(sendContactUsMessage.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Failed to send message";
      });
  },
});

export const { clearContactUsError, resetContactUsState } =
  contactUsSlice.actions;

export default contactUsSlice.reducer;