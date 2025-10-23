import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SwipeableScreen from '@/components/SwipeableScreen';

export default function Conversas() {
  return (
    <SwipeableScreen currentScreen="conversas">
      <View style={styles.container}>
        <Text>Conversas</Text>
      </View>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
