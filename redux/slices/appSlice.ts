import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ForceUpdateState = {
  required: boolean;
  storeUrl: string | null;
  message: string | null;
  minSupportedVersion: string | null;
  latestVersion: string | null;
};

const initialState: ForceUpdateState = {
  required: false,
  storeUrl: null,
  message: null,
  minSupportedVersion: null,
  latestVersion: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setForceUpdate(state, action: PayloadAction<Partial<ForceUpdateState>>) {
      state.required = true;
      state.storeUrl = action.payload.storeUrl ?? state.storeUrl;
      state.message = action.payload.message ?? state.message;
      state.minSupportedVersion =
        action.payload.minSupportedVersion ?? state.minSupportedVersion;
      state.latestVersion = action.payload.latestVersion ?? state.latestVersion;
    },
    clearForceUpdate() {
      return initialState;
    },
  },
});

export const { setForceUpdate, clearForceUpdate } = appSlice.actions;
export default appSlice.reducer;