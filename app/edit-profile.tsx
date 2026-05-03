
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { useTranslation } from "@/hooks/useTranslation";
// import { updateProfile } from "@/redux/slices/profileSlice";
// import { getMyInventory, selectMyStore } from "@/redux/slices/storeControl.slice";
// import { debitMyCoinz } from "@/redux/slices/userSlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import { uploadToCloudinary } from "@/services/upload.service";
// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import * as ImagePicker from "expo-image-picker";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// export default function EditProfileScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { user } = useSelector((state: RootState) => state.auth);
//   const { loading } = useSelector((state: RootState) => state.profile);
//   const myStore = useSelector(selectMyStore);
//   const myCoinz = Number(myStore?.coinzBalance || 0);

//   const AVATAR_GIF_COST = 2000;
//   const [avatarGifNeedsPayment, setAvatarGifNeedsPayment] = useState(false);
//   const [savingProfile, setSavingProfile] = useState(false);
//   const { t } = useTranslation();

//   const { colorScheme } = useColorScheme();

//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

//   const richText = useRef<RichEditor | null>(null);

//   const COUNTRIES = useMemo(
//     () => [
//       {
//         label: t("editProfile.countries.egypt"),
//         value: t("editProfile.countries.egypt"),
//       },
//       {
//         label: t("editProfile.countries.saudiArabia"),
//         value: t("editProfile.countries.saudiArabia"),
//       },
//       {
//         label: t("editProfile.countries.uae"),
//         value: t("editProfile.countries.uae"),
//       },
//       {
//         label: t("editProfile.countries.unitedStates"),
//         value: t("editProfile.countries.unitedStates"),
//       },
//       {
//         label: t("editProfile.countries.morocco"),
//         value: t("editProfile.countries.morocco"),
//       },
//     ],
//     [t]
//   );

//   const [userId, setUserId] = useState("");
//   const [bio, setBio] = useState("");
//   const [tempBio, setTempBio] = useState("");
//   const [country, setCountry] = useState("");

//   const [avatar, setAvatar] = useState<string | null>(null);
//   const [cover, setCover] = useState<string | null>(null);

//   const [avatarIsGif, setAvatarIsGif] = useState(false);

//   const [oldPass, setOldPass] = useState("");
//   const [newPass, setNewPass] = useState("");

//   const [bioModalVisible, setBioModalVisible] = useState(false);

//   useEffect(() => {
//     if (!user) return;

//     const currentAvatar = String((user as any)?.avatar || "");

//     setUserId((user as any)?.atUsername || "");
//     setBio((user as any)?.bio || "");
//     setTempBio((user as any)?.bio || "");
//     setCountry((user as any)?.country || "");
//     setAvatar(currentAvatar || null);
//     setCover((user as any)?.coverImage || null);

//     setAvatarIsGif(
//       currentAvatar.toLowerCase().includes(".gif") ||
//       currentAvatar.toLowerCase().includes("image/gif")
//     );
//     setAvatarGifNeedsPayment(false);
//   }, [user]);

//   const canSave = useMemo(() => {
//     return !loading && !savingProfile;
//   }, [loading, savingProfile]);

//   const ensureMediaPermission = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       Alert.alert(
//         t("editProfile.alerts.permissionTitle"),
//         t("editProfile.alerts.permissionMessage")
//       );
//       return false;
//     }

//     return true;
//   };

//   const isGifAsset = (asset: ImagePicker.ImagePickerAsset) => {
//     const uri = String(asset?.uri || "").toLowerCase();
//     const fileName = String((asset as any)?.fileName || "").toLowerCase();
//     const mimeType = String((asset as any)?.mimeType || "").toLowerCase();

//     return (
//       mimeType === "image/gif" ||
//       fileName.endsWith(".gif") ||
//       uri.includes(".gif")
//     );
//   };

// const pickNormalImage = async (type: "avatar" | "cover") => {
//   const ok = await ensureMediaPermission();
//   if (!ok) return;

//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,

//     // لا تفتح شاشة القص
//     allowsEditing: false,

//     // لا تضع aspect مع allowsEditing false
//     quality: 0.85,
//   });

//   if (result.canceled) return;

//   const asset = result.assets?.[0];
//   const uri = asset?.uri;

//   if (!uri) return;

//   if (type === "avatar") {
//     setAvatar(uri);
//     setAvatarIsGif(false);
//     setAvatarGifNeedsPayment(false);
//   } else {
//     setCover(uri);
//   }
// };
//   const pickGifAvatar = async () => {
//     const ok = await ensureMediaPermission();
//     if (!ok) return;

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,

