// src/services/upload/uploadApi.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import type {
  LocalUploadFile,
  UploadApiResponse,
  UploadFolder,
  UploadResponseData,
} from "./types";

import { getCloudinaryFolder, normalizeUploadFile } from "./uploadHelpers";

/**
 * مهم:
 * لا تضع localhost هنا في الهاتف.
 * استخدم الدومين الحقيقي أو IP الجهاز لو تعمل محليًا.
 */
const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest2?.extra?.expoClient?.extra?.apiUrl ||
  "https://te-bot.site";

/**
 * إزالة / من آخر الرابط حتى لا يصبح:
 * https://te-bot.site//api/upload/single
 */
const API_URL = String(RAW_API_URL).replace(/\/+$/, "");

const APP_VERSION =
  Constants.expoConfig?.version ||
  Constants.manifest2?.extra?.expoClient?.version ||
  "1.0.0";

const PLATFORM =
  Platform.OS === "ios"
    ? "ios"
    : Platform.OS === "android"
    ? "android"
    : "web";

const UPLOAD_TIMEOUT_MS = 60_000;

type UploadSingleOptions = {
  file: LocalUploadFile;
  folder: UploadFolder;
  userId?: string;
  endpoint?: string;
  token?: string;
  extraFields?: Record<string, string | number | boolean | undefined | null>;
};

type UploadMultipleOptions = {
  files: LocalUploadFile[];
  folder: UploadFolder;
  userId?: string;
  endpoint?: string;
  token?: string;
  extraFields?: Record<string, string | number | boolean | undefined | null>;
};

async function getToken(providedToken?: string) {
  if (providedToken) return providedToken;

  const token =
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("accessToken")) ||
    "";

  return token;
}

function appendExtraFields(
  formData: FormData,
  fields?: Record<string, string | number | boolean | undefined | null>
) {
  if (!fields) return;

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
}

function getUploadUrl(endpoint: string) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
}

function createUploadHeaders(authToken: string) {
  return {
    Accept: "application/json",

    /**
     * مهم:
     * لا تضف Content-Type هنا.
     * React Native يضيف multipart boundary تلقائيًا.
     */

    /**
     * لأن عندك في الباك enforceMinVersion
     * وهذا غالبًا يحتاج x-platform و x-app-version.
     */
    "x-platform": PLATFORM,
    "x-app-version": APP_VERSION,

    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}

function logUploadStart(params: {
  mode: "single" | "multiple";
  url: string;
  folder: string;
  token: string;
  files: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
  extraFields?: Record<string, string | number | boolean | undefined | null>;
}) {


  params.files.forEach((file, index) => {

  });

  if (params.extraFields) {
  }

}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = UPLOAD_TIMEOUT_MS
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseUploadResponse(response: Response) {
  const text = await response.text();


  let json: UploadApiResponse;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid upload response from server. Status: ${response.status}`
    );
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Upload failed. Status: ${response.status}`);
  }

  if (!json.data) {
    throw new Error("Upload response data is missing");
  }

  return json.data;
}

function normalizeNetworkError(error: any, url: string) {
  const message = String(error?.message || error || "");



  if (error?.name === "AbortError") {
    return new Error("Upload timeout. Please check your internet connection.");
  }

  if (message.toLowerCase().includes("network request failed")) {
    return new Error(
      `Network request failed. Check backend URL and server connection: ${url}`
    );
  }

  return error instanceof Error ? error : new Error(message || "Upload failed");
}

export async function uploadSingleFile({
  file,
  folder,
  userId,
  endpoint = "/api/upload/single",
  token,
  extraFields,
}: UploadSingleOptions): Promise<UploadResponseData> {
  const authToken = await getToken(token);

  const normalized = normalizeUploadFile(file, "upload-file");
  const cloudinaryFolder = getCloudinaryFolder(folder, userId);
  const url = getUploadUrl(endpoint);

  const formData = new FormData();

  formData.append("file", {
    uri: normalized.uri,
    name: normalized.name,
    type: normalized.type,
  } as any);

  formData.append("folder", cloudinaryFolder);

  appendExtraFields(formData, extraFields);

  logUploadStart({
    mode: "single",
    url,
    folder: cloudinaryFolder,
    token: authToken,
    files: [
      {
        uri: normalized.uri,
        name: normalized.name,
        type: normalized.type,
      },
    ],
    extraFields,
  });

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: createUploadHeaders(authToken),
      body: formData,
    });

    const parsed = await parseUploadResponse(response);


    return parsed;
  } catch (error: any) {
    throw normalizeNetworkError(error, url);
  }
}

export async function uploadMultipleFiles({
  files,
  folder,
  userId,
  endpoint = "/api/upload/multiple",
  token,
  extraFields,
}: UploadMultipleOptions): Promise<UploadResponseData[]> {
  const authToken = await getToken(token);

  const cloudinaryFolder = getCloudinaryFolder(folder, userId);
  const url = getUploadUrl(endpoint);

  const formData = new FormData();

  const normalizedFiles = files.map((file, index) =>
    normalizeUploadFile(file, `upload-file-${index + 1}`)
  );

  normalizedFiles.forEach((file) => {
    formData.append("files", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  });

  formData.append("folder", cloudinaryFolder);

  appendExtraFields(formData, extraFields);

  logUploadStart({
    mode: "multiple",
    url,
    folder: cloudinaryFolder,
    token: authToken,
    files: normalizedFiles.map((file) => ({
      uri: file.uri,
      name: file.name,
      type: file.type,
    })),
    extraFields,
  });

  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: createUploadHeaders(authToken),
      body: formData,
    });

    const text = await response.text();


    let json: {
      success: boolean;
      message?: string;
      data?: UploadResponseData[];
    };

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid upload response from server. Status: ${response.status}`
      );
    }

    if (!response.ok || !json.success) {
      throw new Error(json.message || `Upload failed. Status: ${response.status}`);
    }

    if (!Array.isArray(json.data)) {
      throw new Error("Upload response data is invalid");
    }


    return json.data;
  } catch (error: any) {
    throw normalizeNetworkError(error, url);
  }
}