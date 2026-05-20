
// import BirthdatePickerModal from "@/components/settings/BirthdatePickerModal";
// import BlockedUsersSettingsModal from "@/components/settings/BlockedUsersModal";
// import CountryCityPickerModal, {
//   CityPickerValue,
//   CountryPickerValue,
// } from "@/components/settings/CountryCityPickerModal";
// import SettingsChoiceModal from "@/components/settings/SettingsChoiceModal";
// import SettingsTextModal from "@/components/settings/SettingsTextModal";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
// import { useTranslation } from "@/hooks/useTranslation";
// import {
//   leaveAllActiveRooms,
//   logout,
//   toggleInvisible,
// } from "@/redux/slices/authSlice";
// import {
//   changePassword,
//   clearChangePasswordError,
//   resetChangePasswordState,
// } from "@/redux/slices/changePasswordSlice";
// import { resetChatState } from "@/redux/slices/chatSlice";
// import { getBlockedUsers, unblockUser } from "@/redux/slices/friendSlice";
// import { updateProfile } from "@/redux/slices/profileSlice";
// import { resetRoomState, setActiveRoom } from "@/redux/slices/room.slice";
// import { setTabBarHidden } from "@/redux/slices/ui.slice";
// import {
//   changeMyEmail,
//   fetchMyFullUser,
//   resetUserState,
//   selectMe,
//   selectUserUpdating,
//   updateMyProfileSettings,
// } from "@/redux/slices/userSlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import {
//   getNotificationSoundEnabled,
//   setNotificationSoundEnabled,
// } from "@/services/localSettings.service";
// import { disconnectSocket } from "@/services/socket";
// // import { uploadToCloudinary } from "@/services/upload.service";
// import { LocalUploadFile } from "@/services/upload/types";
// import { uploadSingleFile } from "@/services/upload/uploadApi";
// import { Ionicons } from "@expo/vector-icons";
// import { Country } from "country-state-city";
// import { Image } from "expo-image";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import { useDispatch, useSelector } from "react-redux";

// type EditField = "status" | "email" | "currentPassword" | "newPassword";

// export default function SettingsScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const { colorScheme, themePreference, setThemePreference } = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

//   const { onScroll, onScrollBeginDrag, showTabBar } = useHideTabBarOnScroll();
//   const { t, isRTL } = useTranslation();

//   const { user: authUser } = useSelector((state: RootState) => state.auth);
//   const me = useSelector(selectMe);
//   const updatingUser = useSelector(selectUserUpdating);

//   const { blockedUsers, loading: blockedLoading } = useSelector(
//     (state: RootState) => state.friends
//   );

//   const {
//     loading: passwordLoading,
//     success: passwordSuccess,
//     error: passwordError,
//   } = useSelector((state: RootState) => state.changePassword);

//   // ✅ أهم تعديل: اقرأ من me أولًا لأنه هو الذي يتحدث بعد fetchMyFullUser/updateMyProfileSettings
//   const currentUser = me || authUser || null;

//   const [notifications, setNotifications] = useState(true);
//   const [sounds, setSounds] = useState(true);
//   const [loadingSoundSetting, setLoadingSoundSetting] = useState(true);

//   const [friendsOnlyMessages, setFriendsOnlyMessages] = useState(false);

//   const [savingMedia, setSavingMedia] = useState(false);
//   const [savingAction, setSavingAction] = useState("");

//   const [blockedVisible, setBlockedVisible] = useState(false);
//   const [blockedRefreshing, setBlockedRefreshing] = useState(false);

//   const [editField, setEditField] = useState<EditField | null>(null);
//   const [genderModalVisible, setGenderModalVisible] = useState(false);

//   const [countryModalVisible, setCountryModalVisible] = useState(false);
//   const [cityModalVisible, setCityModalVisible] = useState(false);
//   const [birthdateModalVisible, setBirthdateModalVisible] = useState(false);

//   const [currentPasswordValue, setCurrentPasswordValue] = useState("");
//   const [newPasswordValue, setNewPasswordValue] = useState("");

//   const role = String(
//     currentUser?.role || currentUser?.accountType || currentUser?.type || ""
//   ).toLowerCase();

//   const isAdmin = role === "admin";

//   const avatar = String(
//     currentUser?.activeCustomization?.avatarGif || currentUser?.avatar || ""
//   );

//   const cover = String(currentUser?.coverImage || currentUser?.cover || "");

//   const username = String(currentUser?.username || "");
//   const email = String(currentUser?.email || "");

//   const statusMessage = String(
//     currentUser?.statusMessage || currentUser?.status || currentUser?.bio || ""
//   );

//   const country = String(currentUser?.country || "");
//   const city = String(currentUser?.city || "");

//   const countryCode = String(
//     currentUser?.countryCode || findCountryCodeByName(country) || ""
//   );

//   const gender = String(currentUser?.gender || "");

//   const birthdate = formatBirthdate(
//     currentUser?.birthdate || currentUser?.dateOfBirth
//   );

//   const darkModeEnabled = themePreference === "dark";

//   const pageLoading =
//     !!savingAction || savingMedia || updatingUser || passwordLoading;

//   const loadingText =
//     savingAction || (savingMedia ? "Uploading image..." : "Saving...");

//   useEffect(() => {
//     loadLocalSettings();
//   }, []);

//   useEffect(() => {
//     if (!me) {
//       dispatch(fetchMyFullUser());
//     }
//   }, [me, dispatch]);

//   useEffect(() => {
//     const allowMessages = me?.privacy?.allowMessages;
//     setFriendsOnlyMessages(allowMessages === false);
//   }, [me?.privacy?.allowMessages]);

//   useEffect(() => {
//     if (passwordError) {
//       Toast.show({
//         type: "error",
//         text1: "Error",
//         text2: String(passwordError),
//       });

//       dispatch(clearChangePasswordError());
//       setSavingAction("");
//     }
//   }, [passwordError, dispatch]);

//   useEffect(() => {
//     if (passwordSuccess) {
//       Toast.show({
//         type: "success",
//         text1: "Success",
//         text2: "Password changed successfully",
//       });

//       dispatch(resetChangePasswordState());
//       setCurrentPasswordValue("");
//       setNewPasswordValue("");
//       setEditField(null);
//       setSavingAction("");
//     }
//   }, [passwordSuccess, dispatch]);

//   const editConfig = useMemo(() => {
//     if (!editField) return null;

//     const config: Record<
//       EditField,
//       {
//         title: string;
//         value: string;
//         placeholder: string;
//         multiline?: boolean;
//         secureTextEntry?: boolean;
//         keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
//       }
//     > = {
//       status: {
//         title: "Status Message",
//         value: statusMessage,
//         placeholder: "Write your status message",
//         multiline: true,
//       },

//       email: {
//         title: "Email",
//         value: email,
//         placeholder: "example@gmail.com",
//         keyboardType: "email-address",
//       },

//       currentPassword: {
//         title: "Current Password",
//         value: currentPasswordValue,
//         placeholder: "Enter current password",
//         secureTextEntry: true,
//       },

//       newPassword: {
//         title: "New Password",
//         value: newPasswordValue,
//         placeholder: "Enter new password",
//         secureTextEntry: true,
//       },
//     };

//     return config[editField];
//   }, [editField, statusMessage, email, currentPasswordValue, newPasswordValue]);

//   async function runWithLoading(label: string, action: () => Promise<void>) {
//     try {
//       setSavingAction(label);
//       await action();
//     } finally {
//       setSavingAction("");
//     }
//   }

//   async function loadLocalSettings() {
//     try {
//       setLoadingSoundSetting(true);
//       const savedSound = await getNotificationSoundEnabled();
//       setSounds(savedSound);
//     } finally {
//       setLoadingSoundSetting(false);
//     }
//   }

//   async function refreshMe() {
//     try {
//       const freshUser = await dispatch(fetchMyFullUser()).unwrap();
//       return freshUser;
//     } catch {
//       return null;
//     }
//   }

//   async function handleToggleFriendsOnlyMessages(value: boolean) {
//     const oldValue = friendsOnlyMessages;
//     setFriendsOnlyMessages(value);

//     await runWithLoading("Saving privacy setting...", async () => {
//       try {
//         await dispatch(
//           updateMyProfileSettings({
//             privacy: {
//               allowMessages: !value,
//             },
//           } as any)
//         ).unwrap();

//         await refreshMe();
//       } catch (error: any) {
//         setFriendsOnlyMessages(oldValue);

//         Toast.show({
//           type: "error",
//           text1: "Error",
//           text2: String(error?.message || error || "Failed to update setting"),
//         });
//       }
//     });
//   }

//   function handleToggleDarkMode(value: boolean) {
//     setThemePreference(value ? "dark" : "light");
//   }

//   async function handleToggleOnline(value: boolean) {
//     await runWithLoading("Saving online status...", async () => {
//       dispatch(toggleInvisible(!value));
//     });
//   }

//   async function handleToggleSound(value: boolean) {
//     await runWithLoading("Saving sound setting...", async () => {
//       setSounds(value);
//       await setNotificationSoundEnabled(value);
//     });
//   }

//   async function ensureMediaPermission() {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       Alert.alert("Permission required", "Please allow access to your photos.");
//       return false;
//     }

