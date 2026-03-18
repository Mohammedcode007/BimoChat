// // app/story/create.tsx
// import { Colors } from "@/constants/theme";
// import { createStory, fetchMyStories, fetchStoriesFeed } from "@/redux/slices/storySlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { ResizeMode, Video } from "expo-av";
// import * as FileSystem from "expo-file-system/legacy";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import React, { useMemo, useRef, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     Image,
//     KeyboardAvoidingView,
//     Platform,
//     Pressable,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     useColorScheme,
//     View,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";

// type Tab = "text" | "image" | "video";

// /** =========================================
//  * ✅ Cloudinary Upload with REAL progress (XHR)
//  * - يعطيك progress حقيقي
//  * ========================================= */
// async function uploadToCloudinaryWithProgress(opts: {
//   uri: string;
//   type: "image" | "video" | "raw";
//   onProgress?: (percent: number, loaded: number, total: number) => void;
//   uploadPreset: string;
//   cloudName: string;
// }): Promise<string> {
//   const { uri, type, onProgress, uploadPreset, cloudName } = opts;

//   const form = new FormData();
//   form.append(
//     "file",
//     {
//       uri,
//       type:
//         type === "image"
//           ? "image/jpeg"
//           : type === "video"
//           ? "video/mp4"
//           : "application/octet-stream",
//       name: type === "image" ? "upload.jpg" : type === "video" ? "upload.mp4" : "upload.dat",
//     } as any
//   );

//   form.append("upload_preset", uploadPreset);

//   const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

//   return await new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", endpoint);

//     xhr.onload = () => {
//       try {
//         const json = JSON.parse(xhr.responseText || "{}");
//         if (!json?.secure_url) {
//           reject(new Error(json?.error?.message || "Upload failed"));
//           return;
//         }
//         resolve(json.secure_url);
//       } catch (e: any) {
//         reject(new Error(e?.message || "Upload parse failed"));
//       }
//     };

//     xhr.onerror = () => reject(new Error("Network error during upload"));

//     if (xhr.upload && onProgress) {
//       xhr.upload.onprogress = (evt) => {
//         if (!evt.lengthComputable) return;

//         // ✅ حماية قوية من تجاوز 100%
//         const total = Math.max(1, evt.total || 1);
//         const loaded = Math.min(evt.loaded || 0, total);
//         const percent = Math.round((loaded / total) * 100);

//         onProgress(percent, loaded, total);
//       };
//     }

//     xhr.send(form as any);
//   });
// }

// /** =========================================
//  * ✅ Video compression (FFMPEG) - Optional
//  * - يعمل فقط في Bare أو Expo Dev Client
//  * - لو غير متاح: يرجع نفس الملف
//  * ========================================= */
// async function compressVideoIfPossible(
//   inputUri: string
// ): Promise<{ uri: string; didCompress: boolean }> {
//   let FFmpegKit: any = null;

//   try {
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     const mod = require("ffmpeg-kit-react-native");
//     FFmpegKit = mod?.FFmpegKit;
//   } catch {
//     FFmpegKit = null;
//   }

//   if (!FFmpegKit) {
//     console.log("[compressVideoIfPossible] ffmpeg-kit not available. Uploading original video.");
//     return { uri: inputUri, didCompress: false };
//   }

//   const outUri =
//     (FileSystem.cacheDirectory || FileSystem.documentDirectory || "") +
//     `bimo_story_${Date.now()}.mp4`;

//   const cmd =
//     `-y -i "${inputUri}" ` +
//     `-vf "scale='min(720,iw)':-2" ` +
//     `-c:v libx264 -preset veryfast -crf 28 ` +
//     `-c:a aac -b:a 96k ` +
//     `"${outUri}"`;

//   try {
//     const session = await FFmpegKit.execute(cmd);
//     const returnCode = await session.getReturnCode();
//     const ok = returnCode?.isValueSuccess?.() || returnCode?.isSuccess?.() || false;

//     if (!ok) {
//       console.log("[compressVideoIfPossible] Compression failed. Uploading original.");
//       return { uri: inputUri, didCompress: false };
//     }

//     const info = await FileSystem.getInfoAsync(outUri);
//     if (!info.exists) {
//       console.log("[compressVideoIfPossible] Output missing. Uploading original.");
//       return { uri: inputUri, didCompress: false };
//     }

//     return { uri: outUri, didCompress: true };
//   } catch (e) {
//     console.log("[compressVideoIfPossible] Error:", e);
//     return { uri: inputUri, didCompress: false };
//   }
// }

// export default function CreateStoryScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const s = useMemo(() => makeStyles(theme), [theme]);

//   const loadingCreate = useSelector((st: RootState) => Boolean(st.stories?.loadingCreate));
//   const error = useSelector((st: RootState) => st.stories?.error);

//   const [tab, setTab] = useState<Tab>("text");

