import { UserProvider } from '@/contexts/UserContext';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="createLoginPage" />
            <Stack.Screen name="createPost" />
            <Stack.Screen name="postForm" />
            <Stack.Screen name="userProfile/[id]" />
          </Stack>
        </SafeAreaProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