//       // مهم جدًا:
//       // لا تستخدم allowsEditing مع GIF حتى لا يتحول إلى صورة ثابتة.
//       allowsEditing: false,

//       quality: 1,
//     });

//     if (result.canceled) return;

//     const asset = result.assets?.[0];
//     const uri = asset?.uri;

//     if (!uri) return;

//     if (!isGifAsset(asset)) {
//       Alert.alert("GIF فقط", "من فضلك اختر صورة بصيغة GIF.");
//       return;
//     }

//     setAvatar(uri);
//     setAvatarIsGif(true);
//     setAvatarGifNeedsPayment(true);
//   };

//   const openAvatarPicker = () => {
//     Alert.alert("Change Avatar", "اختر نوع الأفاتار", [
//       {
//         text: "Choose Image",
//         onPress: () => pickNormalImage("avatar"),
//       },
//       {
//         text: "Choose GIF",
//         onPress: pickGifAvatar,
//       },
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//     ]);
//   };

//   const pickImage = async (type: "avatar" | "cover") => {
//     if (type === "avatar") {
//       openAvatarPicker();
//       return;
//     }

//     await pickNormalImage("cover");
//   };

//   const shouldUploadLocalFile = (uri?: string | null) => {
//     const value = String(uri || "");
//     return value.startsWith("file") || value.startsWith("content");
//   };

//   const handleSave = async () => {
//     if (!canSave) return;

//     const needsGifPayment =
//       avatarGifNeedsPayment &&
//       avatarIsGif &&
//       shouldUploadLocalFile(avatar);

//     if (needsGifPayment && myCoinz < AVATAR_GIF_COST) {
//       Alert.alert(
//         "رصيد غير كافٍ",
//         `اختيار صورة متحركة يحتاج ${AVATAR_GIF_COST} Coinz، بينما رصيدك الحالي ${myCoinz} Coinz.`
//       );
//       return;
//     }

//     setSavingProfile(true);

//     try {
//       let avatarUrl = avatar;
//       let coverUrl = cover;

//       if (shouldUploadLocalFile(avatar)) {
//         avatarUrl = await uploadToCloudinary(avatar!, "image");
//       }

//       if (shouldUploadLocalFile(cover)) {
//         coverUrl = await uploadToCloudinary(cover!, "image");
//       }

//       if (needsGifPayment) {
//         const debitRes = await dispatch(
//           debitMyCoinz({
//             amount: AVATAR_GIF_COST,
//             reason: "avatar_gif",
//           }) as any
//         );

//         if (!debitMyCoinz.fulfilled.match(debitRes)) {
//           Alert.alert(
//             "تعذر الخصم",
//             String((debitRes as any)?.payload || "فشل خصم الرصيد")
//           );

//           await dispatch(getMyInventory() as any);
//           return;
//         }
//       }

//       await dispatch(
//         updateProfile({
//           atUsername: userId.trim(),
//           bio,
//           country,
//           avatar: avatarUrl || undefined,
//           coverImage: coverUrl || undefined,
//           oldPassword: oldPass.trim() || undefined,
//           newPassword: newPass.trim() || undefined,
//         })
//       ).unwrap();

//       if (needsGifPayment) {
//         setAvatarGifNeedsPayment(false);
//         await dispatch(getMyInventory() as any);
//       }

//       Alert.alert(
//         t("editProfile.alerts.successTitle"),
//         t("editProfile.alerts.successMessage")
//       );
//     } catch (e: any) {
//       Alert.alert(
//         t("editProfile.alerts.errorTitle"),
//         String(e?.message || e || t("editProfile.alerts.errorFallback"))
//       );
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor: theme.background }]}
//       edges={["top", "bottom"]}
//     >
//       <StatusBar
//         barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
//       />

//       <Modal visible={!!loading || savingProfile} transparent animationType="fade">
//         <View style={styles.loadingOverlay}>
//           <View
//             style={[
//               styles.loadingCard,
//               { backgroundColor: theme.card, borderColor: theme.border },
//             ]}
//           >
//             <ActivityIndicator />

//             <Text style={[styles.loadingText, { color: theme.text }]}>
//               {savingProfile ? "Saving profile..." : t("editProfile.loading.title")}
//             </Text>

//             <Text
//               style={[
//                 styles.loadingSubText,
//                 { color: theme.mutedText as any },
//               ]}
//             >
//               {savingProfile
//                 ? avatarGifNeedsPayment
//                   ? `Uploading GIF and deducting ${AVATAR_GIF_COST} Coinz...`
//                   : "Uploading and saving changes..."
//                 : t("editProfile.loading.subtitle")}
//             </Text>
//           </View>
//         </View>
//       </Modal>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 24 }}
//       >
//         <View
//           style={[styles.coverContainer, { backgroundColor: theme.surface2 }]}
//         >
//           {cover ? (
//             <Image
//               source={{ uri: cover }}
//               style={styles.coverImage}
//               contentFit="cover"
//               transition={0}
//             />
//           ) : (
//             <View
//               style={[
//                 styles.coverPlaceholder,
//                 { backgroundColor: theme.surface2 },
//               ]}
//             />
//           )}