//   // Story fields
//   const [text, setText] = useState("");
//   const [mediaUrl, setMediaUrl] = useState(""); // ✅ يتحدد عند النشر فقط
//   const [localUri, setLocalUri] = useState<string>(""); // ✅ معاينة محلية
//   const [privacy, setPrivacy] = useState<"public" | "followers" | "private">("followers");

//   // Upload state
//   const [uploading, setUploading] = useState(false);
//   const [uploadPct, setUploadPct] = useState(0);
//   const [uploadLabel, setUploadLabel] = useState<string>("");
//   const [pickedInfo, setPickedInfo] = useState<{ sizeMB?: number } | null>(null);

//   // Video preview control
//   const videoRef = useRef<Video | null>(null);

//   // Cloudinary settings (ضعها ثابتة أو من env)
//   const CLOUD_NAME = "dmejkp0m4";
//   const UPLOAD_PRESET = "bimoChat";

//   const resetMediaState = () => {
//     setLocalUri("");
//     setMediaUrl("");
//     setUploadPct(0);
//     setUploadLabel("");
//     setPickedInfo(null);
//   };

//   /** ✅ اختيار من الجهاز (بدون رفع) */
//   const pickFromDevice = async (kind: "image" | "video") => {
//     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) {
//       Alert.alert("صلاحيات", "يجب منح صلاحية الوصول للصور/الفيديو.");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: kind === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
//       quality: 0.9,
//       allowsEditing: kind === "image",
//     });

//     if (result.canceled) return;

//     const uri = result.assets?.[0]?.uri;
//     if (!uri) return;

//     // ✅ معاينة فقط - لا يوجد رفع هنا
//     setLocalUri(uri);
//     setMediaUrl("");
//     setUploadPct(0);
//     setUploadLabel("");
//     setPickedInfo(null);

//     // معلومات حجم الملف
//     try {
//       const info = await FileSystem.getInfoAsync(uri);
//       if (info.exists && typeof info.size === "number") {
//         setPickedInfo({ sizeMB: Math.round((info.size / 1024 / 1024) * 100) / 100 });
//       }
//     } catch {}
//   };

//   const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

//   /** ✅ رفع الملف عند النشر فقط */
//   const uploadSelectedMedia = async (kind: "image" | "video") => {
//     if (!localUri) throw new Error("لا يوجد ملف محدد.");

//     setUploading(true);
//     setUploadPct(0);
//     setUploadLabel(kind === "image" ? "تجهيز الصورة..." : "تجهيز الفيديو...");

//     try {
//       let uriToUpload = localUri;

//       if (kind === "video") {
//         // ضغط الفيديو إن أمكن
//         const { uri: compressedUri, didCompress } = await compressVideoIfPossible(localUri);
//         uriToUpload = compressedUri;

//         if (didCompress) {
//           setUploadLabel("تم ضغط الفيديو - جاري الرفع...");
//           try {
//             const info2 = await FileSystem.getInfoAsync(uriToUpload);
//             if (info2.exists && typeof info2.size === "number") {
//               setPickedInfo({ sizeMB: Math.round((info2.size / 1024 / 1024) * 100) / 100 });
//             }
//           } catch {}
//         } else {
//           setUploadLabel("لم يتم الضغط (غير متاح) - جاري الرفع...");
//         }
//       } else {
//         setUploadLabel("رفع الصورة...");
//       }

//       const url = await uploadToCloudinaryWithProgress({
//         uri: uriToUpload,
//         type: kind,
//         uploadPreset: UPLOAD_PRESET,
//         cloudName: CLOUD_NAME,
//         onProgress: (p) => setUploadPct(clampPct(p)), // ✅ لا تتجاوز 100%
//       });

//       setUploadPct(100);
//       setUploadLabel("تم الرفع بنجاح ✓");
//       setMediaUrl(url);

//       return url;
//     } catch (e: any) {
//       console.log(e);
//       setUploadLabel("");
//       setUploadPct(0);
//       setMediaUrl("");
//       throw new Error(e?.message || "حدث خطأ أثناء رفع الملف.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   /** ✅ يسمح بالنشر:
//    * - نص: لازم نص
//    * - صورة/فيديو: لازم اختيار ملف محلي (الرفع عند النشر)
//    */
//   const canSubmit = useMemo(() => {
//     if (loadingCreate || uploading) return false;

//     if (tab === "text") return text.trim().length > 0;

//     return Boolean(localUri);
//   }, [loadingCreate, uploading, tab, text, localUri]);

//   const submit = async () => {
//     if (!canSubmit) {
//       if (uploading) {
//         Alert.alert("انتظار", "يرجى انتظار اكتمال رفع الملف.");
//         return;
//       }
//       Alert.alert("نقص بيانات", tab === "text" ? "اكتب نص الحالة." : "اختر ملفًا.");
//       return;
//     }

//     try {
//       const payload: any = { privacy };

