// import { updateProfile } from '@/redux/slices/profileSlice';
// import { AppDispatch, RootState } from '@/redux/store';
// import { uploadToCloudinary } from '@/services/upload.service';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown';
// import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';

// const COUNTRIES = [
//   { label: 'مصر', value: 'مصر' },
//   { label: 'السعودية', value: 'السعودية' },
//   { label: 'الإمارات', value: 'الإمارات' },
//   { label: 'الولايات المتحدة', value: 'الولايات المتحدة' },
//   { label: 'المغرب', value: 'المغرب' },
// ];

// export default function EditProfileScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { user } = useSelector((state: RootState) => state.auth);
//   const { loading } = useSelector((state: RootState) => state.profile);

//   const richText = useRef<RichEditor | null>(null);

//   const [userId, setUserId] = useState('');
//   const [bio, setBio] = useState('');
//   const [tempBio, setTempBio] = useState('');
//   const [country, setCountry] = useState('');

//   const [avatar, setAvatar] = useState<string | null>(null);
//   const [cover, setCover] = useState<string | null>(null);

//   const [oldPass, setOldPass] = useState('');
//   const [newPass, setNewPass] = useState('');

//   const [bioModalVisible, setBioModalVisible] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setUserId(user.atUsername || '');
//       setBio(user.bio || '');
//       setTempBio(user.bio || '');
//       setCountry(user.country || '');
//       setAvatar(user.avatar || null);
//       setCover(user.coverImage || null);
//     }
//   }, [user]);

//   const pickImage = async (type: 'avatar' | 'cover') => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) return;

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: type === 'avatar' ? [1, 1] : [16, 9],
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       const uri = result.assets[0].uri;
//       type === 'avatar' ? setAvatar(uri) : setCover(uri);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       let avatarUrl = avatar;
//       let coverUrl = cover;

//       if (avatar && avatar.startsWith('file')) {
//         avatarUrl = await uploadToCloudinary(avatar, 'image');
//       }

//       if (cover && cover.startsWith('file')) {
//         coverUrl = await uploadToCloudinary(cover, 'image');
//       }

//       await dispatch(
//         updateProfile({
//           atUsername: userId,
//           bio,
//           country,
//           avatar: avatarUrl || undefined,
//           coverImage: coverUrl || undefined,
//           oldPassword: oldPass || undefined,
//           newPassword: newPass || undefined,
//         })
//       ).unwrap();

//       alert('تم التحديث بنجاح');
//     } catch (e: any) {
//       alert(e?.message || 'حدث خطأ');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Loading Modal */}
//       <Modal visible={loading} transparent animationType="fade">
//         <View style={styles.overlay}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>جاري حفظ التعديلات...</Text>
//         </View>
//       </Modal>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Cover */}
//         <View style={styles.coverContainer}>
//           {cover ? (
//             <Image source={{ uri: cover }} style={styles.coverImage} />
//           ) : (
//             <View style={styles.coverPlaceholder} />
//           )}

//           <TouchableOpacity
//             style={styles.coverEditBtn}
//             onPress={() => pickImage('cover')}
//           >
//             <Ionicons name="camera" size={18} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         {/* Avatar */}
//         <View style={styles.avatarSection}>
//           <View style={styles.avatarWrapper}>
//             {avatar ? (
//               <Image source={{ uri: avatar }} style={styles.avatar} />
//             ) : (
//               <Ionicons name="person" size={55} color="#9CA3AF" />
//             )}

//             <TouchableOpacity
//               style={styles.avatarEditBtn}
//               onPress={() => pickImage('avatar')}
//             >
//               <Ionicons name="camera" size={14} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* FORM */}
//         <View style={styles.formSection}>
//           <FormInput
//             label="المعرف"
//             value={userId}
//             onChangeText={setUserId}
//           />

//           <Text style={styles.label}>الدولة</Text>
//           <Dropdown
//             style={styles.dropdown}
//             data={COUNTRIES}
//             search
//             labelField="label"
//             valueField="value"
//             placeholder="اختر الدولة"
//             searchPlaceholder="ابحث..."
//             value={country}
//             onChange={(item) => setCountry(item.value)}
//           />

//           {/* Bio Preview */}
//           <TouchableOpacity
//             style={styles.bioPreviewBox}
//             onPress={() => setBioModalVisible(true)}
//           >
//             <Text style={styles.label}>نبذة تعريفية</Text>
//             <Text numberOfLines={3} style={styles.bioPreviewText}>
//               {bio
//                 ? bio.replace(/<[^>]+>/g, '')
//                 : 'اضغط لإضافة نبذة تعريفية'}
//             </Text>
//           </TouchableOpacity>
//         </View>

   
//         <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//           <Text style={styles.saveText}>حفظ التغييرات</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* BIO MODAL */}
//       <Modal visible={bioModalVisible} animationType="slide">
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
//           <View style={styles.modalHeader}>
//             <TouchableOpacity onPress={() => setBioModalVisible(false)}>
//               <Text style={styles.cancelText}>إلغاء</Text>
//             </TouchableOpacity>

