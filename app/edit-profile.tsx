import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const COUNTRIES = ['مصر', 'السعودية', 'الإمارات', 'الولايات المتحدة', 'المغرب'];

export default function EditProfileScreen() {
  const [userId, setUserId] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('اختر الدولة');

  const [showCountryModal, setShowCountryModal] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>تعديل الملف الشخصي</Text>

        {/* ===== Cover ===== */}
        <View style={styles.coverBox}>
          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          <TouchableOpacity style={styles.coverBtn}>
            <Text style={styles.coverText}>تغيير صورة الغلاف</Text>
          </TouchableOpacity>
        </View>

        {/* ===== Avatar ===== */}
        <View style={styles.avatarBox}>
          <Ionicons name="person-circle-outline" size={90} color="#9CA3AF" />
          <TouchableOpacity>
            <Text style={styles.avatarText}>تغيير الصورة الشخصية</Text>
          </TouchableOpacity>
        </View>

        {/* ===== ID ===== */}
        <Input
          label="المعرف (ID)"
          placeholder="user_id"
          value={userId}
          onChangeText={setUserId}
        />

        {/* ===== Bio ===== */}
        <Input
          label="نبذة عنك"
          placeholder="اكتب نبذة قصيرة"
          value={bio}
          onChangeText={setBio}
          multiline
        />

        {/* ===== Country ===== */}
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={styles.selectLabel}>الدولة</Text>
          <View style={styles.selectRow}>
            <Text style={styles.selectValue}>{country}</Text>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* ===== Password Section ===== */}
        <View style={styles.passwordCard}>
          <Text style={styles.sectionTitle}>تغيير كلمة السر</Text>

          <Input
            label="كلمة السر الحالية"
            secureTextEntry
            value={oldPass}
            onChangeText={setOldPass}
          />

          <Input
            label="كلمة السر الجديدة"
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
          />

          <TouchableOpacity style={styles.passwordBtn}>
            <Text style={styles.passwordBtnText}>
              تغيير كلمة السر
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== Save ===== */}
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>حفظ التغييرات</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ===== Country Modal ===== */}
      <Modal visible={showCountryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>اختر الدولة</Text>

            {COUNTRIES.map(c => (
              <TouchableOpacity
                key={c}
                style={styles.countryRow}
                onPress={() => {
                  setCountry(c);
                  setShowCountryModal(false);
                }}
              >
                <Text>{c}</Text>
                {country === c && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#6D5DF6"
                  />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={styles.closeText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ================= COMPONENT ================= */

function Input({ label, ...props }: any) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
  },

  /* Cover */
  coverBox: {
    height: 140,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  coverBtn: {
    marginTop: 6,
  },
  coverText: {
    fontSize: 13,
    color: '#374151',
  },

  /* Avatar */
  avatarBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },

  inputBox: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },

  selectBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  selectLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectValue: {
    fontSize: 15,
  },

  passwordCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  passwordBtn: {
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  passwordBtnText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },

  saveBtn: {
    backgroundColor: '#6D5DF6',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  saveText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#6D5DF6',
    fontWeight: '700',
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
