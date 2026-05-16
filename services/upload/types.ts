// src/services/upload/types.ts

export type UploadResourceType = "image" | "video" | "raw";

export type LocalUploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type UploadFolder =
  | "avatars"
  | "avatar-gifs"
  | "covers"
  | "chat"
  | "rooms"
  | "badges"
  | "store"
  | "voice"
  | "videos"
  | "files";

export type UploadResponseData = {
  url: string;
  publicId: string;
  resourceType: UploadResourceType;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
};

export type UploadApiResponse = {
  success: boolean;
  message?: string;
  data?: UploadResponseData;
};