import { updateProfile } from '@/redux/slices/profileSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { uploadToCloudinary } from '@/services/upload.service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const COUNTRIES = [
  { label: 'مصر', value: 'مصر' },
  { label: 'السعودية', value: 'السعودية' },
  { label: 'الإمارات', value: 'الإمارات' },
  { label: 'الولايات المتحدة', value: 'الولايات المتحدة' },
  { label: 'المغرب', value: 'المغرب' },
];

export default function EditProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.profile);

  const richText = useRef<RichEditor | null>(null);

  const [userId, setUserId] = useState('');
  const [bio, setBio] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [country, setCountry] = useState('');

  const [avatar, setAvatar] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const [bioModalVisible, setBioModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setUserId(user.atUsername || '');
      setBio(user.bio || '');
      setTempBio(user.bio || '');
      setCountry(user.country || '');
      setAvatar(user.avatar || null);
      setCover(user.coverImage || null);
    }
  }, [user]);

  const pickImage = async (type: 'avatar' | 'cover') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      type === 'avatar' ? setAvatar(uri) : setCover(uri);
    }
  };

  const handleSave = async () => {
    try {
      let avatarUrl = avatar;
      let coverUrl = cover;

      if (avatar && avatar.startsWith('file')) {
        avatarUrl = await uploadToCloudinary(avatar, 'image');
      }

      if (cover && cover.startsWith('file')) {
        coverUrl = await uploadToCloudinary(cover, 'image');
      }

      await dispatch(
        updateProfile({
          atUsername: userId,
          bio,
          country,
          avatar: avatarUrl || undefined,
          coverImage: coverUrl || undefined,
          oldPassword: oldPass || undefined,
          newPassword: newPass || undefined,
        })
      ).unwrap();

      alert('تم التحديث بنجاح');
    } catch (e: any) {
      alert(e?.message || 'حدث خطأ');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Loading Modal */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>جاري حفظ التعديلات...</Text>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}

          <TouchableOpacity
            style={styles.coverEditBtn}
            onPress={() => pickImage('cover')}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={55} color="#9CA3AF" />
            )}

            <TouchableOpacity
              style={styles.avatarEditBtn}
              onPress={() => pickImage('avatar')}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.formSection}>
          <FormInput
            label="المعرف"
            value={userId}
            onChangeText={setUserId}
          />

          <Text style={styles.label}>الدولة</Text>
          <Dropdown
            style={styles.dropdown}
            data={COUNTRIES}
            search
            labelField="label"
            valueField="value"
            placeholder="اختر الدولة"
            searchPlaceholder="ابحث..."
            value={country}
            onChange={(item) => setCountry(item.value)}
          />

          {/* Bio Preview */}
          <TouchableOpacity
            style={styles.bioPreviewBox}
            onPress={() => setBioModalVisible(true)}
          >
            <Text style={styles.label}>نبذة تعريفية</Text>
            <Text numberOfLines={3} style={styles.bioPreviewText}>
              {bio
                ? bio.replace(/<[^>]+>/g, '')
                : 'اضغط لإضافة نبذة تعريفية'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PASSWORD */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>تغيير كلمة المرور</Text>

          <FormInput
            label="كلمة المرور الحالية"
            secureTextEntry
            value={oldPass}
            onChangeText={setOldPass}
          />

          <FormInput
            label="كلمة المرور الجديدة"
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>حفظ التغييرات</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BIO MODAL */}
      <Modal visible={bioModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setBioModalVisible(false)}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>تعديل النبذة</Text>

            <TouchableOpacity
              onPress={() => {
                setBio(tempBio);
                setBioModalVisible(false);
              }}
            >
              <Text style={styles.saveModalText}>حفظ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <RichEditor
              ref={richText}
              initialContentHTML={tempBio}
              style={styles.richEditor}
              onChange={setTempBio}
            />

            <RichToolbar
              editor={richText}
              style={styles.richToolbar}
              actions={[
                'bold',
                'italic',
                'underline',
                'insertBulletsList',
                'insertOrderedList',
                'insertLink',
              ]}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function FormInput({ label, ...props }: any) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: { color: '#fff', marginTop: 12, fontSize: 15 },

  coverContainer: { height: 220, backgroundColor: '#E5E7EB' },

  coverImage: { width: '100%', height: '100%' },

  coverPlaceholder: { flex: 1, backgroundColor: '#E5E7EB' },

  coverEditBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#00000088',
    padding: 10,
    borderRadius: 30,
  },

  avatarSection: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 30,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },

  avatar: { width: 112, height: 112, borderRadius: 56 },

  avatarEditBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6D5DF6',
    padding: 6,
    borderRadius: 20,
  },

  formSection: { paddingHorizontal: 20, marginBottom: 30 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 20 },

  inputBlock: { marginBottom: 18 },

  label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  bioPreviewBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
  },

  bioPreviewText: { fontSize: 14, color: '#374151' },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  modalTitle: { fontSize: 16, fontWeight: '700' },

  cancelText: { color: '#6B7280', fontSize: 14 },

  saveModalText: {
    color: '#6D5DF6',
    fontWeight: '700',
    fontSize: 14,
  },

  richEditor: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 10,
  },

  richToolbar: { marginTop: 8, borderRadius: 10 },

  saveButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#6D5DF6',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