//           <View
//             style={[styles.coverShade, { backgroundColor: theme.overlay }]}
//           />

//           <TouchableOpacity
//             style={[
//               styles.coverEditBtn,
//               { backgroundColor: theme.card, borderColor: theme.border },
//             ]}
//             onPress={() => pickImage("cover")}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="camera-outline" size={18} color={theme.icon} />

//             <Text style={[styles.coverEditText, { color: theme.text }]}>
//               {t("editProfile.actions.changeCover")}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.headerCardWrap}>
//           <View
//             style={[
//               styles.headerCard,
//               { backgroundColor: theme.card, borderColor: theme.border },
//             ]}
//           >
//             <View style={styles.avatarRow}>
//               <View
//                 style={[
//                   styles.avatarWrapper,
//                   {
//                     borderColor: theme.border,
//                     backgroundColor: theme.surface2,
//                   },
//                 ]}
//               >
//                 {avatar ? (
//                   <Image
//                     source={{ uri: avatar }}
//                     style={styles.avatar}
//                     contentFit="cover"
//                     transition={0}
//                   />
//                 ) : (
//                   <Ionicons
//                     name="person-outline"
//                     size={52}
//                     color={theme.icon}
//                   />
//                 )}

//                 <TouchableOpacity
//                   style={[
//                     styles.avatarEditBtn,
//                     { backgroundColor: theme.primary },
//                   ]}
//                   onPress={() => pickImage("avatar")}
//                   activeOpacity={0.85}
//                 >
//                   <Ionicons
//                     name="camera"
//                     size={14}
//                     color={theme.primaryText}
//                   />
//                 </TouchableOpacity>

//                 {avatarIsGif && (
//                   <View style={styles.gifBadge}>
//                     <Text style={styles.gifBadgeText}>GIF</Text>
//                   </View>
//                 )}
//               </View>

//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.headerTitle, { color: theme.text }]}>
//                   {t("editProfile.header.title")}
//                 </Text>

//                 <Text
//                   style={[
//                     styles.headerSub,
//                     { color: theme.mutedText as any },
//                   ]}
//                 >
//                   {t("editProfile.header.subtitle")}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         <View style={styles.formSection}>
    


//           <TouchableOpacity
//             style={[
//               styles.bioPreviewBox,
//               { borderColor: theme.border, backgroundColor: theme.card },
//             ]}
//             onPress={() => setBioModalVisible(true)}
//             activeOpacity={0.9}
//           >
//             <View style={styles.bioHeader}>
//               <View
//                 style={[
//                   styles.bioIcon,
//                   { backgroundColor: theme.primarySoft as any },
//                 ]}
//               >
//                 <Ionicons
//                   name="document-text-outline"
//                   size={16}
//                   color={theme.primary}
//                 />
//               </View>

//               <Text style={[styles.bioTitle, { color: theme.text }]}>
//                 {t("editProfile.fields.bio")}
//               </Text>

//               <View style={{ flex: 1 }} />

//               <Ionicons name="create-outline" size={18} color={theme.icon} />
//             </View>

//             <Text
//               numberOfLines={4}
//               style={[
//                 styles.bioPreviewText,
//                 { color: theme.mutedText as any },
//               ]}
//             >
//               {bio
//                 ? bio.replace(/<[^>]+>/g, "")
//                 : t("editProfile.placeholders.bioPreview")}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
//           <TouchableOpacity
//             style={[
//               styles.saveButton,
//               { backgroundColor: theme.primary },
//               !canSave && { opacity: 0.6 },
//             ]}
//             disabled={!canSave}
//             onPress={handleSave}
//             activeOpacity={0.9}
//           >
//             {savingProfile ? (
//               <ActivityIndicator size="small" color={theme.primaryText} />
//             ) : (
//               <Ionicons
//                 name="save-outline"
//                 size={18}
//                 color={theme.primaryText}
//               />
//             )}

//             <Text style={[styles.saveText, { color: theme.primaryText }]}>
//               {savingProfile ? "Saving..." : t("editProfile.actions.saveChanges")}
//             </Text>
//           </TouchableOpacity>

