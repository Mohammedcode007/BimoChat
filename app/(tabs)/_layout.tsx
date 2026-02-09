import { Tabs } from 'expo-router';
import React from 'react';

import AppHeader from '@/components/AppHeader';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { View } from 'react-native';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      {/* Header ثابت */}
      <AppHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        {/* Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Octicons name="home" size={22} color={color} />
            ),
          }}
        />

        {/* Chats */}
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Chats',
            tabBarIcon: ({ color }) => (
              <Ionicons name="chatbubbles-outline" size={22} color={color} />
            ),
          }}
        />

        {/* Rooms */}
        <Tabs.Screen
          name="rooms"
          options={{
            title: 'Rooms',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home-group" size={22} color={color} />
            ),
          }}
        />

        {/* Friends */}
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="user-friends" size={22} color={color} />
            ),
          }}
        />

        {/* Tweets */}
        <Tabs.Screen
          name="tweets"
          options={{
            title: 'Tweets',
            tabBarIcon: ({ color }) => (
              <AntDesign name="retweet" size={22} color={color} />
            ),
          }}
        />

        {/* Settings */}
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Feather name="settings" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>

  );
}