//       if (tab === "text") {
//         payload.type = "text";
//         payload.text = text.trim();
//       } else {
//         // ✅ رفع عند النشر فقط
//         const url = await uploadSelectedMedia(tab);
//         payload.type = tab;
//         payload.mediaUrl = url; // Cloudinary secure_url
//         if (text.trim()) payload.text = text.trim();
//         payload.durationMs = tab === "video" ? 0 : 6000;
//       }

//       const res = await dispatch(createStory(payload) as any);
//       if ((res as any)?.meta?.requestStatus === "fulfilled") {
//         await Promise.allSettled([
//           dispatch(fetchMyStories() as any),
//           dispatch(fetchStoriesFeed({ page: 1, limit: 30 }) as any),
//         ]);
//         router.back();
//       }
//     } catch (e: any) {
//       Alert.alert("فشل العملية", e?.message || "حدث خطأ.");
//     }
//   };

//   return (
//     <SafeAreaView style={s.root}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.select({ ios: "padding", android: undefined })}
//         keyboardVerticalOffset={Platform.select({ ios: 10, android: 0 })}
//       >
//         {/* ✅ Scrollable Content */}
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={s.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header */}
//           <View style={s.header}>
//             <Pressable onPress={() => router.back()} style={s.iconBtn}>
//               <Ionicons name="chevron-back" size={20} color={theme.text} />
//             </Pressable>
//             <Text style={s.title}>إضافة حالة</Text>
//             <View style={{ width: 44 }} />
//           </View>

//           {/* Tabs */}
//           <View style={s.tabs}>
//             <Pressable
//               onPress={() => {
//                 setTab("text");
//                 resetMediaState();
//               }}
//               style={[s.tab, tab === "text" && s.tabActive]}
//             >
//               <Text style={[s.tabText, tab === "text" && s.tabTextActive]}>نص</Text>
//             </Pressable>

//             <Pressable
//               onPress={() => {
//                 setTab("image");
//                 resetMediaState();
//               }}
//               style={[s.tab, tab === "image" && s.tabActive]}
//             >
//               <Text style={[s.tabText, tab === "image" && s.tabTextActive]}>صورة</Text>
//             </Pressable>

//             <Pressable
//               onPress={() => {
//                 setTab("video");
//                 resetMediaState();
//               }}
//               style={[s.tab, tab === "video" && s.tabActive]}
//             >
//               <Text style={[s.tabText, tab === "video" && s.tabTextActive]}>فيديو</Text>
//             </Pressable>
//           </View>

//           <View style={s.card}>
//             {/* Privacy */}
//             <Text style={s.label}>الخصوصية</Text>
//             <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
//               {(["followers", "public", "private"] as const).map((p) => (
//                 <Pressable
//                   key={p}
//                   onPress={() => setPrivacy(p)}
//                   style={[s.pill, privacy === p && s.pillActive]}
//                 >
//                   <Text style={[s.pillText, privacy === p && s.pillTextActive]}>
//                     {p === "followers" ? "الأصدقاء" : p === "public" ? "عام" : "خاص"}
//                   </Text>
//                 </Pressable>
//               ))}
//             </View>

//             {/* Content by tab */}
//             {tab === "text" ? (
//               <>
//                 <Text style={s.label}>نص الحالة</Text>
//                 <TextInput
//                   value={text}
//                   onChangeText={setText}
//                   placeholder="اكتب حالتك..."
//                   placeholderTextColor={theme.subtleText}
//                   style={s.inputMultiline}
//                   multiline
//                 />
//               </>
//             ) : (
//               <>
//                 <Text style={s.label}>{tab === "image" ? "ملف الصورة" : "ملف الفيديو"}</Text>

//                 <Pressable
//                   onPress={() => pickFromDevice(tab)}
//                   disabled={uploading}
//                   style={[s.uploadBox, uploading && { opacity: 0.8 }]}
//                 >
//                   <Ionicons
//                     name={tab === "image" ? "image-outline" : "videocam-outline"}
//                     size={22}
//                     color={theme.tint}
//                   />
//                   <Text style={{ color: theme.text, fontWeight: "900" }}>
//                     {localUri ? "تغيير الملف" : "اختر من جهازك"}
//                   </Text>
//                   <View style={{ flex: 1 }} />
//                   <Ionicons name="chevron-forward" size={18} color={theme.icon} />
//                 </Pressable>

//                 {!!pickedInfo?.sizeMB && <Text style={s.metaText}>الحجم: {pickedInfo.sizeMB} MB</Text>}

//                 {/* Preview */}
//                 {!!localUri && tab === "image" && (
//                   <View style={s.previewWrap}>
//                     <Image source={{ uri: localUri }} style={s.previewImage} resizeMode="cover" />
//                     {!!mediaUrl && (
//                       <View style={s.okBadge}>
//                         <Ionicons name="checkmark" size={14} color={"#fff"} />
//                         <Text style={s.okText}>تم الرفع</Text>
//                       </View>
//                     )}
//                   </View>
//                 )}

