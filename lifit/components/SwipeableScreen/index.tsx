import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

interface SwipeableScreenProps {
  children: React.ReactNode;
  currentScreen: 'index' | 'searchPage' | 'conversas' | 'perfil';
}

const SCREEN_ORDER = ['index', 'searchPage', 'conversas', 'perfil'] as const;

export default function SwipeableScreen({ children, currentScreen }: SwipeableScreenProps) {
  const navigation = useNavigation<any>();
  const currentIndex = SCREEN_ORDER.indexOf(currentScreen);

  const handleNavigation = useCallback((direction: 'left' | 'right') => {
    try {
      let nextIndex: number;

      if (direction === 'left') {
        // Swipe left = próxima tela (direita)
        nextIndex = (currentIndex + 1) % SCREEN_ORDER.length;
      } else {
        // Swipe right = tela anterior (esquerda)
        nextIndex = (currentIndex - 1 + SCREEN_ORDER.length) % SCREEN_ORDER.length;
      }

      const nextScreen = SCREEN_ORDER[nextIndex];
      navigation.navigate(nextScreen);
    } catch (error) {
      console.error('Erro ao navegar:', error);
    }
  }, [currentIndex, navigation]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-30, 30])
    .onEnd((event) => {
      'worklet';
      const SWIPE_THRESHOLD = 80;
      
      const { translationX } = event;

      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        if (translationX > 0) {
          runOnJS(handleNavigation)('right');
        } else {
          runOnJS(handleNavigation)('left');
        }
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
