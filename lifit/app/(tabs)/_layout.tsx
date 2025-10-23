import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const routes = state.routes;
  const centralIndex = Math.floor(routes.length / 2);

  const renderTab = (route: (typeof routes)[0], routeIndex: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === routeIndex;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const getIcon = () => {
      switch (route.name) {
        case 'index':
          return <Image source={require('@/assets/images/casa.png')} style={[styles.icon, { tintColor: isFocused ? '#2B3C45' : '#A9A9A9' }]} />;
        case 'searchPage':
          return <Image source={require('@/assets/images/busca.png')} style={[styles.icon, { tintColor: isFocused ? '#2B3C45' : '#A9A9A9' }]} />;
        case 'conversas':
          return <Image source={require('@/assets/images/message.png')} style={[styles.icon, { tintColor: isFocused ? '#2B3C45' : '#A9A9A9' }]} />;
        case 'perfil':
          return <Image source={require('@/assets/images/perfil.png')} style={[styles.icon, { tintColor: isFocused ? '#2B3C45' : '#A9A9A9' }]} />;
        default:
          return null;
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
      >
        {getIcon()}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tabBarContainer, { height: 47 + insets.bottom, paddingBottom: insets.bottom - 10 }]}>
      {routes.slice(0, centralIndex).map((route, index) => renderTab(route, index))}

      <View style={styles.tabItem}>
        <TouchableOpacity
          key="add-button"
          style={styles.addButton}
          onPress={() => router.navigate('/createPost')}
        >
          <Ionicons name="add" size={40} color="#878787"  />
        </TouchableOpacity>
      </View>

      {routes.slice(centralIndex).map((route, index) => renderTab(route, centralIndex + index))}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="searchPage" />
      <Tabs.Screen name="conversas" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0, 
   
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
