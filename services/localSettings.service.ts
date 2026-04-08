import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  notificationSoundEnabled: 'notification_sound_enabled',
};

/* ================================
   Notification Sound
================================ */

export const setNotificationSoundEnabled = async (value: boolean) => {
  try {
    await AsyncStorage.setItem(
      KEYS.notificationSoundEnabled,
      JSON.stringify(value)
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const getNotificationSoundEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.notificationSoundEnabled);

    if (value === null) {
      // القيمة الافتراضية عند أول تشغيل
      return true;
    }

    return JSON.parse(value);
  } catch (error) {
    return true;
  }
};

export const toggleNotificationSoundEnabled = async (): Promise<boolean> => {
  try {
    const current = await getNotificationSoundEnabled();
    const next = !current;
    await setNotificationSoundEnabled(next);
    return next;
  } catch (error) {
    return true;
  }
};

export const removeNotificationSoundEnabled = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.notificationSoundEnabled);
    return true;
  } catch (error) {
    return false;
  }
};