//     return true;
//   }

//   function isGifAsset(asset: ImagePicker.ImagePickerAsset) {
//     const uri = String(asset?.uri || "").toLowerCase();
//     const fileName = String((asset as any)?.fileName || "").toLowerCase();
//     const mimeType = String((asset as any)?.mimeType || "").toLowerCase();

//     return (
//       mimeType === "image/gif" ||
//       fileName.endsWith(".gif") ||
//       uri.includes(".gif")
//     );
//   }

//   // async function pickNormalImage(type: "avatar" | "cover", withCrop: boolean) {
//   //   const ok = await ensureMediaPermission();
//   //   if (!ok) return;

//   //   const result = await ImagePicker.launchImageLibraryAsync({
//   //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//   //     allowsEditing: withCrop,
//   //     aspect:
//   //       withCrop && type === "avatar"
//   //         ? [1, 1]
//   //         : withCrop && type === "cover"
//   //         ? [16, 9]
//   //         : undefined,
//   //     quality: withCrop ? 0.9 : 0.85,
//   //   });

//   //   if (result.canceled) return;

//   //   const asset = result.assets?.[0];
//   //   const uri = asset?.uri;

//   //   if (!uri) return;

//   //   if (isGifAsset(asset) && type === "avatar") {
//   //     Alert.alert(
//   //       "GIF",
//   //       "لو تريد الحفاظ على حركة GIF اخترها من خيار Choose GIF."
//   //     );
//   //     return;
//   //   }

//   //   await uploadAndSaveMedia(type, uri);
//   // }
//   async function pickNormalImage(type: "avatar" | "cover", withCrop: boolean) {
//     const ok = await ensureMediaPermission();
//     if (!ok) return;

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: withCrop,
//       aspect:
//         withCrop && type === "avatar"
//           ? [1, 1]
//           : withCrop && type === "cover"
//             ? [16, 9]
//             : undefined,
//       quality: withCrop ? 0.9 : 0.85,
//     });

//     if (result.canceled) return;

//     const asset = result.assets?.[0];
//     const uri = asset?.uri;

//     if (!asset || !uri) return;

//     if (isGifAsset(asset) && type === "avatar") {
//       Alert.alert(
//         "GIF",
//         "لو تريد الحفاظ على حركة GIF اخترها من خيار Choose GIF."
//       );
//       return;
//     }

//     await uploadAndSaveMedia(type, asset);
//   }
//   // async function pickGifAvatar() {
//   //   const ok = await ensureMediaPermission();
//   //   if (!ok) return;

//   //   const result = await ImagePicker.launchImageLibraryAsync({
//   //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//   //     allowsEditing: false,
//   //     quality: 1,
//   //   });

//   //   if (result.canceled) return;

//   //   const asset = result.assets?.[0];
//   //   const uri = asset?.uri;

//   //   if (!uri) return;

//   //   if (!isGifAsset(asset)) {
//   //     Alert.alert("GIF only", "Please choose GIF image.");
//   //     return;
//   //   }

//   //   await uploadAndSaveMedia("avatar", uri);
//   // }
// async function pickGifAvatar() {
//   const ok = await ensureMediaPermission();
//   if (!ok) return;

//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     allowsEditing: false,
//     quality: 1,
//   });

//   if (result.canceled) return;

//   const asset = result.assets?.[0];
//   const uri = asset?.uri;

//   if (!asset || !uri) return;

//   if (!isGifAsset(asset)) {
//     Alert.alert("GIF only", "Please choose GIF image.");
//     return;
//   }

//   await uploadAndSaveMedia("avatar", asset, true);
// }
//   function openAvatarPicker() {
//     if (pageLoading) return;

//     Alert.alert("Change Avatar", "اختر نوع الصورة", [
//       {
//         text: "Choose Image",
//         onPress: () => pickNormalImage("avatar", false),
//       },
//       {
//         text: "Choose Image with Crop",
//         onPress: () => pickNormalImage("avatar", true),
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
//   }

//   function openCoverPicker() {
//     if (pageLoading) return;

//     Alert.alert("Change Cover", "اختر صورة الغلاف", [
//       {
//         text: "Choose Image",
//         onPress: () => pickNormalImage("cover", false),
//       },
//       {
//         text: "Choose Image with Crop",
//         onPress: () => pickNormalImage("cover", true),
//       },
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//     ]);
//   }

//   // async function uploadAndSaveMedia(type: "avatar" | "cover", uri: string) {
//   //   try {
//   //     setSavingMedia(true);
//   //     setSavingAction(
//   //       type === "avatar" ? "Updating avatar..." : "Updating cover..."
//   //     );

//   //     const uploadedUrl = await uploadToCloudinary(uri, "image");

//   //     await dispatch(
//   //       updateProfile({
//   //         avatar: type === "avatar" ? uploadedUrl : undefined,
//   //         coverImage: type === "cover" ? uploadedUrl : undefined,
//   //       } as any)
//   //     ).unwrap();

//   //     await refreshMe();

//   //     Toast.show({
//   //       type: "success",
//   //       text1: "Success",
//   //       text2: type === "avatar" ? "Avatar updated" : "Cover updated",
//   //     });
//   //   } catch (error: any) {
//   //     Alert.alert("Error", String(error?.message || error || "Upload failed"));
//   //   } finally {
//   //     setSavingMedia(false);
//   //     setSavingAction("");
//   //   }
//   // }
// async function uploadAndSaveMedia(
//   type: "avatar" | "cover",
//   asset: ImagePicker.ImagePickerAsset,
//   isGif = false
// ) {
//   try {
//     setSavingMedia(true);
//     setSavingAction(
//       type === "avatar" ? "Updating avatar..." : "Updating cover..."
//     );

//     const userId = String(currentUser?._id || currentUser?.id || "");

//     const file = getUploadFileFromAsset(
//       asset,
//       isGif ? `avatar-${Date.now()}.gif` : `${type}-${Date.now()}.jpg`
//     );

//     const uploaded = await uploadSingleFile({
//       file,
//       folder: isGif ? "avatar-gifs" : type === "avatar" ? "avatars" : "covers",
//       userId,
//     });

//     const payload: any = {};

//     if (type === "cover") {
//       payload.coverImage = uploaded.url;
//       payload.cover = uploaded.url;
//       payload.coverImagePublicId = uploaded.publicId;
//     }

//     if (type === "avatar" && isGif) {
//       payload.avatarGif = uploaded.url;
//       payload.avatarGifPublicId = uploaded.publicId;

//       payload.activeCustomization = {
//         ...(currentUser?.activeCustomization || {}),
//         avatarGif: uploaded.url,
//       };
//     }

//     if (type === "avatar" && !isGif) {
//       payload.avatar = uploaded.url;
//       payload.avatarPublicId = uploaded.publicId;

//       /**
//        * مهم:
//        * لو المستخدم كان عنده GIF قديم، والصورة الجديدة عادية،
//        * امسح avatarGif حتى تظهر الصورة العادية بدل المتحركة.
//        */
//       payload.avatarGif = "";
//       payload.avatarGifPublicId = "";

//       payload.activeCustomization = {
//         ...(currentUser?.activeCustomization || {}),
//         avatarGif: "",
//       };
//     }

//     await dispatch(updateProfile(payload)).unwrap();

//     await refreshMe();

//     Toast.show({
//       type: "success",
//       text1: "Success",
//       text2:
//         type === "avatar"
//           ? isGif
//             ? "Avatar GIF updated"
//             : "Avatar updated"
//           : "Cover updated",
//     });
//   } catch (error: any) {
//     Alert.alert("Error", String(error?.message || error || "Upload failed"));
//   } finally {
//     setSavingMedia(false);
//     setSavingAction("");
//   }
// }
//   async function saveTextField(value: string) {
//     if (!editField) return;

//     try {
//       if (editField === "currentPassword") {
//         if (!value.trim()) {
//           Toast.show({
//             type: "error",
//             text1: "Error",
//             text2: "Current password is required",
//           });
//           return;
//         }

//         setCurrentPasswordValue(value);
//         setEditField("newPassword");
//         return;
//       }

//       if (editField === "newPassword") {
//         if (!currentPasswordValue.trim()) {
//           Toast.show({
//             type: "error",
//             text1: "Error",
//             text2: "Current password is required",
//           });
//           setEditField("currentPassword");
//           return;
//         }

//         if (value.trim().length < 6) {
//           Toast.show({
//             type: "error",
//             text1: "Error",
//             text2: "New password must be at least 6 characters",
//           });
//           return;
//         }

//         setNewPasswordValue(value);
//         setSavingAction("Changing password...");

//         dispatch(
//           changePassword({
//             currentPassword: currentPasswordValue,
//             newPassword: value,
//           })
//         );

//         return;
//       }

//       await runWithLoading("Saving changes...", async () => {
//         if (editField === "email") {
//           const cleanEmail = value.trim().toLowerCase();

//           if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
//             Toast.show({
//               type: "error",
//               text1: "Error",
//               text2: "Invalid email",
//             });
//             return;
//           }

//           await dispatch(changeMyEmail({ email: cleanEmail })).unwrap();
//           await refreshMe();
//         }