//           <Text
//             style={[styles.footerHint, { color: theme.subtleText as any }]}
//           >
//             {t("editProfile.footerHint")}
//           </Text>
//         </View>
//       </ScrollView>

//       <Modal
//         visible={bioModalVisible}
//         animationType="slide"
//         onRequestClose={() => setBioModalVisible(false)}
//       >
//         <SafeAreaView
//           style={{ flex: 1, backgroundColor: theme.background }}
//           edges={["top", "bottom"]}
//         >
//           <View
//             style={[
//               styles.modalHeader,
//               {
//                 borderBottomColor: theme.border,
//                 backgroundColor: theme.background,
//               },
//             ]}
//           >
//             <TouchableOpacity
//               onPress={() => setBioModalVisible(false)}
//               hitSlop={10}
//             >
//               <Text
//                 style={[
//                   styles.cancelText,
//                   { color: theme.mutedText as any },
//                 ]}
//               >
//                 {t("editProfile.modal.cancel")}
//               </Text>
//             </TouchableOpacity>

//             <Text style={[styles.modalTitle, { color: theme.text }]}>
//               {t("editProfile.modal.title")}
//             </Text>

//             <TouchableOpacity
//               onPress={() => {
//                 setBio(tempBio);
//                 setBioModalVisible(false);
//               }}
//               hitSlop={10}
//             >
//               <Text
//                 style={[styles.saveModalText, { color: theme.primary }]}
//               >
//                 {t("editProfile.modal.save")}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
//             <View
//               style={[
//                 styles.richWrap,
//                 { borderColor: theme.border, backgroundColor: theme.card },
//               ]}
//             >
//               <RichEditor
//                 ref={richText}
//                 initialContentHTML={tempBio}
//                 style={styles.richEditor}
//                 placeholder={t("editProfile.placeholders.bioEditor")}
//                 onChange={setTempBio}
//                 editorStyle={{
//                   backgroundColor: theme.card as any,
//                   color: theme.text as any,
//                   placeholderColor: theme.mutedText as any,
//                   contentCSSText: `
//                     * { font-size: 16px; line-height: 1.5; }
//                     body { padding: 8px; }
//                   `,
//                 }}
//               />
//             </View>

//             <View
//               style={[
//                 styles.toolbarWrap,
//                 { backgroundColor: theme.card, borderColor: theme.border },
//               ]}
//             >
//               <RichToolbar
//                 editor={richText}
//                 style={[styles.richToolbar, { backgroundColor: theme.card }]}
//                 actions={[
//                   "bold",
//                   "italic",
//                   "underline",
//                   "insertBulletsList",
//                   "insertOrderedList",
//                   "insertLink",
//                 ]}
//                 iconTint={theme.icon as any}
//                 selectedIconTint={theme.primary as any}
//                 disabledIconTint={theme.subtleText as any}
//               />
//             </View>

//             <Text
//               style={[styles.modalHint, { color: theme.subtleText as any }]}
//             >
//               {t("editProfile.modal.hint")}
//             </Text>
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// function FormInput({ label, theme, style, ...props }: any) {
//   return (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={[styles.label, { color: theme.mutedText as any }]}>
//         {label}
//       </Text>

//       <View
//         style={[
//           styles.inputWrap,
//           { borderColor: theme.border, backgroundColor: theme.card },
//         ]}
//       >
//         <TextInput
//           {...props}
//           style={[styles.input, { color: theme.text }, style]}
//           placeholderTextColor={theme.mutedText as any}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },

//   loadingOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.55)",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },

//   loadingCard: {
//     width: "100%",
//     maxWidth: 360,
//     borderRadius: 18,
//     padding: 16,
//     borderWidth: 1,
//     alignItems: "center",
//   },

//   loadingText: {
//     marginTop: 10,
//     fontSize: 15,
//     fontWeight: "900",
//   },

//   loadingSubText: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   coverContainer: {
//     height: 220,
//     position: "relative",
//   },

//   coverImage: {
//     width: "100%",
//     height: "100%",
//   },

//   coverPlaceholder: {
//     flex: 1,
//   },

//   coverShade: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 90,
//   },

//   coverEditBtn: {
//     position: "absolute",
//     right: 14,
//     bottom: 50,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 12,
//     height: 40,
//     borderRadius: 999,
//     borderWidth: 1,
//     ...Platform.select({
//       ios: {
//         shadowOpacity: 0.12,
//         shadowRadius: 12,
//         shadowOffset: { width: 0, height: 8 },
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },

//   coverEditText: {
//     fontSize: 13,
//     fontWeight: "900",
//   },

//   headerCardWrap: {
//     paddingHorizontal: 16,
//     marginTop: -36,
//     marginBottom: 8,
//   },