//                 {!!localUri && tab === "video" && (
//                   <View style={s.previewWrap}>
//                     <Video
//                       ref={(r) => {
//                         videoRef.current = r;
//                       }}
//                       source={{ uri: localUri }}
//                       style={s.previewVideo}
//                       resizeMode={ResizeMode.COVER}
//                       shouldPlay={false}
//                       isLooping
//                       useNativeControls
//                     />
//                     {!!mediaUrl && (
//                       <View style={s.okBadge}>
//                         <Ionicons name="checkmark" size={14} color={"#fff"} />
//                         <Text style={s.okText}>تم الرفع</Text>
//                       </View>
//                     )}
//                   </View>
//                 )}

//                 {/* Comment */}
//                 <Text style={[s.label, { marginTop: 10 }]}>تعليق (اختياري)</Text>
//                 <TextInput
//                   value={text}
//                   onChangeText={setText}
//                   placeholder="اكتب تعليق..."
//                   placeholderTextColor={theme.subtleText}
//                   style={s.inputMultiline}
//                   multiline
//                 />

//                 {/* Upload Progress */}
//                 {(uploading || uploadPct > 0 || uploadLabel) && (
//                   <View style={{ marginTop: 12 }}>
//                     <View style={s.progressRow}>
//                       <Text style={s.progressLabel}>{uploadLabel || "..."}</Text>
//                       <Text style={s.progressPct}>
//                         {Math.min(100, Math.max(0, uploadPct))}%
//                       </Text>
//                     </View>
//                     <View style={s.progressTrack}>
//                       <View
//                         style={[
//                           s.progressFill,
//                           { width: `${Math.min(100, Math.max(0, uploadPct))}%` },
//                         ]}
//                       />
//                     </View>
//                   </View>
//                 )}
//               </>
//             )}

//             {!!error && <Text style={s.err}>{String(error)}</Text>}

//             <Text style={s.note}>
//               * الباك يمنع إضافة أكثر من حالتين نشطتين. إذا حذفت حالة يمكنك إضافة أخرى.
//             </Text>

//             {tab === "video" && (
//               <Text style={s.note}>
//                 * ضغط الفيديو يعمل فقط في Bare أو Expo Dev Client (وليس Expo Go).
//               </Text>
//             )}
//           </View>
//         </ScrollView>

//         {/* ✅ Sticky Bottom Bar (زر ثابت) */}
//         <View style={s.bottomBar}>
//           <Pressable
//             onPress={submit}
//             disabled={!canSubmit}
//             style={[s.btn, (!canSubmit || loadingCreate) && { opacity: 0.65 }]}
//           >
//             {loadingCreate ? (
//               <>
//                 <ActivityIndicator />
//                 <Text style={s.btnText}>جاري النشر...</Text>
//               </>
//             ) : uploading ? (
//               <>
//                 <ActivityIndicator />
//                 <Text style={s.btnText}>جاري الرفع...</Text>
//               </>
//             ) : (
//               <>
//                 <Ionicons name="cloud-upload-outline" size={18} color={"#fff"} />
//                 <Text style={s.btnText}>نشر الحالة</Text>
//               </>
//             )}
//           </Pressable>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// function makeStyles(theme: any) {
//   return StyleSheet.create({
//     root: { flex: 1, backgroundColor: theme.background, padding: 16 },

//     header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//     iconBtn: {
//       width: 44,
//       height: 44,
//       borderRadius: 14,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     title: { fontSize: 16, fontWeight: "900", color: theme.text },

//     tabs: { flexDirection: "row", gap: 8, marginTop: 12 },
//     tab: {
//       flex: 1,
//       paddingVertical: 10,
//       borderRadius: 999,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.cardAlt,
//       alignItems: "center",
//     },
//     tabActive: { backgroundColor: theme.primary, borderColor: theme.primary },
//     tabText: { fontWeight: "900", color: theme.mutedText, fontSize: 12 },
//     tabTextActive: { color: theme.primaryText },

//     card: {
//       marginTop: 12,
//       borderRadius: 18,
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       padding: 12,
//     },

//     label: { color: theme.text, fontWeight: "900", marginBottom: 8, marginTop: 6 },

//     inputMultiline: {
//       minHeight: 110,
//       borderRadius: 14,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.cardAlt,
//       paddingHorizontal: 12,
//       paddingVertical: 10,
//       color: theme.text,
//       fontWeight: "800",
//       textAlignVertical: "top",
//     },

//     pill: {
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       borderRadius: 999,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.cardAlt,
//     },
//     pillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
//     pillText: { color: theme.mutedText, fontWeight: "900", fontSize: 12 },
//     pillTextActive: { color: theme.primaryText },

//     uploadBox: {
//       height: 60,
//       borderRadius: 14,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.cardAlt,
//       paddingHorizontal: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       flexDirection: "row",
//       gap: 10,
//     },
//     scrollContent: {
//       padding: 16,
//       paddingBottom: 110, // مهم حتى لا يغطي الزر آخر المحتوى
//     },