//         if (editField === "status") {
//           await dispatch(
//             updateProfile({
//               bio: value,
//               statusMessage: value,
//               status: value,
//             } as any)
//           ).unwrap();

//           await refreshMe();
//         }

//         setEditField(null);

//         Toast.show({
//           type: "success",
//           text1: "Success",
//           text2: "Updated successfully",
//         });
//       });
//     } catch (error: any) {
//       Toast.show({
//         type: "error",
//         text1: "Error",
//         text2: String(error?.message || error || "Update failed"),
//       });
//     }
//   }

//   async function saveGender(value: string) {
//     await runWithLoading("Saving gender...", async () => {
//       try {
//         setGenderModalVisible(false);

//         await dispatch(
//           updateMyProfileSettings({
//             gender: value,
//           } as any)
//         ).unwrap();

//         await refreshMe();

//         Toast.show({
//           type: "success",
//           text1: "Success",
//           text2: "Gender updated",
//         });
//       } catch (error: any) {
//         Toast.show({
//           type: "error",
//           text1: "Error",
//           text2: String(error?.message || error || "Failed to update gender"),
//         });
//       }
//     });
//   }

//   async function saveCountry(selectedCountry: CountryPickerValue) {
//     await runWithLoading("Saving country...", async () => {
//       try {
//         setCountryModalVisible(false);

//         await dispatch(
//           updateMyProfileSettings({
//             country: selectedCountry.name,
//             countryCode: selectedCountry.isoCode,
//             city: "",
//           } as any)
//         ).unwrap();

//         await refreshMe();

//         Toast.show({
//           type: "success",
//           text1: "Success",
//           text2: "Country updated",
//         });
//       } catch (error: any) {
//         Toast.show({
//           type: "error",
//           text1: "Error",
//           text2: String(error?.message || error || "Failed to update country"),
//         });
//       }
//     });
//   }

//   async function saveCity(selectedCity: CityPickerValue) {
//     await runWithLoading("Saving city...", async () => {
//       try {
//         setCityModalVisible(false);

//         await dispatch(
//           updateMyProfileSettings({
//             city: selectedCity.name,
//           } as any)
//         ).unwrap();

//         await refreshMe();

//         Toast.show({
//           type: "success",
//           text1: "Success",
//           text2: "City updated",
//         });
//       } catch (error: any) {
//         Toast.show({
//           type: "error",
//           text1: "Error",
//           text2: String(error?.message || error || "Failed to update city"),
//         });
//       }
//     });
//   }

//   const saveBirthdate = useCallback(
//     async (date: Date) => {
//       setBirthdateModalVisible(false);

//       await runWithLoading("Saving birthdate...", async () => {
//         try {
//           await dispatch(
//             updateMyProfileSettings({
//               birthdate: date.toISOString(),
//               dateOfBirth: date.toISOString(),
//             } as any)
//           ).unwrap();

//           await refreshMe();

//           Toast.show({
//             type: "success",
//             text1: "Success",
//             text2: "Birthdate updated",
//           });
//         } catch (error: any) {
//           Toast.show({
//             type: "error",
//             text1: "Error",
//             text2: String(
//               error?.message || error || "Failed to update birthdate"
//             ),
//           });
//         }
//       });
//     },
//     [dispatch]
//   );

//   async function openBlockedModal() {
//     setBlockedVisible(true);

//     try {
//       await dispatch(getBlockedUsers()).unwrap();
//     } catch { }
//   }

//   async function refreshBlockedUsers() {
//     try {
//       setBlockedRefreshing(true);
//       await dispatch(getBlockedUsers()).unwrap();
//     } finally {
//       setBlockedRefreshing(false);
//     }
//   }

//   function confirmUnblock(userId: string) {
//     Alert.alert("Unblock user", "Are you sure you want to unblock this user?", [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Unblock",
//         style: "destructive",
//         onPress: async () => {
//           await runWithLoading("Removing block...", async () => {
//             try {
//               await dispatch(unblockUser(userId) as any).unwrap();
//               await dispatch(getBlockedUsers()).unwrap();

//               Toast.show({
//                 type: "success",
//                 text1: "Success",
//                 text2: "User unblocked",
//               });
//             } catch (error: any) {
//               Toast.show({
//                 type: "error",
//                 text1: "Error",
//                 text2: String(error?.message || error || "Failed to unblock"),
//               });
//             }
//           });
//         },
//       },
//     ]);
//   }

//   async function handleLogout() {
//     try {
//       showTabBar();

//       try {
//         await dispatch(leaveAllActiveRooms()).unwrap();
//       } catch { }

//       dispatch(setActiveRoom(undefined));
//       dispatch(resetRoomState());

//       disconnectSocket();

//       await dispatch(logout()).unwrap();

//       dispatch(resetUserState());
//       dispatch(resetChatState());
//       dispatch(setTabBarHidden(false));

//       router.replace("/login");
//     } catch {
//       dispatch(setActiveRoom(undefined));
//       dispatch(resetRoomState());
//       dispatch(resetUserState());
//       dispatch(resetChatState());
//       dispatch(setTabBarHidden(false));

//       disconnectSocket();

//       try {
//         await dispatch(logout()).unwrap();
//       } catch { }

//       router.replace("/login");
//     }
//   }

//   return (
//     <View style={[styles.root, { backgroundColor: theme.background }]}>
//       <ScrollView
//         style={[styles.container, { backgroundColor: theme.background }]}
//         showsVerticalScrollIndicator={false}
//         onScrollBeginDrag={onScrollBeginDrag}
//         onScroll={onScroll}
//         scrollEventThrottle={16}
//         contentContainerStyle={{ paddingBottom: 35 }}
//       >
//         <Text style={[styles.pageTitle, { color: theme.text }]}></Text>

//         <View style={styles.profileBox}>
//           <TouchableOpacity
//             disabled={pageLoading}
//             activeOpacity={0.9}
//             onPress={openCoverPicker}
//             style={[styles.coverBox, { backgroundColor: theme.surface2 }]}
//           >
//             {cover ? (
//               <Image
//                 source={{ uri: cover }}
//                 style={styles.coverImage}
//                 contentFit="cover"
//               />
//             ) : (
//               <View style={styles.emptyCover}>
//                 <Ionicons name="image-outline" size={28} color={theme.icon} />
//               </View>
//             )}

//             <View style={styles.coverBtn}>
//               <Ionicons name="camera" size={14} color="#FFF" />
//               <Text style={styles.coverBtnText}>Change cover</Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             disabled={pageLoading}
//             activeOpacity={0.9}
//             onPress={openAvatarPicker}
//             style={[styles.avatarWrap, { borderColor: theme.background }]}
//           >
//             {avatar ? (
//               <Image
//                 source={{ uri: avatar }}
//                 style={styles.avatar}
//                 contentFit="cover"
//               />
//             ) : (
//               <View style={[styles.avatar, styles.emptyAvatar]}>
//                 <Ionicons name="person-outline" size={30} color="#9CA3AF" />
//               </View>
//             )}

//             <View style={styles.avatarCamera}>
//               <Ionicons name="camera" size={13} color="#FFF" />
//             </View>
//           </TouchableOpacity>

//           <Text
//             numberOfLines={1}
//             style={[styles.username, { color: theme.text }]}
//           >
//             {username}
//           </Text>
//         </View>

//         <Section title="Account">
//           <Row
//             icon="document-text-outline"
//             text="Status Message"
//             subText={statusMessage || "No status message"}
//             rightIcon="create-outline"
//             onPress={() => setEditField("status")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="mail-outline"
//             text="Email"
//             subText={email || "No email"}
//             rightIcon="create-outline"
//             onPress={() => setEditField("email")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="calendar-outline"
//             text="Birthdate"
//             subText={birthdate || "Not set"}
//             rightIcon="calendar-outline"
//             onPress={() => {
//               if (!birthdateModalVisible && !pageLoading) {
//                 setBirthdateModalVisible(true);
//               }
//             }}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="flag-outline"
//             text="Country"
//             subText={country || "Not set"}
//             rightIcon="chevron-forward"
//             onPress={() => setCountryModalVisible(true)}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="location-outline"
//             text="City"
//             subText={city || "Not set"}
//             rightIcon="chevron-forward"
//             onPress={() => {
//               if (!countryCode) {
//                 Toast.show({
//                   type: "error",
//                   text1: "Choose country first",
//                   text2: "Please select your country before city",
//                 });

//                 setCountryModalVisible(true);
//                 return;
//               }

//               setCityModalVisible(true);
//             }}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="male-female-outline"
//             text="Gender"
//             subText={genderLabel(gender)}
//             rightIcon="create-outline"
//             onPress={() => setGenderModalVisible(true)}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="key-outline"
//             text="Change Password"
//             rightIcon="create-outline"
//             onPress={() => {
//               setCurrentPasswordValue("");
//               setNewPasswordValue("");
//               setEditField("currentPassword");
//             }}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />
//         </Section>