//   headerCard: {
//     borderRadius: 18,
//     borderWidth: 1,
//     padding: 14,
//     ...Platform.select({
//       ios: {
//         shadowOpacity: 0.06,
//         shadowRadius: 14,
//         shadowOffset: { width: 0, height: 10 },
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },

//   avatarRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },

//   avatarWrapper: {
//     width: 96,
//     height: 96,
//     borderRadius: 28,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//     position: "relative",
//   },

//   avatar: {
//     width: "100%",
//     height: "100%",
//   },

//   avatarEditBtn: {
//     position: "absolute",
//     bottom: 8,
//     right: 8,
//     width: 30,
//     height: 30,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   gifBadge: {
//     position: "absolute",
//     left: 6,
//     bottom: 6,
//     paddingHorizontal: 7,
//     height: 20,
//     borderRadius: 999,
//     backgroundColor: "rgba(0,0,0,0.65)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   gifBadgeText: {
//     color: "#FFF",
//     fontSize: 10,
//     fontWeight: "900",
//   },

//   headerTitle: {
//     fontSize: 16,
//     fontWeight: "900",
//   },

//   headerSub: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   formSection: {
//     paddingHorizontal: 16,
//     marginTop: 6,
//   },

//   sectionMiniTitle: {
//     marginTop: 8,
//     marginBottom: 10,
//     fontSize: 13,
//     fontWeight: "900",
//   },

//   label: {
//     fontSize: 12,
//     fontWeight: "800",
//     marginBottom: 6,
//   },

//   inputWrap: {
//     borderWidth: 1,
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     height: 48,
//     justifyContent: "center",
//   },

//   input: {
//     fontSize: 14,
//     fontWeight: "700",
//     paddingVertical: 0,
//   },

//   dropdownWrap: {
//     borderWidth: 1,
//     borderRadius: 16,
//     paddingHorizontal: 10,
//     height: 52,
//     justifyContent: "center",
//     marginBottom: 14,
//   },

//   dropdown: {
//     width: "100%",
//   },

//   dropdownContainer: {
//     borderRadius: 16,
//     borderWidth: 1,
//     overflow: "hidden",
//   },

//   bioPreviewBox: {
//     borderWidth: 1,
//     borderRadius: 18,
//     padding: 14,
//     marginTop: 6,
//     marginBottom: 8,
//   },

//   bioHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginBottom: 8,
//   },

//   bioIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   bioTitle: {
//     fontSize: 13,
//     fontWeight: "900",
//   },

//   bioPreviewText: {
//     fontSize: 13,
//     fontWeight: "700",
//     lineHeight: 18,
//   },

//   saveButton: {
//     height: 52,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 10,
//   },

//   saveText: {
//     fontWeight: "900",
//     fontSize: 15,
//   },

//   footerHint: {
//     marginTop: 10,
//     fontSize: 11,
//     fontWeight: "700",
//     textAlign: "center",
//   },

//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },

//   modalTitle: {
//     fontSize: 15,
//     fontWeight: "900",
//   },

//   cancelText: {
//     fontSize: 14,
//     fontWeight: "800",
//   },

//   saveModalText: {
//     fontSize: 14,
//     fontWeight: "900",
//   },

//   richWrap: {
//     borderWidth: 1,
//     borderRadius: 18,
//     overflow: "hidden",
//   },

//   richEditor: {
//     minHeight: 220,
//   },

//   toolbarWrap: {
//     marginTop: 10,
//     borderWidth: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//   },

//   richToolbar: {
//     borderRadius: 16,
//   },

