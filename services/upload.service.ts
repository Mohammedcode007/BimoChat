
import * as FileSystem from "expo-file-system/legacy";

export const uploadToCloudinary = (
  uri: string,
  type: "image" | "video" | "raw" = "image",
  onProgress?: (percent: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists) {
        reject(new Error("File not found"));
        return;
      }

      const sizeMB = (fileInfo.size || 0) / (1024 * 1024);

      const MAX_IMAGE_SIZE = 10;
      const MAX_VIDEO_SIZE = 50;

      if (type === "image" && sizeMB > MAX_IMAGE_SIZE) {
        reject(new Error("الصورة أكبر من 10MB"));
        return;
      }

      if (type === "video" && sizeMB > MAX_VIDEO_SIZE) {
        reject(new Error("الفيديو أكبر من 50MB"));
        return;
      }

      const data = new FormData();

      data.append("file", {
        uri,
        type:
          type === "image"
            ? "image/jpeg"
            : type === "video"
              ? "video/mp4"
              : "application/octet-stream",
        name:
          type === "image"
            ? "upload.jpg"
            : type === "video"
              ? "upload.mp4"
              : "upload.dat",
      } as any);

      data.append("upload_preset", "bimoChat");

      const xhr = new XMLHttpRequest();

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/dmejkp0m4/${type}/upload`
      );

xhr.upload.onprogress = (event) => {
  if (event.lengthComputable && onProgress) {
    const rawPercent = (event.loaded / event.total) * 100;
    const percent = Math.min(100, Math.max(0, rawPercent));
    onProgress(percent);
  }
};

xhr.onload = () => {
  try {
    const json = JSON.parse(xhr.responseText);

    if (!json.secure_url) {
      console.log("Cloudinary error:", json);
      reject(new Error("Upload failed"));
      return;
    }

    onProgress?.(100);
    resolve(json.secure_url);
  } catch (e) {
    reject(new Error("Invalid Cloudinary response"));
  }
};

      xhr.onerror = () => {
        reject(new Error("Upload failed"));
      };

      xhr.send(data);
    } catch (error) {
      reject(error);
    }
  });
};