//         <Section title="Privacy">
//           <Row
//             icon="eye-outline"
//             text="Online Status"
//             switcher
//             value={!authUser?.isInvisible}
//             onChange={handleToggleOnline}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="lock-closed-outline"
//             text="Blocked users"
//             subText={`${(blockedUsers || []).length} blocked`}
//             rightIcon="chevron-forward"
//             onPress={openBlockedModal}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="chatbubble-ellipses-outline"
//             text="Messages from friends only"
//             subText={
//               friendsOnlyMessages
//                 ? "Friends only"
//                 : "Everyone can message you"
//             }
//             switcher
//             value={friendsOnlyMessages}
//             onChange={handleToggleFriendsOnlyMessages}
//             disabled={pageLoading}
//             isRTL={isRTL}
//             theme={theme}
//           />
//         </Section>

//         <Section title="Display">
//           <Row
//             icon="moon-outline"
//             text="Dark Mode"
//             switcher
//             value={darkModeEnabled}
//             onChange={handleToggleDarkMode}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />
//         </Section>

//         <Section title={t("settingsScreen.notifications")}>
//           <Row
//             icon="notifications-outline"
//             text={t("settingsScreen.notificationToggle")}
//             switcher
//             value={notifications}
//             onChange={setNotifications}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           {loadingSoundSetting ? (
//             <View style={styles.loadingRow}>
//               <ActivityIndicator size="small" color={theme.icon} />
//               <Text style={[styles.loadingText, { color: theme.text }]}>
//                 جارٍ تحميل الإعدادات...
//               </Text>
//             </View>
//           ) : (
//             <Row
//               icon="volume-high-outline"
//               text={t("settingsScreen.notificationSounds")}
//               switcher
//               value={sounds}
//               onChange={handleToggleSound}
//               isRTL={isRTL}
//               theme={theme}
//               disabled={pageLoading}
//             />
//           )}
//         </Section>

//         <Section title={t("settingsScreen.app")}>
//           <Row
//             icon="language-outline"
//             text={t("settingsScreen.language")}
//             rightIcon="chevron-forward"
//             onPress={() => router.push("/language-settings")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="information-circle-outline"
//             text={t("settingsScreen.aboutApp")}
//             rightIcon="chevron-forward"
//             onPress={() => router.push("/about-app")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="help-circle-outline"
//             text={t("settingsScreen.helpSupport")}
//             rightIcon="chevron-forward"
//             onPress={() => router.push("/help-support")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="document-text-outline"
//             text={t("settingsScreen.privacyPolicy")}
//             rightIcon="chevron-forward"
//             onPress={() => router.push("/privacy-policy")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           <Row
//             icon="document-outline"
//             text={t("settingsScreen.termsConditions")}
//             rightIcon="chevron-forward"
//             onPress={() => router.push("/terms-conditions")}
//             isRTL={isRTL}
//             theme={theme}
//             disabled={pageLoading}
//           />

//           {isAdmin &&
//             authUser?.username ===
//             "ا◙☬ځُــۥـ☼ـڈ◄أڵـــســمـــٱ۽►ـۉد☼ــۥــۓ☬◙ا" && (
//               <Row
//                 icon="shield-checkmark-outline"
//                 text="DASHBOARD"
//                 rightIcon="chevron-forward"
//                 onPress={() => router.push("/admin/block-control" as any)}
//                 isRTL={isRTL}
//                 theme={theme}
//                 disabled={pageLoading}
//               />
//             )}
//         </Section>

//         <View style={styles.logoutBox}>
//           <TouchableOpacity
//             disabled={pageLoading}
//             onPress={handleLogout}
//             style={[styles.logoutBtn, pageLoading && { opacity: 0.55 }]}
//           >
//             <Ionicons name="log-out-outline" size={22} color="#E53935" />
//             <Text style={styles.logoutText}>{t("settingsScreen.logout")}</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.version}>{t("settingsScreen.version")}</Text>
//       </ScrollView>

//       {!!editConfig && (
//         <SettingsTextModal
//           visible={!!editField}
//           title={editConfig.title}
//           value={editConfig.value}
//           placeholder={editConfig.placeholder}
//           multiline={editConfig.multiline}
//           secureTextEntry={editConfig.secureTextEntry}
//           keyboardType={editConfig.keyboardType}
//           loading={pageLoading}
//           onClose={() => {
//             if (!pageLoading) setEditField(null);
//           }}
//           onSave={saveTextField}
//         />
//       )}

//       <SettingsChoiceModal
//         visible={genderModalVisible}
//         title="Gender"
//         value={gender}
//         options={[
//           { label: "Male", value: "Male" },
//           { label: "Female", value: "Female" },
//         ]}
//         onClose={() => {
//           if (!pageLoading) setGenderModalVisible(false);
//         }}
//         onSelect={saveGender}
//       />

//       <BlockedUsersSettingsModal
//         visible={blockedVisible}
//         users={(blockedUsers || []) as any}
//         loading={blockedLoading}
//         refreshing={blockedRefreshing}
//         onClose={() => {
//           if (!pageLoading) setBlockedVisible(false);
//         }}
//         onRefresh={refreshBlockedUsers}
//         onUnblock={confirmUnblock}
//       />

//       <CountryCityPickerModal
//         visible={countryModalVisible}
//         mode="country"
//         title="Select Country"
//         onClose={() => {
//           if (!pageLoading) setCountryModalVisible(false);
//         }}
//         onSelectCountry={saveCountry}
//       />

//       <CountryCityPickerModal
//         visible={cityModalVisible}
//         mode="city"
//         title="Select City"
//         selectedCountryCode={countryCode}
//         onClose={() => {
//           if (!pageLoading) setCityModalVisible(false);
//         }}
//         onSelectCity={saveCity}
//       />

//       <BirthdatePickerModal
//         visible={birthdateModalVisible}
//         value={birthdate}
//         loading={pageLoading}
//         onClose={() => setBirthdateModalVisible(false)}
//         onSave={saveBirthdate}
//       />

//       <GlobalLoadingModal visible={pageLoading} text={loadingText} theme={theme} />
//     </View>
//   );
// }

// function GlobalLoadingModal({
//   visible,
//   text,
//   theme,
// }: {
//   visible: boolean;
//   text: string;
//   theme: any;
// }) {
//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.loadingOverlay}>
//         <View
//           style={[
//             styles.loadingCard,
//             {
//               backgroundColor: theme.card || theme.surface || theme.background,
//               borderColor: theme.border || "rgba(0,0,0,0.08)",
//             },
//           ]}
//         >
//           <ActivityIndicator size="large" color={theme.tint || theme.icon} />

//           <Text style={[styles.loadingModalText, { color: theme.text }]}>
//             {text || "Saving..."}
//           </Text>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function Section({ title, children }: any) {
//   const { colorScheme } = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

//   return (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <View style={[styles.sectionCard, { backgroundColor: theme.background }]}>
//         {children}
//       </View>
//     </View>
//   );
// }

// function Row({
//   icon,
//   text,
//   subText,
//   rightIcon,
//   switcher,
//   value,
//   onChange,
//   onPress,
//   disabled,
//   isRTL,
//   theme,
// }: any) {
//   return (
//     <TouchableOpacity
//       disabled={(!onPress && !switcher) || disabled}
//       onPress={onPress}
//       activeOpacity={0.75}
//       style={[
//         styles.row,
//         {
//           flexDirection: isRTL ? "row-reverse" : "row",
//           opacity: disabled ? 0.55 : 1,
//         },
//       ]}
//     >
//       <View
//         style={[
//           styles.rowLeft,
//           {
//             flexDirection: isRTL ? "row-reverse" : "row",
//           },
//         ]}
//       >
//         <Ionicons name={icon} size={22} color={theme.icon} />

//         <View style={{ flex: 1 }}>
//           <Text
//             numberOfLines={1}
//             style={[
//               styles.rowText,
//               {
//                 color: theme.text,
//                 textAlign: isRTL ? "right" : "left",
//               },
//             ]}
//           >
//             {text}
//           </Text>

//           {!!subText && (
//             <Text
//               numberOfLines={2}
//               style={[
//                 styles.rowSubText,
//                 {
//                   color: theme.mutedText,
//                   textAlign: isRTL ? "right" : "left",
//                   writingDirection: hasArabic(subText) ? "rtl" : "ltr",
//                 },
//               ]}
//             >
//               {subText}
//             </Text>
//           )}
//         </View>
//       </View>

//       {switcher ? (
//         <Switch value={value} onValueChange={onChange} disabled={disabled} />
//       ) : rightIcon ? (
//         <Ionicons
//           name={
//             isRTL && rightIcon === "chevron-forward"
//               ? "chevron-back"
//               : rightIcon
//           }
//           size={20}
//           color="#999"
//         />
//       ) : null}
//     </TouchableOpacity>
//   );
// }

// function hasArabic(value: string) {
//   return /[\u0600-\u06FF]/.test(String(value || ""));
// }

// function genderLabel(value: string) {
//   const v = String(value || "").toLowerCase();

//   if (v === "male" || v === "ذكر") return "Male";
//   if (v === "female" || v === "أنثى") return "Female";

//   return "Not set";
// }

// function formatBirthdate(value: any) {
//   if (!value) return "";

//   const raw = String(value);

//   if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw;

//   const d = new Date(raw);
//   if (Number.isNaN(d.getTime())) return raw;

//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();

//   return `${day}-${month}-${year}`;
// }

// function findCountryCodeByName(countryName: string) {
//   const name = String(countryName || "").trim().toLowerCase();