//     metaText: {
//       marginTop: 8,
//       color: theme.subtleText,
//       fontWeight: "800",
//       fontSize: 12,
//     },

//     previewWrap: {
//       marginTop: 12,
//       borderRadius: 18,
//       overflow: "hidden",
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.cardAlt,
//       position: "relative",
//     },
//     previewImage: {
//       width: "100%",
//       height: 240,
//     },
//     previewVideo: {
//       width: "100%",
//       height: 240,
//       backgroundColor: "#000",
//     },

//     okBadge: {
//       position: "absolute",
//       top: 10,
//       right: 10,
//       backgroundColor: "rgba(0,0,0,0.55)",
//       borderWidth: 1,
//       borderColor: "rgba(255,255,255,0.18)",
//       borderRadius: 999,
//       paddingHorizontal: 10,
//       paddingVertical: 6,
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 6,
//     },
//     okText: { color: "#fff", fontWeight: "900", fontSize: 12 },

//     progressRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 8,
//     },
//     progressLabel: { color: theme.text, fontWeight: "900", fontSize: 12 },
//     progressPct: { color: theme.text, fontWeight: "900", fontSize: 12 },

//     progressTrack: {
//       height: 10,
//       borderRadius: 999,
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//       overflow: "hidden",
//     },
//     progressFill: {
//       height: "100%",
//       borderRadius: 999,
//       backgroundColor: theme.primary,
//     },

//     btn: {
//       marginTop: 14,
//       height: 48,
//       borderRadius: 16,
//       backgroundColor: theme.primary,
//       alignItems: "center",
//       justifyContent: "center",
//       flexDirection: "row",
//       gap: 10,
//     },
//     btnText: { color: "#fff", fontWeight: "900" },

//     err: { marginTop: 10, color: theme.danger, fontWeight: "900" },
//     note: { marginTop: 10, color: theme.subtleText, fontWeight: "800", fontSize: 12 },
//       bottomBar: {
//       paddingHorizontal: 16,
//       paddingTop: 10,
//       paddingBottom: Platform.select({ ios: 16, android: 12 }),
//       borderTopWidth: 1,
//       borderTopColor: theme.border,
//       backgroundColor: theme.background,
//     },
//   });
// }
// app/story/create.tsx
import { Colors } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import { createStory, fetchMyStories, fetchStoriesFeed } from "@/redux/slices/storySlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type Tab = "text" | "image" | "video";

async function uploadToCloudinaryWithProgress(opts: {
  uri: string;
  type: "image" | "video" | "raw";
  onProgress?: (percent: number, loaded: number, total: number) => void;
  uploadPreset: string;
  cloudName: string;
}): Promise<string> {
  const { uri, type, onProgress, uploadPreset, cloudName } = opts;

  const form = new FormData();
  form.append(
    "file",
    {
      uri,
      type:
        type === "image"
          ? "image/jpeg"
          : type === "video"
            ? "video/mp4"
            : "application/octet-stream",
      name: type === "image" ? "upload.jpg" : type === "video" ? "upload.mp4" : "upload.dat",
    } as any
  );

  form.append("upload_preset", uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || "{}");
        if (!json?.secure_url) {
          reject(new Error(json?.error?.message || "Upload failed"));
          return;
        }
        resolve(json.secure_url);
      } catch (e: any) {
        reject(new Error(e?.message || "Upload parse failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const total = Math.max(1, evt.total || 1);
        const loaded = Math.min(evt.loaded || 0, total);
        const percent = Math.round((loaded / total) * 100);
        onProgress(percent, loaded, total);
      };
    }

    xhr.send(form as any);
  });
}

async function compressVideoIfPossible(
  inputUri: string
): Promise<{ uri: string; didCompress: boolean }> {
  let FFmpegKit: any = null;

  try {
    const mod = require("ffmpeg-kit-react-native");
    FFmpegKit = mod?.FFmpegKit;
  } catch {
    FFmpegKit = null;
  }

  if (!FFmpegKit) {
    console.log("[compressVideoIfPossible] ffmpeg-kit not available. Uploading original video.");
    return { uri: inputUri, didCompress: false };
  }

  const outUri =
    (FileSystem.cacheDirectory || FileSystem.documentDirectory || "") +
    `bimo_story_${Date.now()}.mp4`;

  const cmd =
    `-y -i "${inputUri}" ` +
    `-vf "scale='min(720,iw)':-2" ` +
    `-c:v libx264 -preset veryfast -crf 28 ` +
    `-c:a aac -b:a 96k ` +
    `"${outUri}"`;

  try {
    const session = await FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode();
    const ok = returnCode?.isValueSuccess?.() || returnCode?.isSuccess?.() || false;

    if (!ok) {
      console.log("[compressVideoIfPossible] Compression failed. Uploading original.");
      return { uri: inputUri, didCompress: false };
    }

    const info = await FileSystem.getInfoAsync(outUri);
    if (!info.exists) {
      console.log("[compressVideoIfPossible] Output missing. Uploading original.");
      return { uri: inputUri, didCompress: false };
    }

    return { uri: outUri, didCompress: true };
  } catch (e) {
    console.log("[compressVideoIfPossible] Error:", e);
    return { uri: inputUri, didCompress: false };
  }
}

