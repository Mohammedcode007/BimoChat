// src/storage/mmkv.ts
import { createMMKV } from "react-native-mmkv";

export const appStorage = createMMKV({
  id: "bimo-app-storage",
});

export const userStorage = (userId: string) =>
  createMMKV({
    id: `bimo-user-${userId}`,
  });

// // src/storage/mmkv.ts

// import AsyncStorage from "@react-native-async-storage/async-storage";

// type StorageLike = {
//   set: (key: string, value: string) => Promise<void>;
//   getString: (key: string) => Promise<string | null>;
//   remove: (key: string) => Promise<void>;
//   getAllKeys: () => Promise<string[]>;
// };

// // ================== GLOBAL STORAGE ==================

// export const appStorage: StorageLike = {
//   set: async (key, value) => {
//     await AsyncStorage.setItem(`app:${key}`, value);
//   },

//   getString: async (key) => {
//     return await AsyncStorage.getItem(`app:${key}`);
//   },

//   remove: async (key) => {
//     await AsyncStorage.removeItem(`app:${key}`);
//   },

//   getAllKeys: async () => {
//     const keys = await AsyncStorage.getAllKeys();
//     return keys
//       .filter((k) => k.startsWith("app:"))
//       .map((k) => k.replace("app:", ""));
//   },
// };

// // ================== USER STORAGE ==================

// export const userStorage = (userId: string): StorageLike => {
//   return {
//     set: async (key, value) => {
//       await AsyncStorage.setItem(`${userId}:${key}`, value);
//     },

//     getString: async (key) => {
//       return await AsyncStorage.getItem(`${userId}:${key}`);
//     },

//     remove: async (key) => {
//       await AsyncStorage.removeItem(`${userId}:${key}`);
//     },

//     getAllKeys: async () => {
//       const keys = await AsyncStorage.getAllKeys();

//       return keys
//         .filter((k) => k.startsWith(`${userId}:`))
//         .map((k) => k.replace(`${userId}:`, ""));
//     },
//   };
// };