//   if (!name) return "";

//   const found = Country.getAllCountries().find((item) => {
//     return (
//       item.name.toLowerCase() === name || item.isoCode.toLowerCase() === name
//     );
//   });

//   return found?.isoCode || "";
// }
// function getUploadFileFromAsset(
//   asset: ImagePicker.ImagePickerAsset,
//   fallbackName: string
// ): LocalUploadFile {
//   const uri = String(asset?.uri || "");
//   const fileName = String((asset as any)?.fileName || fallbackName);
//   const mimeType = String((asset as any)?.mimeType || "");

//   let type = mimeType;

//   if (!type) {
//     const lower = fileName.toLowerCase();

//     if (lower.endsWith(".gif")) type = "image/gif";
//     else if (lower.endsWith(".png")) type = "image/png";
//     else if (lower.endsWith(".webp")) type = "image/webp";
//     else type = "image/jpeg";
//   }

//   return {
//     uri,
//     name: fileName,
//     type,
//   };
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//   },

//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },

//   pageTitle: {
//     fontSize: 22,
//     fontWeight: "600",
//     marginTop: 16,
//     marginBottom: 16,
//   },

//   profileBox: {
//     alignItems: "center",
//     marginBottom: 18,
//   },

//   coverBox: {
//     width: "100%",
//     height: 132,
//     borderRadius: 20,
//     overflow: "hidden",
//     marginBottom: -36,
//   },

//   coverImage: {
//     width: "100%",
//     height: "100%",
//   },

//   emptyCover: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   coverBtn: {
//     position: "absolute",
//     right: 10,
//     bottom: 10,
//     height: 30,
//     paddingHorizontal: 10,
//     borderRadius: 999,
//     backgroundColor: "rgba(0,0,0,0.50)",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },

//   coverBtnText: {
//     color: "#FFF",
//     fontSize: 11,
//     fontWeight: "800",
//   },

//   avatarWrap: {
//     width: 74,
//     height: 74,
//     borderRadius: 37,
//     borderWidth: 4,
//     backgroundColor: "#E5E7EB",
//   },

//   avatar: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 37,
//   },

//   emptyAvatar: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   avatarCamera: {
//     position: "absolute",
//     right: -2,
//     bottom: 0,
//     width: 25,
//     height: 25,
//     borderRadius: 13,
//     backgroundColor: "#111827",
//     borderWidth: 2,
//     borderColor: "#FFF",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   username: {
//     maxWidth: "85%",
//     marginTop: 8,
//     fontSize: 13,
//     fontWeight: "700",
//     textAlign: "center",
//   },

//   section: {
//     marginBottom: 18,
//   },

//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#6B7280",
//     marginBottom: 6,
//   },

//   sectionCard: {
//     borderRadius: 18,
//     overflow: "hidden",
//   },

//   row: {
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#EEE",
//   },

//   rowLeft: {
//     alignItems: "center",
//     gap: 12,
//     flex: 1,
//   },

//   rowText: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   rowSubText: {
//     marginTop: 4,
//     fontSize: 12,
//     lineHeight: 17,
//     fontWeight: "600",
//   },

//   loadingRow: {
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     padding: 16,
//   },

//   loadingText: {
//     fontSize: 14,
//   },

//   logoutBox: {
//     marginTop: 10,
//     alignItems: "center",
//   },

//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 14,
//   },