//             <Text style={styles.modalTitle}>تعديل النبذة</Text>

//             <TouchableOpacity
//               onPress={() => {
//                 setBio(tempBio);
//                 setBioModalVisible(false);
//               }}
//             >
//               <Text style={styles.saveModalText}>حفظ</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             <RichEditor
//               ref={richText}
//               initialContentHTML={tempBio}
//               style={styles.richEditor}
//               onChange={setTempBio}
//             />

//             <RichToolbar
//               editor={richText}
//               style={styles.richToolbar}
//               actions={[
//                 'bold',
//                 'italic',
//                 'underline',
//                 'insertBulletsList',
//                 'insertOrderedList',
//                 'insertLink',
//               ]}
//             />
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// function FormInput({ label, ...props }: any) {
//   return (
//     <View style={styles.inputBlock}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput style={styles.input} {...props} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.65)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   loadingText: { color: '#fff', marginTop: 12, fontSize: 15 },

//   coverContainer: { height: 220, backgroundColor: '#E5E7EB' },

//   coverImage: { width: '100%', height: '100%' },

//   coverPlaceholder: { flex: 1, backgroundColor: '#E5E7EB' },

//   coverEditBtn: {
//     position: 'absolute',
//     bottom: 16,
//     right: 16,
//     backgroundColor: '#00000088',
//     padding: 10,
//     borderRadius: 30,
//   },

//   avatarSection: {
//     alignItems: 'center',
//     marginTop: -60,
//     marginBottom: 30,
//   },

//   avatarWrapper: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 4,
//     borderColor: '#fff',
//   },

//   avatar: { width: 112, height: 112, borderRadius: 56 },

//   avatarEditBtn: {
//     position: 'absolute',
//     bottom: 5,
//     right: 5,
//     backgroundColor: '#6D5DF6',
//     padding: 6,
//     borderRadius: 20,
//   },

//   formSection: { paddingHorizontal: 20, marginBottom: 30 },

//   sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 20 },

//   inputBlock: { marginBottom: 18 },

//   label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },

//   input: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     padding: 14,
//     fontSize: 15,
//   },

//   dropdown: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 12,
//     paddingVertical: 14,
//   },

//   bioPreviewBox: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     padding: 14,
//     marginTop: 24,
//   },

//   bioPreviewText: { fontSize: 14, color: '#374151' },

//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderColor: '#E5E7EB',
//   },

//   modalTitle: { fontSize: 16, fontWeight: '700' },

//   cancelText: { color: '#6B7280', fontSize: 14 },

//   saveModalText: {
//     color: '#6D5DF6',
//     fontWeight: '700',
//     fontSize: 14,
//   },

//   richEditor: {
//     minHeight: 150,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     padding: 10,
//   },

//   richToolbar: { marginTop: 8, borderRadius: 10 },

//   saveButton: {
//     marginHorizontal: 20,
//     marginBottom: 40,
//     backgroundColor: '#6D5DF6',
//     padding: 16,
//     borderRadius: 18,
//     alignItems: 'center',
//   },

//   saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
// });


