export const uploadToCloudinary = async (
  uri: string,
  type: "image" | "video" | "raw" = "image"
) => {

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

  // 🔥 اسم الـ preset الذي أنشأته
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
