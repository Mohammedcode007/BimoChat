// src/services/upload/uploadHelpers.ts

import type { LocalUploadFile, UploadFolder } from "./types";

export function getFileNameFromUri(uri: string, fallback = "file") {
  const cleanUri = uri.split("?")[0] || uri;
  const name = cleanUri.split("/").pop();

  if (name && name.includes(".")) return name;

  return fallback;
}

export function getMimeTypeFromName(fileName?: string) {
  const name = String(fileName || "").toLowerCase();

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";

  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".webm")) return "video/webm";

  if (name.endsWith(".m4a")) return "audio/m4a";
  if (name.endsWith(".mp3")) return "audio/mpeg";
  if (name.endsWith(".wav")) return "audio/wav";
  if (name.endsWith(".aac")) return "audio/aac";
  if (name.endsWith(".caf")) return "audio/x-caf";
  if (name.endsWith(".3gp")) return "audio/3gpp";
  if (name.endsWith(".amr")) return "audio/amr";

  if (name.endsWith(".pdf")) return "application/pdf";

  return "application/octet-stream";
}

export function normalizeUploadFile(
  file: LocalUploadFile,
  fallbackName = "upload-file"
): Required<LocalUploadFile> {
  const name = file.name || getFileNameFromUri(file.uri, fallbackName);

  let type = file.type || getMimeTypeFromName(name);

  // إصلاح مهم جدًا:
  // بعض تسجيلات Expo تكون .m4a لكن type يطلع audio/mp4
  if (String(name).toLowerCase().endsWith(".m4a")) {
    type = "audio/m4a";
  }

  return {
    uri: file.uri,
    name,
    type,
  };
}

export function getCloudinaryFolder(folder: UploadFolder, userId?: string) {
  const base = "bimo";

  switch (folder) {
    case "avatars":
      return userId ? `${base}/users/${userId}/avatar` : `${base}/avatars`;

    case "avatar-gifs":
      return userId ? `${base}/users/${userId}/avatar-gif` : `${base}/avatar-gifs`;

    case "covers":
      return userId ? `${base}/users/${userId}/cover` : `${base}/covers`;

    case "chat":
      return `${base}/chat`;

    case "rooms":
      return `${base}/rooms`;

    case "badges":
      return `${base}/badges`;

    case "store":
      return `${base}/store`;

    case "voice":
      return `${base}/voice`;

    case "videos":
      return `${base}/videos`;

    case "files":
      return `${base}/files`;

    default:
      return `${base}/uploads`;
  }
}