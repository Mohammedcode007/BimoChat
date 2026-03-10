// export const uploadToCloudinary = async (
//   uri: string,
//   type: "image" | "video" | "raw" = "image"
// ) => {

//   const data = new FormData();

//   data.append("file", {
//     uri,
//     type:
//       type === "image"
//         ? "image/jpeg"
//         : type === "video"
//         ? "video/mp4"
//         : "application/octet-stream",
//     name:
//       type === "image"
//         ? "upload.jpg"
//         : type === "video"
//         ? "upload.mp4"
//         : "upload.dat",
//   } as any);

//   // 🔥 اسم الـ preset الذي أنشأته
//   data.append("upload_preset", "bimoChat");

//   const res = await fetch(
//     "https://api.cloudinary.com/v1_1/dmejkp0m4/" + type + "/upload",
//     {
//       method: "POST",
//       body: data,
//     }
//   );

//   const json = await res.json();

//   if (!json.secure_url) {
//     console.log("Cloudinary error:", json);
//     throw new Error("Upload failed");
//   }

//   return json.secure_url;
// };

import * as FileSystem from "expo-file-system/legacy";
export const uploadToCloudinary = async (
  uri: string,
  type: "image" | "video" | "raw" = "image"
) => {

  // 🔍 قراءة معلومات الملف
  const fileInfo = await FileSystem.getInfoAsync(uri);

  if (!fileInfo.exists) {
    throw new Error("File not found");
  }

  const sizeMB = (fileInfo.size || 0) / (1024 * 1024);

  // 📏 تحديد الحد الأقصى للحجم
  const MAX_IMAGE_SIZE = 10; // 10MB
  const MAX_VIDEO_SIZE = 50; // 50MB

  if (type === "image" && sizeMB > MAX_IMAGE_SIZE) {
    throw new Error("الصورة أكبر من 10MB");
  }

  if (type === "video" && sizeMB > MAX_VIDEO_SIZE) {
    throw new Error("الفيديو أكبر من 50MB");
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

  // preset
  data.append("upload_preset", "bimoChat");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dmejkp0m4/" + type + "/upload",
    {
      method: "POST",
      body: data,
    }
  );

  const json = await res.json();

  if (!json.secure_url) {
    console.log("Cloudinary error:", json);
    throw new Error("Upload failed");
  }

  return json.secure_url;
};