//   logoutText: {
//     color: "#E53935",
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   version: {
//     textAlign: "center",
//     marginTop: 20,
//     fontSize: 12,
//     color: "#9CA3AF",
//   },

//   loadingOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 22,
//   },

//   loadingCard: {
//     minWidth: 190,
//     borderRadius: 22,
//     borderWidth: 1,
//     paddingVertical: 22,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   loadingModalText: {
//     marginTop: 12,
//     fontSize: 14,
//     fontWeight: "800",
//     textAlign: "center",
//   },
// });
import BirthdatePickerModal from "@/components/settings/BirthdatePickerModal";
import BlockedUsersSettingsModal from "@/components/settings/BlockedUsersModal";
import CountryCityPickerModal, {
  CityPickerValue,
  CountryPickerValue,
} from "@/components/settings/CountryCityPickerModal";
import SettingsChoiceModal from "@/components/settings/SettingsChoiceModal";
import SettingsTextModal from "@/components/settings/SettingsTextModal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { useTranslation } from "@/hooks/useTranslation";
import {
  leaveAllActiveRooms,
  logout,
  toggleInvisible,
} from "@/redux/slices/authSlice";
import {
  changePassword,
  clearChangePasswordError,
  resetChangePasswordState,
} from "@/redux/slices/changePasswordSlice";
import { resetChatState } from "@/redux/slices/chatSlice";
import { getBlockedUsers, unblockUser } from "@/redux/slices/friendSlice";
import { updateProfile } from "@/redux/slices/profileSlice";
import { resetRoomState, setActiveRoom } from "@/redux/slices/room.slice";
import { setTabBarHidden } from "@/redux/slices/ui.slice";
import {
  changeMyEmail,
  fetchMyFullUser,
  resetUserState,
  selectMe,
  selectUserUpdating,
  updateMyProfileSettings,
} from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import {
  getNotificationSoundEnabled,
  setNotificationSoundEnabled,
} from "@/services/localSettings.service";
import { disconnectSocket } from "@/services/socket";
import { LocalUploadFile } from "@/services/upload/types";
import { uploadSingleFile } from "@/services/upload/uploadApi";
import { Ionicons } from "@expo/vector-icons";
import { Country } from "country-state-city";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

type EditField = "status" | "email" | "currentPassword" | "newPassword";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { onScroll, onScrollBeginDrag, showTabBar } = useHideTabBarOnScroll();
  const { t, isRTL } = useTranslation();

  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const me = useSelector(selectMe);
  const updatingUser = useSelector(selectUserUpdating);

  const { blockedUsers, loading: blockedLoading } = useSelector(
    (state: RootState) => state.friends
  );

  const {
    loading: passwordLoading,
    success: passwordSuccess,
    error: passwordError,
  } = useSelector((state: RootState) => state.changePassword);

  const currentUser = me || authUser || null;

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [loadingSoundSetting, setLoadingSoundSetting] = useState(true);

  const [friendsOnlyMessages, setFriendsOnlyMessages] = useState(false);

  const [savingMedia, setSavingMedia] = useState(false);
  const [savingAction, setSavingAction] = useState("");

  const [blockedVisible, setBlockedVisible] = useState(false);
  const [blockedRefreshing, setBlockedRefreshing] = useState(false);

  const [editField, setEditField] = useState<EditField | null>(null);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [birthdateModalVisible, setBirthdateModalVisible] = useState(false);

  const [currentPasswordValue, setCurrentPasswordValue] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const role = String(
    currentUser?.role || currentUser?.accountType || currentUser?.type || ""
  ).toLowerCase();

  const isAdmin = role === "admin";

  const avatar = String(
    currentUser?.activeCustomization?.avatarGif || currentUser?.avatar || ""
  );

  const cover = String(currentUser?.coverImage || currentUser?.cover || "");

  const username = String(currentUser?.username || "");
  const email = String(currentUser?.email || "");

  const statusMessage = String(
    currentUser?.statusMessage || currentUser?.status || currentUser?.bio || ""
  );

  const country = String(currentUser?.country || "");
  const city = String(currentUser?.city || "");

  const countryCode = String(
    currentUser?.countryCode || findCountryCodeByName(country) || ""
  );

  const gender = String(currentUser?.gender || "");

  const birthdate = formatBirthdate(
    currentUser?.birthdate || currentUser?.dateOfBirth
  );

  const darkModeEnabled = themePreference === "dark";

  const pageLoading =
    !!savingAction || savingMedia || updatingUser || passwordLoading;

  const loadingText =
    savingAction ||
    (savingMedia
      ? t("settingsScreen.loading.uploadingImage")
      : t("settingsScreen.loading.saving"));

  useEffect(() => {
    loadLocalSettings();
  }, []);

  useEffect(() => {
    if (!me) {
      dispatch(fetchMyFullUser());
    }
  }, [me, dispatch]);

  useEffect(() => {
    const allowMessages = me?.privacy?.allowMessages;
    setFriendsOnlyMessages(allowMessages === false);
  }, [me?.privacy?.allowMessages]);

  useEffect(() => {
    if (passwordError) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: String(passwordError),
      });

      dispatch(clearChangePasswordError());
      setSavingAction("");
    }
  }, [passwordError, dispatch, t]);

  useEffect(() => {
    if (passwordSuccess) {
      Toast.show({
        type: "success",
        text1: t("common.success"),
        text2: t("settingsScreen.toasts.passwordChanged"),
      });

      dispatch(resetChangePasswordState());
      setCurrentPasswordValue("");
      setNewPasswordValue("");
      setEditField(null);
      setSavingAction("");
    }
  }, [passwordSuccess, dispatch, t]);

  const editConfig = useMemo(() => {
    if (!editField) return null;

    const config: Record<
      EditField,
      {
        title: string;
        value: string;
        placeholder: string;
        multiline?: boolean;
        secureTextEntry?: boolean;
        keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
      }
    > = {
      status: {
        title: t("settingsScreen.edit.statusTitle"),
        value: statusMessage,
        placeholder: t("settingsScreen.edit.statusPlaceholder"),
        multiline: true,
      },

      email: {
        title: t("settingsScreen.edit.emailTitle"),
        value: email,
        placeholder: t("settingsScreen.edit.emailPlaceholder"),
        keyboardType: "email-address",
      },

      currentPassword: {
        title: t("settingsScreen.edit.currentPasswordTitle"),
        value: currentPasswordValue,
        placeholder: t("settingsScreen.edit.currentPasswordPlaceholder"),
        secureTextEntry: true,
      },

      newPassword: {
        title: t("settingsScreen.edit.newPasswordTitle"),
        value: newPasswordValue,
        placeholder: t("settingsScreen.edit.newPasswordPlaceholder"),
        secureTextEntry: true,
      },
    };

    return config[editField];
  }, [
    editField,
    statusMessage,
    email,
    currentPasswordValue,
    newPasswordValue,
    t,
  ]);

  async function runWithLoading(label: string, action: () => Promise<void>) {
    try {
      setSavingAction(label);
      await action();
    } finally {
      setSavingAction("");
    }
  }

  async function loadLocalSettings() {
    try {
      setLoadingSoundSetting(true);
      const savedSound = await getNotificationSoundEnabled();
      setSounds(savedSound);
    } finally {
      setLoadingSoundSetting(false);
    }
  }

  async function refreshMe() {
    try {
      const freshUser = await dispatch(fetchMyFullUser()).unwrap();
      return freshUser;
    } catch {
      return null;
    }
  }

  async function handleToggleFriendsOnlyMessages(value: boolean) {
    const oldValue = friendsOnlyMessages;
    setFriendsOnlyMessages(value);

    await runWithLoading(t("settingsScreen.loading.savingPrivacy"), async () => {
      try {
        await dispatch(
          updateMyProfileSettings({
            privacy: {
              allowMessages: !value,
            },
          } as any)
        ).unwrap();

        await refreshMe();
      } catch (error: any) {
        setFriendsOnlyMessages(oldValue);

        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: String(
            error?.message || error || t("settingsScreen.toasts.failedUpdateSetting")
          ),
        });
      }
    });
  }

  function handleToggleDarkMode(value: boolean) {
    setThemePreference(value ? "dark" : "light");
  }

  async function handleToggleOnline(value: boolean) {
    await runWithLoading(
      t("settingsScreen.loading.savingOnlineStatus"),
      async () => {
        dispatch(toggleInvisible(!value));
      }
    );
  }

  async function handleToggleSound(value: boolean) {
    await runWithLoading(t("settingsScreen.loading.savingSound"), async () => {
      setSounds(value);
      await setNotificationSoundEnabled(value);
    });
  }

  async function ensureMediaPermission() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t("settingsScreen.alerts.permissionRequired"),
        t("settingsScreen.alerts.allowPhotos")
      );
      return false;
    }

    return true;
  }

  function isGifAsset(asset: ImagePicker.ImagePickerAsset) {
    const uri = String(asset?.uri || "").toLowerCase();
    const fileName = String((asset as any)?.fileName || "").toLowerCase();
    const mimeType = String((asset as any)?.mimeType || "").toLowerCase();

    return (
      mimeType === "image/gif" ||
      fileName.endsWith(".gif") ||
      uri.includes(".gif")
    );
  }

  async function pickNormalImage(type: "avatar" | "cover", withCrop: boolean) {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: withCrop,
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

    if (!asset || !uri) return;

    if (isGifAsset(asset) && type === "avatar") {
      Alert.alert(
        t("settingsScreen.alerts.gif"),
        t("settingsScreen.alerts.chooseGifHint")
      );
      return;
    }

    await uploadAndSaveMedia(type, asset);
  }

  async function pickGifAvatar() {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    const uri = asset?.uri;

    if (!asset || !uri) return;

    if (!isGifAsset(asset)) {
      Alert.alert(
        t("settingsScreen.alerts.gifOnly"),
        t("settingsScreen.alerts.chooseGifOnly")
      );
      return;
    }

    await uploadAndSaveMedia("avatar", asset, true);
  }

  function openAvatarPicker() {
    if (pageLoading) return;

    Alert.alert(
      t("settingsScreen.media.changeAvatar"),
      t("settingsScreen.media.chooseImageType"),
      [
        {
          text: t("settingsScreen.media.chooseImage"),
          onPress: () => pickNormalImage("avatar", false),
        },
        {
          text: t("settingsScreen.media.chooseImageWithCrop"),
          onPress: () => pickNormalImage("avatar", true),
        },
        {
          text: t("settingsScreen.media.chooseGif"),
          onPress: pickGifAvatar,
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ]
    );
  }

  function openCoverPicker() {
    if (pageLoading) return;

    Alert.alert(
      t("settingsScreen.media.changeCover"),
      t("settingsScreen.media.chooseCover"),
      [
        {
          text: t("settingsScreen.media.chooseImage"),
          onPress: () => pickNormalImage("cover", false),
        },
        {
          text: t("settingsScreen.media.chooseImageWithCrop"),
          onPress: () => pickNormalImage("cover", true),
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ]
    );
  }

  async function uploadAndSaveMedia(
    type: "avatar" | "cover",
    asset: ImagePicker.ImagePickerAsset,
    isGif = false
  ) {
    try {
      setSavingMedia(true);
      setSavingAction(
        type === "avatar"
          ? t("settingsScreen.loading.updatingAvatar")
          : t("settingsScreen.loading.updatingCover")
      );

      const userId = String(currentUser?._id || currentUser?.id || "");

      const file = getUploadFileFromAsset(
        asset,
        isGif ? `avatar-${Date.now()}.gif` : `${type}-${Date.now()}.jpg`
      );

      const uploaded = await uploadSingleFile({
        file,
        folder: isGif ? "avatar-gifs" : type === "avatar" ? "avatars" : "covers",
        userId,
      });

      const payload: any = {};

      if (type === "cover") {
        payload.coverImage = uploaded.url;
        payload.cover = uploaded.url;
        payload.coverImagePublicId = uploaded.publicId;
      }

      if (type === "avatar" && isGif) {
        payload.avatarGif = uploaded.url;
        payload.avatarGifPublicId = uploaded.publicId;

        payload.activeCustomization = {
          ...(currentUser?.activeCustomization || {}),
          avatarGif: uploaded.url,
        };
      }

      if (type === "avatar" && !isGif) {
        payload.avatar = uploaded.url;
        payload.avatarPublicId = uploaded.publicId;

        payload.avatarGif = "";
        payload.avatarGifPublicId = "";

        payload.activeCustomization = {
          ...(currentUser?.activeCustomization || {}),
          avatarGif: "",
        };
      }

      await dispatch(updateProfile(payload)).unwrap();

      await refreshMe();

      Toast.show({
        type: "success",
        text1: t("common.success"),
        text2:
          type === "avatar"
            ? isGif
              ? t("settingsScreen.toasts.avatarGifUpdated")
              : t("settingsScreen.toasts.avatarUpdated")
            : t("settingsScreen.toasts.coverUpdated"),
      });
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        String(error?.message || error || t("settingsScreen.toasts.uploadFailed"))
      );
    } finally {
      setSavingMedia(false);
      setSavingAction("");
    }
  }

  async function saveTextField(value: string) {
    if (!editField) return;

    try {
      if (editField === "currentPassword") {
        if (!value.trim()) {
          Toast.show({
            type: "error",
            text1: t("common.error"),
            text2: t("settingsScreen.toasts.currentPasswordRequired"),
          });
          return;
        }

        setCurrentPasswordValue(value);
        setEditField("newPassword");
        return;
      }

      if (editField === "newPassword") {
        if (!currentPasswordValue.trim()) {
          Toast.show({
            type: "error",
            text1: t("common.error"),
            text2: t("settingsScreen.toasts.currentPasswordRequired"),
          });
          setEditField("currentPassword");
          return;
        }

        if (value.trim().length < 6) {
          Toast.show({
            type: "error",
            text1: t("common.error"),
            text2: t("settingsScreen.toasts.newPasswordMin"),
          });
          return;
        }

        setNewPasswordValue(value);
        setSavingAction(t("settingsScreen.loading.changingPassword"));

        dispatch(
          changePassword({
            currentPassword: currentPasswordValue,
            newPassword: value,
          })
        );

        return;
      }

      await runWithLoading(t("settingsScreen.loading.savingChanges"), async () => {
        if (editField === "email") {
          const cleanEmail = value.trim().toLowerCase();

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            Toast.show({
              type: "error",
              text1: t("common.error"),
              text2: t("settingsScreen.toasts.invalidEmail"),
            });
            return;
          }

          await dispatch(changeMyEmail({ email: cleanEmail })).unwrap();
          await refreshMe();
        }

        if (editField === "status") {
          await dispatch(
            updateProfile({
              bio: value,
              statusMessage: value,
              status: value,
            } as any)
          ).unwrap();

          await refreshMe();
        }

        setEditField(null);

        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("settingsScreen.toasts.updatedSuccessfully"),
        });
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: String(error?.message || error || t("settingsScreen.toasts.updateFailed")),
      });
    }
  }

  async function saveGender(value: string) {
    await runWithLoading(t("settingsScreen.loading.savingGender"), async () => {
      try {
        setGenderModalVisible(false);

        await dispatch(
          updateMyProfileSettings({
            gender: value,
          } as any)
        ).unwrap();

        await refreshMe();

        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("settingsScreen.toasts.genderUpdated"),
        });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: String(
            error?.message || error || t("settingsScreen.toasts.failedUpdateGender")
          ),
        });
      }
    });
  }

  async function saveCountry(selectedCountry: CountryPickerValue) {
    await runWithLoading(t("settingsScreen.loading.savingCountry"), async () => {
      try {
        setCountryModalVisible(false);

        await dispatch(
          updateMyProfileSettings({
            country: selectedCountry.name,
            countryCode: selectedCountry.isoCode,
            city: "",
          } as any)
        ).unwrap();

        await refreshMe();

        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("settingsScreen.toasts.countryUpdated"),
        });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: String(
            error?.message || error || t("settingsScreen.toasts.failedUpdateCountry")
          ),
        });
      }
    });
  }

  async function saveCity(selectedCity: CityPickerValue) {
    await runWithLoading(t("settingsScreen.loading.savingCity"), async () => {
      try {
        setCityModalVisible(false);

        await dispatch(
          updateMyProfileSettings({
            city: selectedCity.name,
          } as any)
        ).unwrap();

        await refreshMe();

        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("settingsScreen.toasts.cityUpdated"),
        });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: String(
            error?.message || error || t("settingsScreen.toasts.failedUpdateCity")
          ),
        });
      }
    });
  }

  const saveBirthdate = useCallback(
    async (date: Date) => {
      setBirthdateModalVisible(false);

      await runWithLoading(t("settingsScreen.loading.savingBirthdate"), async () => {
        try {
          await dispatch(
            updateMyProfileSettings({
              birthdate: date.toISOString(),
              dateOfBirth: date.toISOString(),
            } as any)
          ).unwrap();

          await refreshMe();

          Toast.show({
            type: "success",
            text1: t("common.success"),
            text2: t("settingsScreen.toasts.birthdateUpdated"),
          });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: t("common.error"),
            text2: String(
              error?.message ||
                error ||
                t("settingsScreen.toasts.failedUpdateBirthdate")
            ),
          });
        }
      });
    },
    [dispatch, t]
  );

  async function openBlockedModal() {
    setBlockedVisible(true);

    try {
      await dispatch(getBlockedUsers()).unwrap();
    } catch {}
  }

  async function refreshBlockedUsers() {
    try {
      setBlockedRefreshing(true);
      await dispatch(getBlockedUsers()).unwrap();
    } finally {
      setBlockedRefreshing(false);
    }
  }

  function confirmUnblock(userId: string) {
    Alert.alert(
      t("settingsScreen.alerts.unblockUser"),
      t("settingsScreen.alerts.unblockConfirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("settingsScreen.actions.unblock"),
          style: "destructive",
          onPress: async () => {
            await runWithLoading(
              t("settingsScreen.loading.removingBlock"),
              async () => {
                try {
                  await dispatch(unblockUser(userId) as any).unwrap();
                  await dispatch(getBlockedUsers()).unwrap();

                  Toast.show({
                    type: "success",
                    text1: t("common.success"),
                    text2: t("settingsScreen.toasts.userUnblocked"),
                  });
                } catch (error: any) {
                  Toast.show({
                    type: "error",
                    text1: t("common.error"),
                    text2: String(
                      error?.message ||
                        error ||
                        t("settingsScreen.toasts.failedToUnblock")
                    ),
                  });
                }
              }
            );
          },
        },
      ]
    );
  }

  async function handleLogout() {
    try {
      showTabBar();

      try {
        await dispatch(leaveAllActiveRooms()).unwrap();
      } catch {}

      dispatch(setActiveRoom(undefined));
      dispatch(resetRoomState());

      disconnectSocket();

      await dispatch(logout()).unwrap();

      dispatch(resetUserState());
      dispatch(resetChatState());
      dispatch(setTabBarHidden(false));

      router.replace("/login");
    } catch {
      dispatch(setActiveRoom(undefined));
      dispatch(resetRoomState());
      dispatch(resetUserState());
      dispatch(resetChatState());
      dispatch(setTabBarHidden(false));

      disconnectSocket();

      try {
        await dispatch(logout()).unwrap();
      } catch {}

      router.replace("/login");
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <Text style={[styles.pageTitle, { color: theme.text }]} />

        <View style={styles.profileBox}>
          <TouchableOpacity
            disabled={pageLoading}
            activeOpacity={0.9}
            onPress={openCoverPicker}
            style={[styles.coverBox, { backgroundColor: theme.surface2 }]}
          >
            {cover ? (
              <Image
                source={{ uri: cover }}
                style={styles.coverImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.emptyCover}>
                <Ionicons name="image-outline" size={28} color={theme.icon} />
              </View>
            )}

            <View style={styles.coverBtn}>
              <Ionicons name="camera" size={14} color="#FFF" />
              <Text style={styles.coverBtnText}>
                {t("settingsScreen.media.changeCoverButton")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={pageLoading}
            activeOpacity={0.9}
            onPress={openAvatarPicker}
            style={[styles.avatarWrap, { borderColor: theme.background }]}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.emptyAvatar]}>
                <Ionicons name="person-outline" size={30} color="#9CA3AF" />
              </View>
            )}

            <View style={styles.avatarCamera}>
              <Ionicons name="camera" size={13} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={[styles.username, { color: theme.text }]}
          >
            {username}
          </Text>
        </View>

        <Section title={t("settingsScreen.sections.account")}>
          <Row
            icon="document-text-outline"
            text={t("settingsScreen.rows.statusMessage")}
            subText={statusMessage || t("settingsScreen.empty.noStatus")}
            rightIcon="create-outline"
            onPress={() => setEditField("status")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="mail-outline"
            text={t("settingsScreen.rows.email")}
            subText={email || t("settingsScreen.empty.noEmail")}
            rightIcon="create-outline"
            onPress={() => setEditField("email")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="calendar-outline"
            text={t("settingsScreen.rows.birthdate")}
            subText={birthdate || t("settingsScreen.empty.notSet")}
            rightIcon="calendar-outline"
            onPress={() => {
              if (!birthdateModalVisible && !pageLoading) {
                setBirthdateModalVisible(true);
              }
            }}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="flag-outline"
            text={t("settingsScreen.rows.country")}
            subText={country || t("settingsScreen.empty.notSet")}
            rightIcon="chevron-forward"
            onPress={() => setCountryModalVisible(true)}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="location-outline"
            text={t("settingsScreen.rows.city")}
            subText={city || t("settingsScreen.empty.notSet")}
            rightIcon="chevron-forward"
            onPress={() => {
              if (!countryCode) {
                Toast.show({
                  type: "error",
                  text1: t("settingsScreen.toasts.chooseCountryFirst"),
                  text2: t("settingsScreen.toasts.selectCountryBeforeCity"),
                });

                setCountryModalVisible(true);
                return;
              }

              setCityModalVisible(true);
            }}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="male-female-outline"
            text={t("settingsScreen.rows.gender")}
            subText={genderLabel(gender, t)}
            rightIcon="create-outline"
            onPress={() => setGenderModalVisible(true)}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="key-outline"
            text={t("settingsScreen.rows.changePassword")}
            rightIcon="create-outline"
            onPress={() => {
              setCurrentPasswordValue("");
              setNewPasswordValue("");
              setEditField("currentPassword");
            }}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />
        </Section>

        <Section title={t("settingsScreen.sections.privacy")}>
          <Row
            icon="eye-outline"
            text={t("settingsScreen.rows.onlineStatus")}
            switcher
            value={!authUser?.isInvisible}
            onChange={handleToggleOnline}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="lock-closed-outline"
            text={t("settingsScreen.rows.blockedUsers")}
            subText={t("settingsScreen.empty.blockedCount", {
              count: (blockedUsers || []).length,
            })}
            rightIcon="chevron-forward"
            onPress={openBlockedModal}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="chatbubble-ellipses-outline"
            text={t("settingsScreen.rows.messagesFriendsOnly")}
            subText={
              friendsOnlyMessages
                ? t("settingsScreen.empty.friendsOnly")
                : t("settingsScreen.empty.everyoneCanMessage")
            }
            switcher
            value={friendsOnlyMessages}
            onChange={handleToggleFriendsOnlyMessages}
            disabled={pageLoading}
            isRTL={isRTL}
            theme={theme}
          />
        </Section>

        <Section title={t("settingsScreen.sections.display")}>
          <Row
            icon="moon-outline"
            text={t("settingsScreen.rows.darkMode")}
            switcher
            value={darkModeEnabled}
            onChange={handleToggleDarkMode}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />
        </Section>

        <Section title={t("settingsScreen.notifications")}>
          <Row
            icon="notifications-outline"
            text={t("settingsScreen.notificationToggle")}
            switcher
            value={notifications}
            onChange={setNotifications}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          {loadingSoundSetting ? (
            <View
              style={[
                styles.loadingRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <ActivityIndicator size="small" color={theme.icon} />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                {t("settingsScreen.loading.loadingSettings")}
              </Text>
            </View>
          ) : (
            <Row
              icon="volume-high-outline"
              text={t("settingsScreen.notificationSounds")}
              switcher
              value={sounds}
              onChange={handleToggleSound}
              isRTL={isRTL}
              theme={theme}
              disabled={pageLoading}
            />
          )}
        </Section>

        <Section title={t("settingsScreen.app")}>
          <Row
            icon="language-outline"
            text={t("settingsScreen.language")}
            rightIcon="chevron-forward"
            onPress={() => router.push("/language-settings")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="information-circle-outline"
            text={t("settingsScreen.aboutApp")}
            rightIcon="chevron-forward"
            onPress={() => router.push("/about-app")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="help-circle-outline"
            text={t("settingsScreen.helpSupport")}
            rightIcon="chevron-forward"
            onPress={() => router.push("/help-support")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="document-text-outline"
            text={t("settingsScreen.privacyPolicy")}
            rightIcon="chevron-forward"
            onPress={() => router.push("/privacy-policy")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          <Row
            icon="document-outline"
            text={t("settingsScreen.termsConditions")}
            rightIcon="chevron-forward"
            onPress={() => router.push("/terms-conditions")}
            isRTL={isRTL}
            theme={theme}
            disabled={pageLoading}
          />

          {isAdmin &&
            authUser?.username ===
              "ا◙☬ځُــۥـ☼ـڈ◄أڵـــســمـــٱ۽►ـۉد☼ــۥــۓ☬◙ا" && (
              <Row
                icon="shield-checkmark-outline"
                text={t("settingsScreen.dashboard")}
                rightIcon="chevron-forward"
                onPress={() => router.push("/admin/block-control" as any)}
                isRTL={isRTL}
                theme={theme}
                disabled={pageLoading}
              />
            )}
        </Section>

        <View style={styles.logoutBox}>
          <TouchableOpacity
            disabled={pageLoading}
            onPress={handleLogout}
            style={[
              styles.logoutBtn,
              {
                flexDirection: isRTL ? "row-reverse" : "row",
              },
              pageLoading && { opacity: 0.55 },
            ]}
          >
            <Ionicons name="log-out-outline" size={22} color="#E53935" />
            <Text style={styles.logoutText}>{t("settingsScreen.logout")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>{t("settingsScreen.version")}</Text>
      </ScrollView>

      {!!editConfig && (
        <SettingsTextModal
          visible={!!editField}
          title={editConfig.title}
          value={editConfig.value}
          placeholder={editConfig.placeholder}
          multiline={editConfig.multiline}
          secureTextEntry={editConfig.secureTextEntry}
          keyboardType={editConfig.keyboardType}
          loading={pageLoading}
          onClose={() => {
            if (!pageLoading) setEditField(null);
          }}
          onSave={saveTextField}
        />
      )}

      <SettingsChoiceModal
        visible={genderModalVisible}
        title={t("settingsScreen.rows.gender")}
        value={gender}
        options={[
          { label: t("settingsScreen.gender.male"), value: "Male" },
          { label: t("settingsScreen.gender.female"), value: "Female" },
        ]}
        onClose={() => {
          if (!pageLoading) setGenderModalVisible(false);
        }}
        onSelect={saveGender}
      />

      <BlockedUsersSettingsModal
        visible={blockedVisible}
        users={(blockedUsers || []) as any}
        loading={blockedLoading}
        refreshing={blockedRefreshing}
        onClose={() => {
          if (!pageLoading) setBlockedVisible(false);
        }}
        onRefresh={refreshBlockedUsers}
        onUnblock={confirmUnblock}
      />

      <CountryCityPickerModal
        visible={countryModalVisible}
        mode="country"
        title={t("settingsScreen.pickers.selectCountry")}
        onClose={() => {
          if (!pageLoading) setCountryModalVisible(false);
        }}
        onSelectCountry={saveCountry}
      />

      <CountryCityPickerModal
        visible={cityModalVisible}
        mode="city"
        title={t("settingsScreen.pickers.selectCity")}
        selectedCountryCode={countryCode}
        onClose={() => {
          if (!pageLoading) setCityModalVisible(false);
        }}
        onSelectCity={saveCity}
      />

      <BirthdatePickerModal
        visible={birthdateModalVisible}
        value={birthdate}
        loading={pageLoading}
        onClose={() => setBirthdateModalVisible(false)}
        onSave={saveBirthdate}
      />

      <GlobalLoadingModal visible={pageLoading} text={loadingText} theme={theme} />
    </View>
  );
}

function GlobalLoadingModal({
  visible,
  text,
  theme,
}: {
  visible: boolean;
  text: string;
  theme: any;
}) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.loadingOverlay}>
        <View
          style={[
            styles.loadingCard,
            {
              backgroundColor: theme.card || theme.surface || theme.background,
              borderColor: theme.border || "rgba(0,0,0,0.08)",
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.tint || theme.icon} />

          <Text style={[styles.loadingModalText, { color: theme.text }]}>
            {text || t("settingsScreen.loading.saving")}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: any) {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { isRTL } = useTranslation();

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            textAlign: isRTL ? "right" : "left",
            writingDirection: isRTL ? "rtl" : "ltr",
          },
        ]}
      >
        {title}
      </Text>

      <View style={[styles.sectionCard, { backgroundColor: theme.background }]}>
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  text,
  subText,
  rightIcon,
  switcher,
  value,
  onChange,
  onPress,
  disabled,
  isRTL,
  theme,
}: any) {
  return (
    <TouchableOpacity
      disabled={(!onPress && !switcher) || disabled}
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.row,
        {
          flexDirection: isRTL ? "row-reverse" : "row",
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.rowLeft,
          {
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={theme.icon} />

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={[
              styles.rowText,
              {
                color: theme.text,
                textAlign: isRTL ? "right" : "left",
                writingDirection: isRTL ? "rtl" : "ltr",
              },
            ]}
          >
            {text}
          </Text>

          {!!subText && (
            <Text
              numberOfLines={2}
              style={[
                styles.rowSubText,
                {
                  color: theme.mutedText,
                  textAlign: isRTL ? "right" : "left",
                  writingDirection: hasArabic(subText) ? "rtl" : "ltr",
                },
              ]}
            >
              {subText}
            </Text>
          )}
        </View>
      </View>

      {switcher ? (
        <Switch value={value} onValueChange={onChange} disabled={disabled} />
      ) : rightIcon ? (
        <Ionicons
          name={
            isRTL && rightIcon === "chevron-forward"
              ? "chevron-back"
              : rightIcon
          }
          size={20}
          color="#999"
        />
      ) : null}
    </TouchableOpacity>
  );
}

function hasArabic(value: string) {
  return /[\u0600-\u06FF]/.test(String(value || ""));
}

function genderLabel(value: string, t: any) {
  const v = String(value || "").toLowerCase();

  if (v === "male" || v === "ذكر") return t("settingsScreen.gender.male");
  if (v === "female" || v === "أنثى") return t("settingsScreen.gender.female");

  return t("settingsScreen.empty.notSet");
}

function formatBirthdate(value: any) {
  if (!value) return "";

  const raw = String(value);

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) return raw;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

function findCountryCodeByName(countryName: string) {
  const name = String(countryName || "").trim().toLowerCase();

  if (!name) return "";

  const found = Country.getAllCountries().find((item) => {
    return (
      item.name.toLowerCase() === name || item.isoCode.toLowerCase() === name
    );
  });

  return found?.isoCode || "";
}

function getUploadFileFromAsset(
  asset: ImagePicker.ImagePickerAsset,
  fallbackName: string
): LocalUploadFile {
  const uri = String(asset?.uri || "");
  const fileName = String((asset as any)?.fileName || fallbackName);
  const mimeType = String((asset as any)?.mimeType || "");

  let type = mimeType;

  if (!type) {
    const lower = fileName.toLowerCase();

    if (lower.endsWith(".gif")) type = "image/gif";
    else if (lower.endsWith(".png")) type = "image/png";
    else if (lower.endsWith(".webp")) type = "image/webp";
    else type = "image/jpeg";
  }

  return {
    uri,
    name: fileName,
    type,
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 16,
  },

  profileBox: {
    alignItems: "center",
    marginBottom: 18,
  },

  coverBox: {
    width: "100%",
    height: 132,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: -36,
  },

  coverImage: {
    width: "100%",
    height: "100%",
  },

  emptyCover: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  coverBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.50)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  coverBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },

  avatarWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    backgroundColor: "#E5E7EB",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 37,
  },

  emptyAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarCamera: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  username: {
    maxWidth: "85%",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
  },

  sectionCard: {
    borderRadius: 18,
    overflow: "hidden",
  },

  row: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  rowLeft: {
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  rowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  rowSubText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  loadingRow: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
  },

  loadingText: {
    fontSize: 14,
  },

  logoutBox: {
    marginTop: 10,
    alignItems: "center",
  },

  logoutBtn: {
    alignItems: "center",
    gap: 8,
    padding: 14,
  },

  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "700",
  },

  version: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#9CA3AF",
  },

  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  loadingCard: {
    minWidth: 190,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingModalText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});