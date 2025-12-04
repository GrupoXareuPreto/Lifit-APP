import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, Platform, StyleSheet, TouchableOpacity, View, Modal, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

export default function CreatePost() {
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
    setModalVisible(true);
  };

  const handlePostagem = () => {
    setModalVisible(false);
    router.push(`/postForm?imageUri=${encodeURIComponent(image ?? '')}` as any);
  };

  const handleEvento = () => {
    setModalVisible(false);
    router.push(`/criarEvento?imageUri=${encodeURIComponent(image ?? '')}` as any);
  };

  // Não renderiza nada até ter verificado a permissão
  if (!isReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        {image && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {image ? (
        <Image source={{ uri: image }} style={styles.camera} />
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      <SafeAreaView style={styles.safeBottom} edges={['bottom']}>
        <View style={styles.buttonContainer}>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha o tipo de postagem</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={handlePostagem}>
              <View style={styles.iconContainer}>
                <Ionicons name="image" size={32} color="#2B3C45" />
              </View>
              <Text style={styles.optionText}>Postagem</Text>
              <Text style={styles.optionDescription}>Compartilhe fotos e momentos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleEvento}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color="#2B3C45" />
              </View>
              <Text style={styles.optionText}>Evento</Text>
              <Text style={styles.optionDescription}>Crie um evento para a comunidade</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  safeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
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
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 50,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B3C45',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CD964',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
