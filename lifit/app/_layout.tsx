import { UserProvider } from '@/contexts/UserContext';
import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="homePage" />
          <Stack.Screen name="createLoginPage" />
          <Stack.Screen name="createPost" />
          <Stack.Screen name="postForm" />
        </Stack>
      </SafeAreaProvider>
    </UserProvider>
  );
}
