// services/appConfig.service.ts
import api from "@/services/api";
import { Platform } from "react-native";

export const checkAppConfig = () => {
  return api.get("/app/config", { params: { platform: Platform.OS } });
};