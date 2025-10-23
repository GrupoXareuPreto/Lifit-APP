import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

export default function CreatePost() {
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    checkAndRequestPermission();
  }, [permission]);

  const checkAndRequestPermission = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      // Se a permissão não foi concedida, solicita
      const result = await requestPermission();
      
      if (!result.granted) {
        // Se o usuário negou a permissão
        if (result.canAskAgain === false) {
          // Permissão bloqueada, precisa ir nas configurações
          Alert.alert(
            "Permissão Necessária",
            "A permissão de câmera foi negada anteriormente. Para usar esta funcionalidade, você precisa permitir o acesso à câmera nas configurações do seu dispositivo.",
            [
              {
                text: "Cancelar",
                onPress: () => router.back(),
                style: "cancel"
              },
              {
                text: "Abrir Configurações",
                onPress: () => {
                  Linking.openSettings();
                  router.back();
                }
              }
            ],
            { cancelable: false }
          );
        } else {
          // Usuário apenas negou, pode voltar
          Alert.alert(
            "Permissão Negada",
            "A permissão de câmera é necessária para criar postagens.",
            [
              {
                text: "OK",
                onPress: () => router.back()
              }
            ]
          );
        }
      } else {
        // Permissão concedida
        setIsReady(true);
      }
    } else {
      // Já tem permissão
      setIsReady(true);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const src = result.assets[0].uri;
        const extMatch = src.match(/\.(jpg|jpeg|png|heic|webp)$/i);
        const ext = extMatch ? extMatch[0] : '.jpg';
        const dest = FileSystem.cacheDirectory + `post_${Date.now()}${ext}`;
        await FileSystem.copyAsync({ from: src, to: dest });
        setImage(dest);
      } catch (e) {
        console.warn('Falha ao persistir imagem da galeria, usando URI original:', e);
        setImage(result.assets[0].uri);
      }
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      try {
        const ext = '.jpg';
        const dest = FileSystem.cacheDirectory + `post_${Date.now()}${ext}`;
        await FileSystem.copyAsync({ from: photo.uri, to: dest });
        setImage(dest);
      } catch (e) {
        console.warn('Falha ao persistir foto da câmera, usando URI original:', e);
        setImage(photo.uri);
      }
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const handleNext = () => {
      Alert.alert(
          "Tipo de Postagem",
          "Escolha o tipo da sua postagem",
          [
        {
          text: "Postagem",
          onPress: () => router.push(`/postForm?imageUri=${encodeURIComponent(image ?? '')}` as any),
        },
              {
                  text: "Evento",
                  onPress: () => Alert.alert("Em desenvolvimento", "Esta funcionalidade ainda está em desenvolvimento."),
                  style: "cancel"
              }
          ]
      );
  };

  // Não renderiza nada até ter verificado a permissão
  if (!isReady) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      {image ? (
        <Image source={{ uri: image }} style={styles.camera} />
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      {image && (
        <TouchableOpacity style={[styles.nextButton, { top: insets.top + 12 }]} onPress={handleNext}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      )}

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#2B3C45',
    padding: 10,
    borderRadius: 50,
  },
});