//   modalHint: {
//     marginTop: 10,
//     fontSize: 11,
//     fontWeight: "700",
//   },
// });

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { updateProfile } from "@/redux/slices/profileSlice";
import { getMyInventory, selectMyStore } from "@/redux/slices/storeControl.slice";
import { debitMyCoinz } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { uploadToCloudinary } from "@/services/upload.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function EditProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.profile);
  const myStore = useSelector(selectMyStore);
  const myCoinz = Number(myStore?.coinzBalance || 0);

  const AVATAR_GIF_COST = 2000;
  const [avatarGifNeedsPayment, setAvatarGifNeedsPayment] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { t } = useTranslation();

  const { colorScheme } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const richText = useRef<RichEditor | null>(null);

  const COUNTRIES = useMemo(
    () => [
      {
        label: t("editProfile.countries.egypt"),
        value: t("editProfile.countries.egypt"),
      },
      {
        label: t("editProfile.countries.saudiArabia"),
        value: t("editProfile.countries.saudiArabia"),
      },
      {
        label: t("editProfile.countries.uae"),
        value: t("editProfile.countries.uae"),
      },
      {
        label: t("editProfile.countries.unitedStates"),
        value: t("editProfile.countries.unitedStates"),
      },
      {
        label: t("editProfile.countries.morocco"),
        value: t("editProfile.countries.morocco"),
      },
    ],
    [t]
  );

  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [country, setCountry] = useState("");

  const [avatar, setAvatar] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);

  const [avatarIsGif, setAvatarIsGif] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [bioModalVisible, setBioModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const currentAvatar = String((user as any)?.avatar || "");

    setUserId((user as any)?.atUsername || "");
    setBio((user as any)?.bio || "");
    setTempBio((user as any)?.bio || "");
    setCountry((user as any)?.country || "");
    setAvatar(currentAvatar || null);
    setCover((user as any)?.coverImage || null);

    setAvatarIsGif(
      currentAvatar.toLowerCase().includes(".gif") ||
      currentAvatar.toLowerCase().includes("image/gif")
    );
    setAvatarGifNeedsPayment(false);
  }, [user]);

  const canSave = useMemo(() => {
    return !loading && !savingProfile;
  }, [loading, savingProfile]);

  const ensureMediaPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t("editProfile.alerts.permissionTitle"),
        t("editProfile.alerts.permissionMessage")
      );
      return false;
    }

    return true;
  };

  const isGifAsset = (asset: ImagePicker.ImagePickerAsset) => {
    const uri = String(asset?.uri || "").toLowerCase();
    const fileName = String((asset as any)?.fileName || "").toLowerCase();
    const mimeType = String((asset as any)?.mimeType || "").toLowerCase();

    return (
      mimeType === "image/gif" ||
      fileName.endsWith(".gif") ||
      uri.includes(".gif")
    );
  };

  const pickNormalImage = async (
    type: "avatar" | "cover",
    withCrop: boolean = false
  ) => {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      // false = اختيار الصورة كما هي
      // true = فتح شاشة القص Crop
      allowsEditing: withCrop,

      // aspect يعمل فقط مع allowsEditing true
      aspect:
        withCrop && type === "avatar"
          ? [1, 1]
          : withCrop && type === "cover"
            ? [16, 9]
            : undefined,

      quality: withCrop ? 0.9 : 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    const uri = asset?.uri;

    if (!uri) return;

    // حماية: لو المستخدم اختار GIF من خيار الصورة العادية،
    // لا نقصه حتى لا يتحول لصورة ثابتة.
    if (isGifAsset(asset)) {
      Alert.alert(
        "صورة متحركة",
        "للحفاظ على حركة GIF اخترها من خيار Choose GIF، وليس من خيار الصورة العادية."
      );
      return;
    }

    if (type === "avatar") {
      setAvatar(uri);
      setAvatarIsGif(false);
      setAvatarGifNeedsPayment(false);
    } else {
      setCover(uri);
    }
  };

  const pickGifAvatar = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      // مهم جدًا:
      // لا تستخدم allowsEditing مع GIF حتى لا يتحول إلى صورة ثابتة.
      allowsEditing: false,

      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    const uri = asset?.uri;

    if (!uri) return;

    if (!isGifAsset(asset)) {
      Alert.alert("GIF فقط", "من فضلك اختر صورة بصيغة GIF.");
      return;
    }

    setAvatar(uri);
    setAvatarIsGif(true);
    setAvatarGifNeedsPayment(true);
  };

  const openAvatarPicker = () => {
    Alert.alert("Change Avatar", "اختر نوع الأفاتار", [
      {
        text: "Choose Image",
        onPress: () => pickNormalImage("avatar", false),
      },
      {
        text: "Choose Image with Crop",
        onPress: () => pickNormalImage("avatar", true),
      },
      {
        text: "Choose GIF",
        onPress: pickGifAvatar,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const openCoverPicker = () => {
    Alert.alert("Change Cover", "اختر طريقة تغيير الغلاف", [
      {
        text: "Choose Image",
        onPress: () => pickNormalImage("cover", false),
      },
      {
        text: "Choose Image with Crop",
        onPress: () => pickNormalImage("cover", true),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const pickImage = async (type: "avatar" | "cover") => {
    if (type === "avatar") {
      openAvatarPicker();
      return;
    }

    openCoverPicker();
  };

  const shouldUploadLocalFile = (uri?: string | null) => {
    const value = String(uri || "");
    return value.startsWith("file") || value.startsWith("content");
  };

  const handleSave = async () => {
    if (!canSave) return;

    const needsGifPayment =
      avatarGifNeedsPayment &&
      avatarIsGif &&
      shouldUploadLocalFile(avatar);

    if (needsGifPayment && myCoinz < AVATAR_GIF_COST) {
      Alert.alert(
        "رصيد غير كافٍ",
        `اختيار صورة متحركة يحتاج ${AVATAR_GIF_COST} Coinz، بينما رصيدك الحالي ${myCoinz} Coinz.`
      );
      return;
    }

    setSavingProfile(true);

    try {
      let avatarUrl = avatar;
      let coverUrl = cover;

      if (shouldUploadLocalFile(avatar)) {
        avatarUrl = await uploadToCloudinary(avatar!, "image");
      }

      if (shouldUploadLocalFile(cover)) {
        coverUrl = await uploadToCloudinary(cover!, "image");
      }

      if (needsGifPayment) {
        const debitRes = await dispatch(
          debitMyCoinz({
            amount: AVATAR_GIF_COST,
            reason: "avatar_gif",
          }) as any
        );

        if (!debitMyCoinz.fulfilled.match(debitRes)) {
          Alert.alert(
            "تعذر الخصم",
            String((debitRes as any)?.payload || "فشل خصم الرصيد")
          );

          await dispatch(getMyInventory() as any);
          return;
        }
      }

      await dispatch(
        updateProfile({
          atUsername: userId.trim(),
          bio,
          country,
          avatar: avatarUrl || undefined,
          coverImage: coverUrl || undefined,
          oldPassword: oldPass.trim() || undefined,
          newPassword: newPass.trim() || undefined,
        })
      ).unwrap();

      if (needsGifPayment) {
        setAvatarGifNeedsPayment(false);
        await dispatch(getMyInventory() as any);
      }

      Alert.alert(
        t("editProfile.alerts.successTitle"),
        t("editProfile.alerts.successMessage")
      );
    } catch (e: any) {
      Alert.alert(
        t("editProfile.alerts.errorTitle"),
        String(e?.message || e || t("editProfile.alerts.errorFallback"))
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <Modal visible={!!loading || savingProfile} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <ActivityIndicator />

            <Text style={[styles.loadingText, { color: theme.text }]}>
              {savingProfile ? "Saving profile..." : t("editProfile.loading.title")}
            </Text>

            <Text
              style={[
                styles.loadingSubText,
                { color: theme.mutedText as any },
              ]}
            >
              {savingProfile
                ? avatarGifNeedsPayment
                  ? `Uploading GIF and deducting ${AVATAR_GIF_COST} Coinz...`
                  : "Uploading and saving changes..."
                : t("editProfile.loading.subtitle")}
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View
          style={[styles.coverContainer, { backgroundColor: theme.surface2 }]}
        >
          {cover ? (
            <Image
              source={{ uri: cover }}
              style={styles.coverImage}
              contentFit="cover"
              transition={0}
            />
          ) : (
            <View
              style={[
                styles.coverPlaceholder,
                { backgroundColor: theme.surface2 },
              ]}
            />
          )}

          <View
            style={[styles.coverShade, { backgroundColor: theme.overlay }]}
          />

          <TouchableOpacity
            style={[
              styles.coverEditBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => pickImage("cover")}
            activeOpacity={0.85}
          >
            <Ionicons name="camera-outline" size={18} color={theme.icon} />

            <Text style={[styles.coverEditText, { color: theme.text }]}>
              {t("editProfile.actions.changeCover")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCardWrap}>
          <View
            style={[
              styles.headerCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.avatarRow}>
              <View
                style={[
                  styles.avatarWrapper,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface2,
                  },
                ]}
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatar}
                    contentFit="cover"
                    transition={0}
                  />
                ) : (
                  <Ionicons
                    name="person-outline"
                    size={52}
                    color={theme.icon}
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.avatarEditBtn,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => pickImage("avatar")}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="camera"
                    size={14}
                    color={theme.primaryText}
                  />
                </TouchableOpacity>

                {avatarIsGif && (
                  <View style={styles.gifBadge}>
                    <Text style={styles.gifBadgeText}>GIF</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {t("editProfile.header.title")}
                </Text>

                <Text
                  style={[
                    styles.headerSub,
                    { color: theme.mutedText as any },
                  ]}
                >
                  {t("editProfile.header.subtitle")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
    


          <TouchableOpacity
            style={[
              styles.bioPreviewBox,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
            onPress={() => setBioModalVisible(true)}
            activeOpacity={0.9}
          >
            <View style={styles.bioHeader}>
              <View
                style={[
                  styles.bioIcon,
                  { backgroundColor: theme.primarySoft as any },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={theme.primary}
                />
              </View>

              <Text style={[styles.bioTitle, { color: theme.text }]}>
                {t("editProfile.fields.bio")}
              </Text>

              <View style={{ flex: 1 }} />

              <Ionicons name="create-outline" size={18} color={theme.icon} />
            </View>

            <Text
              numberOfLines={4}
              style={[
                styles.bioPreviewText,
                { color: theme.mutedText as any },
              ]}
            >
              {bio
                ? bio.replace(/<[^>]+>/g, "")
                : t("editProfile.placeholders.bioPreview")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.primary },
              !canSave && { opacity: 0.6 },
            ]}
            disabled={!canSave}
            onPress={handleSave}
            activeOpacity={0.9}
          >
            {savingProfile ? (
              <ActivityIndicator size="small" color={theme.primaryText} />
            ) : (
              <Ionicons
                name="save-outline"
                size={18}
                color={theme.primaryText}
              />
            )}

            <Text style={[styles.saveText, { color: theme.primaryText }]}>
              {savingProfile ? "Saving..." : t("editProfile.actions.saveChanges")}
            </Text>
          </TouchableOpacity>

          <Text
            style={[styles.footerHint, { color: theme.subtleText as any }]}
          >
            {t("editProfile.footerHint")}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={bioModalVisible}
        animationType="slide"
        onRequestClose={() => setBioModalVisible(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.background }}
          edges={["top", "bottom"]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: theme.border,
                backgroundColor: theme.background,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setBioModalVisible(false)}
              hitSlop={10}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: theme.mutedText as any },
                ]}
              >
                {t("editProfile.modal.cancel")}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t("editProfile.modal.title")}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setBio(tempBio);
                setBioModalVisible(false);
              }}
              hitSlop={10}
            >
              <Text
                style={[styles.saveModalText, { color: theme.primary }]}
              >
                {t("editProfile.modal.save")}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
            <View
              style={[
                styles.richWrap,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <RichEditor
                ref={richText}
                initialContentHTML={tempBio}
                style={styles.richEditor}
                placeholder={t("editProfile.placeholders.bioEditor")}
                onChange={setTempBio}
                editorStyle={{
                  backgroundColor: theme.card as any,
                  color: theme.text as any,
                  placeholderColor: theme.mutedText as any,
                  contentCSSText: `
                    * { font-size: 16px; line-height: 1.5; }
                    body { padding: 8px; }
                  `,
                }}
              />
            </View>

            <View
              style={[
                styles.toolbarWrap,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <RichToolbar
                editor={richText}
                style={[styles.richToolbar, { backgroundColor: theme.card }]}
                actions={[
                  "bold",
                  "italic",
                  "underline",
                  "insertBulletsList",
                  "insertOrderedList",
                  "insertLink",
                ]}
                iconTint={theme.icon as any}
                selectedIconTint={theme.primary as any}
                disabledIconTint={theme.subtleText as any}
              />
            </View>

            <Text
              style={[styles.modalHint, { color: theme.subtleText as any }]}
            >
              {t("editProfile.modal.hint")}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function FormInput({ label, theme, style, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: theme.mutedText as any }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrap,
          { borderColor: theme.border, backgroundColor: theme.card },
        ]}
      >
        <TextInput
          {...props}
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.mutedText as any}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
  },

  loadingSubText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },

  coverContainer: {
    height: 220,
    position: "relative",
  },

  coverImage: {
    width: "100%",
    height: "100%",
  },

  coverPlaceholder: {
    flex: 1,
  },

  coverShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },

  coverEditBtn: {
    position: "absolute",
    right: 14,
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 8,
      },
    }),
  },

  coverEditText: {
    fontSize: 13,
    fontWeight: "900",
  },

  headerCardWrap: {
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 8,
  },

  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 3,
      },
    }),
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarEditBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  gifBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  gifBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  headerSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },

  formSection: {
    paddingHorizontal: 16,
    marginTop: 6,
  },

  sectionMiniTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "900",
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },

  inputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: "center",
  },

  input: {
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 0,
  },

  dropdownWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 52,
    justifyContent: "center",
    marginBottom: 14,
  },

  dropdown: {
    width: "100%",
  },

  dropdownContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },

  bioPreviewBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 6,
    marginBottom: 8,
  },

  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  bioIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  bioTitle: {
    fontSize: 13,
    fontWeight: "900",
  },

  bioPreviewText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  saveButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  saveText: {
    fontWeight: "900",
    fontSize: 15,
  },

  footerHint: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "800",
  },

  saveModalText: {
    fontSize: 14,
    fontWeight: "900",
  },

  richWrap: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },

  richEditor: {
    minHeight: 220,
  },

  toolbarWrap: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  richToolbar: {
    borderRadius: 16,
  },

  modalHint: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "700",
  },
});