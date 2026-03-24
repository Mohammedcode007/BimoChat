import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */

export type ReportTargetType =
  | "user"
  | "tweet"
  | "message"
  | "room"
  | "story"
  | "comment";

export type ReportReason =
  | "spam"
  | "harassment"
  | "sexual"
  | "violence"
  | "hate"
  | "fake_account"
  | "scam"
  | "other";

export type ReportStatus =
  | "pending"
  | "under_review"
  | "resolved"
  | "rejected"
  | "auto_action_taken";

export type ReportItem = {
  _id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetOwnerId?: string | null;

  reason: ReportReason;
  details?: string;

  autoScore: number;
  trustScoreApplied: number;
  matchedReportsCount: number;

  status: ReportStatus;
  autoAction?: string | null;
  autoActionMeta?: Record<string, any> | null;

  reviewedBy?: string | null;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type SubmitReportPayload = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
};

type SubmitReportResponse = {
  success: boolean;
  message: string;
  report: ReportItem;
};

type ReportState = {
  loading: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;

  lastSubmittedReport: ReportItem | null;

  // لو حبيت تستخدم فورم ثابت في بعض الشاشات
  form: {
    targetType: ReportTargetType | null;
    targetId: string;
    reason: ReportReason | null;
    details: string;
  };
};

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState: ReportState = {
  loading: false,
  submitting: false,
  success: false,
  error: null,

  lastSubmittedReport: null,

  form: {
    targetType: null,
    targetId: "",
    reason: null,
    details: "",
  },
};

/* =====================================================
   HELPERS
===================================================== */

function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "حدث خطأ أثناء إرسال البلاغ"
  );
}

/* =====================================================
   ASYNC THUNKS
===================================================== */

export const submitReport = createAsyncThunk<
  SubmitReportResponse,
  SubmitReportPayload,
  { rejectValue: string }
>(
  "report/submitReport",
  async (payload, thunkAPI) => {
    try {
      const body = {
        targetType: payload.targetType,
        targetId: payload.targetId,
        reason: payload.reason,
        details: payload.details?.trim() || "",
      };

      const response = await api.post("/reports", body);

      return response.data as SubmitReportResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    resetReportState: (state) => {
      state.loading = false;
      state.submitting = false;
      state.success = false;
      state.error = null;
      state.lastSubmittedReport = null;
    },

    clearReportError: (state) => {
      state.error = null;
    },

    clearReportSuccess: (state) => {
      state.success = false;
    },

    setReportFormField: (
      state,
      action: PayloadAction<{
        field: keyof ReportState["form"];
        value: string | ReportTargetType | ReportReason | null;
      }>
    ) => {
      const { field, value } = action.payload;
      (state.form[field] as any) = value;
    },

    setReportTarget: (
      state,
      action: PayloadAction<{
        targetType: ReportTargetType;
        targetId: string;
      }>
    ) => {
      state.form.targetType = action.payload.targetType;
      state.form.targetId = action.payload.targetId;
    },

    setReportReason: (state, action: PayloadAction<ReportReason | null>) => {
      state.form.reason = action.payload;
    },

    setReportDetails: (state, action: PayloadAction<string>) => {
      state.form.details = action.payload;
    },

    resetReportForm: (state) => {
      state.form = {
        targetType: null,
        targetId: "",
        reason: null,
        details: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder

      /* ================= SUBMIT REPORT ================= */

      .addCase(submitReport.pending, (state) => {
        state.submitting = true;
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(submitReport.fulfilled, (state, action) => {
        state.submitting = false;
        state.loading = false;
        state.success = true;
        state.error = null;
        state.lastSubmittedReport = action.payload.report;

        // بعد نجاح الإرسال، نفرغ الفورم
        state.form = {
          targetType: null,
          targetId: "",
          reason: null,
          details: "",
        };
      })

      .addCase(submitReport.rejected, (state, action) => {
        state.submitting = false;
        state.loading = false;
        state.success = false;
        state.error = action.payload || "فشل إرسال البلاغ";
      });
  },
});

/* =====================================================
   EXPORT ACTIONS
===================================================== */

export const {
  resetReportState,
  clearReportError,
  clearReportSuccess,
  setReportFormField,
  setReportTarget,
  setReportReason,
  setReportDetails,
  resetReportForm,
} = reportSlice.actions;

/* =====================================================
   SELECTORS
===================================================== */

export const selectReport = (state: RootState) => state.report;
export const selectReportLoading = (state: RootState) => state.report.loading;
export const selectReportSubmitting = (state: RootState) =>
  state.report.submitting;
export const selectReportSuccess = (state: RootState) => state.report.success;
export const selectReportError = (state: RootState) => state.report.error;
export const selectLastSubmittedReport = (state: RootState) =>
  state.report.lastSubmittedReport;
export const selectReportForm = (state: RootState) => state.report.form;

/* =====================================================
   REDUCER
===================================================== */

export default reportSlice.reducer;