// app/(tabs)/profile/edit.tsx (مثال)
// ✅ دعم Dark/Light عبر Colors من constants/theme
// ✅ SafeAreaView + StatusBar مناسب
// ✅ Loading Overlay أنيق
// ✅ تصميم عصري للكفر/الأفاتار/النموذج + مودال تعديل Bio
// ✅ تحسينات UX: تعطيل الحفظ أثناء التحميل، إشعارات، Borders/Surfaces من الثيم
import { Colors } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import { updateProfile } from "@/redux/slices/profileSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { uploadToCloudinary } from "@/services/upload.service";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function EditProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.profile);

  const { t } = useTranslation();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const richText = useRef<RichEditor | null>(null);

  const COUNTRIES = useMemo(
    () => [
      { label: t("editProfile.countries.egypt"), value: t("editProfile.countries.egypt") },
      { label: t("editProfile.countries.saudiArabia"), value: t("editProfile.countries.saudiArabia") },
      { label: t("editProfile.countries.uae"), value: t("editProfile.countries.uae") },
      { label: t("editProfile.countries.unitedStates"), value: t("editProfile.countries.unitedStates") },
      { label: t("editProfile.countries.morocco"), value: t("editProfile.countries.morocco") },
    ],
    [t]
  );

  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [country, setCountry] = useState("");

  const [avatar, setAvatar] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [bioModalVisible, setBioModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUserId(user.atUsername || "");
    setBio(user.bio || "");
    setTempBio(user.bio || "");
    setCountry(user.country || "");
    setAvatar(user.avatar || null);
    setCover(user.coverImage || null);
  }, [user]);

  const canSave = useMemo(() => {
    return !loading;
  }, [loading]);

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

  const pickImage = async (type: "avatar" | "cover") => {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "avatar" ? [1, 1] : [16, 9],
      quality: 0.85,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;
      type === "avatar" ? setAvatar(uri) : setCover(uri);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      let avatarUrl = avatar;
      let coverUrl = cover;

      if (avatar && avatar.startsWith("file")) {
        avatarUrl = await uploadToCloudinary(avatar, "image");
      }
      if (cover && cover.startsWith("file")) {
        coverUrl = await uploadToCloudinary(cover, "image");
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

      Alert.alert(
        t("editProfile.alerts.successTitle"),
        t("editProfile.alerts.successMessage")
      );
    } catch (e: any) {
      Alert.alert(
        t("editProfile.alerts.errorTitle"),
        String(e?.message || e || t("editProfile.alerts.errorFallback"))
      );
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

      <Modal visible={!!loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <ActivityIndicator />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              {t("editProfile.loading.title")}
            </Text>
            <Text
              style={[
                styles.loadingSubText,
                { color: theme.mutedText as any },
              ]}
            >
              {t("editProfile.loading.subtitle")}
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
            <Image source={{ uri: cover }} style={styles.coverImage} />
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
            <Ionicons
              name="camera-outline"
              size={18}
              color={theme.icon}
            />
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
                  <Image source={{ uri: avatar }} style={styles.avatar} />
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
          <FormInput
            label={t("editProfile.fields.username")}
            value={userId}
            onChangeText={setUserId}
            theme={theme}
            placeholder={t("editProfile.placeholders.username")}
          />

          <Text style={[styles.label, { color: theme.mutedText as any }]}>
            {t("editProfile.fields.country")}
          </Text>

          <View
            style={[
              styles.dropdownWrap,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
          >
            <Dropdown
              style={styles.dropdown}
              data={COUNTRIES}
              search
              labelField="label"
              valueField="value"
              placeholder={t("editProfile.placeholders.country")}
              searchPlaceholder={t("editProfile.placeholders.search")}
              value={country}
              onChange={(item: any) => setCountry(item.value)}
              containerStyle={[
                styles.dropdownContainer,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              itemTextStyle={{ color: theme.text }}
              selectedTextStyle={{ color: theme.text, fontWeight: "800" }}
              placeholderStyle={{
                color: theme.mutedText as any,
                fontWeight: "700",
              }}
              inputSearchStyle={{
                color: theme.text,
                backgroundColor: theme.surface2,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              activeColor={theme.surface2 as any}
              renderRightIcon={() => (
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={theme.icon}
                />
              )}
            />
          </View>

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

              <Ionicons
                name="create-outline"
                size={18}
                color={theme.icon}
              />
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
            <Ionicons
              name="save-outline"
              size={18}
              color={theme.primaryText}
            />
            <Text style={[styles.saveText, { color: theme.primaryText }]}>
              {t("editProfile.actions.saveChanges")}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.footerHint,
              { color: theme.subtleText as any },
            ]}
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
                style={[
                  styles.saveModalText,
                  { color: theme.primary },
                ]}
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
                style={[
                  styles.richToolbar,
                  { backgroundColor: theme.card },
                ]}
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
              style={[
                styles.modalHint,
                { color: theme.subtleText as any },
              ]}
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
  safeArea: { flex: 1 },

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
  loadingText: { marginTop: 10, fontSize: 15, fontWeight: "900" },
  loadingSubText: { marginTop: 4, fontSize: 12, fontWeight: "700" },

  coverContainer: {
    height: 220,
    position: "relative",
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: { flex: 1 },
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
      android: { elevation: 8 },
    }),
  },
  coverEditText: { fontSize: 13, fontWeight: "900" },

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
      android: { elevation: 3 },
    }),
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },

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
  avatar: { width: "100%", height: "100%" },

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

  headerTitle: { fontSize: 16, fontWeight: "900" },
  headerSub: { marginTop: 4, fontSize: 12, fontWeight: "700" },

  formSection: { paddingHorizontal: 16, marginTop: 6 },
  sectionMiniTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "900",
  },

  label: { fontSize: 12, fontWeight: "800", marginBottom: 6 },

  inputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: "center",
  },
  input: { fontSize: 14, fontWeight: "700", paddingVertical: 0 },

  dropdownWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 52,
    justifyContent: "center",
    marginBottom: 14,
  },
  dropdown: { width: "100%" },
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
  bioTitle: { fontSize: 13, fontWeight: "900" },
  bioPreviewText: { fontSize: 13, fontWeight: "700", lineHeight: 18 },

  saveButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  saveText: { fontWeight: "900", fontSize: 15 },
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
  modalTitle: { fontSize: 15, fontWeight: "900" },
  cancelText: { fontSize: 14, fontWeight: "800" },
  saveModalText: { fontSize: 14, fontWeight: "900" },

  richWrap: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  richEditor: { minHeight: 220 },
  toolbarWrap: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  richToolbar: { borderRadius: 16 },

  modalHint: { marginTop: 10, fontSize: 11, fontWeight: "700" },
});