export default function CreateStoryScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { language, t } = useTranslation();
  const isRTL = language === "ar" || I18nManager.isRTL;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme, isRTL), [theme, isRTL]);

  const copy = useMemo(
    () => ({
      title: t("storyCreate.title"),
      textTab: t("storyCreate.textTab"),
      imageTab: t("storyCreate.imageTab"),
      videoTab: t("storyCreate.videoTab"),
      privacy: t("storyCreate.privacy"),
      followers: t("storyCreate.followers"),
      public: t("storyCreate.public"),
      private: t("storyCreate.private"),
      storyText: t("storyCreate.storyText"),
      storyTextPlaceholder: t("storyCreate.storyTextPlaceholder"),
      imageFile: t("storyCreate.imageFile"),
      videoFile: t("storyCreate.videoFile"),
      chooseFromDevice: t("storyCreate.chooseFromDevice"),
      changeFile: t("storyCreate.changeFile"),
      optionalComment: t("storyCreate.optionalComment"),
      commentPlaceholder: t("storyCreate.commentPlaceholder"),
      size: t("storyCreate.size"),
      uploaded: t("storyCreate.uploaded"),
      preparingImage: t("storyCreate.preparingImage"),
      preparingVideo: t("storyCreate.preparingVideo"),
      videoCompressedUploading: t("storyCreate.videoCompressedUploading"),
      videoNotCompressedUploading: t("storyCreate.videoNotCompressedUploading"),
      uploadingImage: t("storyCreate.uploadingImage"),
      uploadSuccess: t("storyCreate.uploadSuccess"),
      waitTitle: t("storyCreate.waitTitle"),
      waitMessage: t("storyCreate.waitMessage"),
      missingDataTitle: t("storyCreate.missingDataTitle"),
      missingTextMessage: t("storyCreate.missingTextMessage"),
      missingFileMessage: t("storyCreate.missingFileMessage"),
      permissionTitle: t("storyCreate.permissionTitle"),
      permissionMessage: t("storyCreate.permissionMessage"),
      operationFailed: t("storyCreate.operationFailed"),
      genericError: t("storyCreate.genericError"),
      noFileSelected: t("storyCreate.noFileSelected"),
      uploadFailed: t("storyCreate.uploadFailed"),
      publishLoading: t("storyCreate.publishLoading"),
      uploadLoading: t("storyCreate.uploadLoading"),
      publishStory: t("storyCreate.publishStory"),
      noteStoriesLimit: t("storyCreate.noteStoriesLimit"),
      noteVideoCompression: t("storyCreate.noteVideoCompression"),
    }),
    [t]
  );

  const loadingCreate = useSelector((st: RootState) => Boolean(st.stories?.loadingCreate));
  const error = useSelector((st: RootState) => st.stories?.error);

  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [localUri, setLocalUri] = useState<string>("");
  const [privacy, setPrivacy] = useState<"public" | "followers" | "private">("followers");
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadLabel, setUploadLabel] = useState<string>("");
  const [pickedInfo, setPickedInfo] = useState<{ sizeMB?: number } | null>(null);

  const videoRef = useRef<Video | null>(null);

  const CLOUD_NAME = "dmejkp0m4";
  const UPLOAD_PRESET = "bimoChat";

  const resetMediaState = () => {
    setLocalUri("");
    setMediaUrl("");
    setUploadPct(0);
    setUploadLabel("");
    setPickedInfo(null);
  };

  const pickFromDevice = async (kind: "image" | "video") => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(copy.permissionTitle, copy.permissionMessage);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.9,
      allowsEditing: kind === "image",
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    setLocalUri(uri);
    setMediaUrl("");
    setUploadPct(0);
    setUploadLabel("");
    setPickedInfo(null);

    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && typeof info.size === "number") {
        setPickedInfo({ sizeMB: Math.round((info.size / 1024 / 1024) * 100) / 100 });
      }
    } catch {}
  };

  const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const uploadSelectedMedia = async (kind: "image" | "video") => {
    if (!localUri) throw new Error(copy.noFileSelected);

    setUploading(true);
    setUploadPct(0);
    setUploadLabel(kind === "image" ? copy.preparingImage : copy.preparingVideo);

    try {
      let uriToUpload = localUri;

      if (kind === "video") {
        const { uri: compressedUri, didCompress } = await compressVideoIfPossible(localUri);
        uriToUpload = compressedUri;

        if (didCompress) {
          setUploadLabel(copy.videoCompressedUploading);
          try {
            const info2 = await FileSystem.getInfoAsync(uriToUpload);
            if (info2.exists && typeof info2.size === "number") {
              setPickedInfo({ sizeMB: Math.round((info2.size / 1024 / 1024) * 100) / 100 });
            }
          } catch {}
        } else {
          setUploadLabel(copy.videoNotCompressedUploading);
        }
      } else {
        setUploadLabel(copy.uploadingImage);
      }

      const url = await uploadToCloudinaryWithProgress({
        uri: uriToUpload,
        type: kind,
        uploadPreset: UPLOAD_PRESET,
        cloudName: CLOUD_NAME,
        onProgress: (p) => setUploadPct(clampPct(p)),
      });

      setUploadPct(100);
      setUploadLabel(copy.uploadSuccess);
      setMediaUrl(url);

      return url;
    } catch (e: any) {
      console.log(e);
      setUploadLabel("");
      setUploadPct(0);
      setMediaUrl("");
      throw new Error(e?.message || copy.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = useMemo(() => {
    if (loadingCreate || uploading) return false;
    if (tab === "text") return text.trim().length > 0;
    return Boolean(localUri);
  }, [loadingCreate, uploading, tab, text, localUri]);

  const submit = async () => {
    if (!canSubmit) {
      if (uploading) {
        Alert.alert(copy.waitTitle, copy.waitMessage);
        return;
      }
      Alert.alert(copy.missingDataTitle, tab === "text" ? copy.missingTextMessage : copy.missingFileMessage);
      return;
    }

    try {
      const payload: any = { privacy };

      if (tab === "text") {
        payload.type = "text";
        payload.text = text.trim();
      } else {
        const url = await uploadSelectedMedia(tab);
        payload.type = tab;
        payload.mediaUrl = url;
        if (text.trim()) payload.text = text.trim();
        payload.durationMs = tab === "video" ? 0 : 6000;
      }

      const res = await dispatch(createStory(payload) as any);
      if ((res as any)?.meta?.requestStatus === "fulfilled") {
        await Promise.allSettled([
          dispatch(fetchMyStories() as any),
          dispatch(fetchStoriesFeed({ page: 1, limit: 30 }) as any),
        ]);
        router.back();
      }
    } catch (e: any) {
      Alert.alert(copy.operationFailed, e?.message || copy.genericError);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 10, android: 0 })}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.iconBtn}>
              <Ionicons
                name={isRTL ? "chevron-forward" : "chevron-back"}
                size={20}
                color={theme.text}
              />
            </Pressable>
            <Text style={s.title}>{copy.title}</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={s.tabs}>
            <Pressable
              onPress={() => {
                setTab("text");
                resetMediaState();
              }}
              style={[s.tab, tab === "text" && s.tabActive]}
            >
              <Text style={[s.tabText, tab === "text" && s.tabTextActive]}>{copy.textTab}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setTab("image");
                resetMediaState();
              }}
              style={[s.tab, tab === "image" && s.tabActive]}
            >
              <Text style={[s.tabText, tab === "image" && s.tabTextActive]}>{copy.imageTab}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setTab("video");
                resetMediaState();
              }}
              style={[s.tab, tab === "video" && s.tabActive]}
            >
              <Text style={[s.tabText, tab === "video" && s.tabTextActive]}>{copy.videoTab}</Text>
            </Pressable>
          </View>

          <View style={s.card}>
            <Text style={s.label}>{copy.privacy}</Text>
            <View style={s.privacyRow}>
              {(["followers", "public", "private"] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPrivacy(p)}
                  style={[s.pill, privacy === p && s.pillActive]}
                >
                  <Text style={[s.pillText, privacy === p && s.pillTextActive]}>
                    {p === "followers" ? copy.followers : p === "public" ? copy.public : copy.private}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tab === "text" ? (
              <>
                <Text style={s.label}>{copy.storyText}</Text>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={copy.storyTextPlaceholder}
                  placeholderTextColor={theme.subtleText}
                  style={s.inputMultiline}
                  multiline
                />
              </>
            ) : (
              <>
                <Text style={s.label}>{tab === "image" ? copy.imageFile : copy.videoFile}</Text>

                <Pressable
                  onPress={() => pickFromDevice(tab)}
                  disabled={uploading}
                  style={[s.uploadBox, uploading && { opacity: 0.8 }]}
                >
                  <Ionicons
                    name={tab === "image" ? "image-outline" : "videocam-outline"}
                    size={22}
                    color={theme.tint}
                  />
                  <Text style={{ color: theme.text, fontWeight: "900" }}>
                    {localUri ? copy.changeFile : copy.chooseFromDevice}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Ionicons
                    name={isRTL ? "chevron-back" : "chevron-forward"}
                    size={18}
                    color={theme.icon}
                  />
                </Pressable>

                {!!pickedInfo?.sizeMB && (
                  <Text style={s.metaText}>
                    {copy.size}: {pickedInfo.sizeMB} MB
                  </Text>
                )}

                {!!localUri && tab === "image" && (
                  <View style={s.previewWrap}>
                    <Image source={{ uri: localUri }} style={s.previewImage} resizeMode="cover" />
                    {!!mediaUrl && (
                      <View style={s.okBadge}>
                        <Ionicons name="checkmark" size={14} color={"#fff"} />
                        <Text style={s.okText}>{copy.uploaded}</Text>
                      </View>
                    )}
                  </View>
                )}

                {!!localUri && tab === "video" && (
                  <View style={s.previewWrap}>
                    <Video
                      ref={(r) => {
                        videoRef.current = r;
                      }}
                      source={{ uri: localUri }}
                      style={s.previewVideo}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isLooping
                      useNativeControls
                    />
                    {!!mediaUrl && (
                      <View style={s.okBadge}>
                        <Ionicons name="checkmark" size={14} color={"#fff"} />
                        <Text style={s.okText}>{copy.uploaded}</Text>
                      </View>
                    )}
                  </View>
                )}

                <Text style={[s.label, { marginTop: 10 }]}>{copy.optionalComment}</Text>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={copy.commentPlaceholder}
                  placeholderTextColor={theme.subtleText}
                  style={s.inputMultiline}
                  multiline
                />

                {(uploading || uploadPct > 0 || uploadLabel) && (
                  <View style={{ marginTop: 12 }}>
                    <View style={s.progressRow}>
                      <Text style={s.progressLabel}>{uploadLabel || "..."}</Text>
                      <Text style={s.progressPct}>
                        {Math.min(100, Math.max(0, uploadPct))}%
                      </Text>
                    </View>
                    <View style={s.progressTrack}>
                      <View
                        style={[
                          s.progressFill,
                          { width: `${Math.min(100, Math.max(0, uploadPct))}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </>
            )}

            {!!error && <Text style={s.err}>{String(error)}</Text>}

            <Text style={s.note}>{copy.noteStoriesLimit}</Text>

            {tab === "video" && <Text style={s.note}>{copy.noteVideoCompression}</Text>}
          </View>
        </ScrollView>

        <View style={s.bottomBar}>
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[s.btn, (!canSubmit || loadingCreate) && { opacity: 0.65 }]}
          >
            {loadingCreate ? (
              <>
                <ActivityIndicator />
                <Text style={s.btnText}>{copy.publishLoading}</Text>
              </>
            ) : uploading ? (
              <>
                <ActivityIndicator />
                <Text style={s.btnText}>{copy.uploadLoading}</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color={"#fff"} />
                <Text style={s.btnText}>{copy.publishStory}</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(theme: any, isRTL: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
    },

    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },

    title: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
      textAlign: "center",
    },

    tabs: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 8,
      marginTop: 12,
      paddingHorizontal: 16,
    },

    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
      alignItems: "center",
    },

    tabActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    tabText: { fontWeight: "900", color: theme.mutedText, fontSize: 12 },
    tabTextActive: { color: theme.primaryText },

    card: {
      marginTop: 12,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
    },

    label: {
      color: theme.text,
      fontWeight: "900",
      marginBottom: 8,
      marginTop: 6,
      textAlign: isRTL ? "right" : "left",
    },

    privacyRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 8,
      marginBottom: 12,
    },

    inputMultiline: {
      minHeight: 110,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text,
      fontWeight: "800",
      textAlignVertical: "top",
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
    },

    pill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
    },

    pillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    pillText: { color: theme.mutedText, fontWeight: "900", fontSize: 12 },
    pillTextActive: { color: theme.primaryText },

    uploadBox: {
      height: 60,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
    },

    scrollContent: {
      paddingBottom: 110,
    },

    metaText: {
      marginTop: 8,
      color: theme.subtleText,
      fontWeight: "800",
      fontSize: 12,
      textAlign: isRTL ? "right" : "left",
    },

    previewWrap: {
      marginTop: 12,
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
      position: "relative",
    },

    previewImage: {
      width: "100%",
      height: 240,
    },

    previewVideo: {
      width: "100%",
      height: 240,
      backgroundColor: "#000",
    },

    okBadge: {
      position: "absolute",
      top: 10,
      right: isRTL ? undefined : 10,
      left: isRTL ? 10 : undefined,
      backgroundColor: "rgba(0,0,0,0.55)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
    },

    okText: { color: "#fff", fontWeight: "900", fontSize: 12 },

    progressRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    progressLabel: { color: theme.text, fontWeight: "900", fontSize: 12, textAlign: isRTL ? "right" : "left" },
    progressPct: { color: theme.text, fontWeight: "900", fontSize: 12, textAlign: isRTL ? "left" : "right" },

    progressTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.primary,
    },

    btn: {
      marginTop: 14,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
    },

    btnText: { color: "#fff", fontWeight: "900" },

    err: { marginTop: 10, color: theme.danger, fontWeight: "900", textAlign: isRTL ? "right" : "left" },
    note: { marginTop: 10, color: theme.subtleText, fontWeight: "800", fontSize: 12, textAlign: isRTL ? "right" : "left" },

    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: Platform.select({ ios: 16, android: 12 }),
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
  });
}