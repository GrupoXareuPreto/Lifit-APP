import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@/contexts/UserContext';
import api from '@/config/axiosConfig';
import { Cloudinary } from "@cloudinary/url-gen";
import { upload } from 'cloudinary-react-native';
import { cloudinaryConfig } from '@/config/cloudinaryConfig';

export default function EditarPerfil() {
  const router = useRouter();
  const { userData, setUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [nome, setNome] = useState(userData?.nome || '');
  const [nomeUsuario, setNomeUsuario] = useState(userData?.nomeUsuario || '');
  const [biografia, setBiografia] = useState(userData?.biografia || '');
  const [fotoPerfil, setFotoPerfil] = useState(userData?.fotoPerfil || '');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        const imageUri = result.assets[0].uri;
        
        // Upload para Cloudinary usando o mesmo método do resto do app
        const cld = new Cloudinary({
          cloud: { 
            cloudName: cloudinaryConfig.cloudName,
            apiKey: cloudinaryConfig.apiKey,
            apiSecret: cloudinaryConfig.apiSecret
          },
          url: { 
            secure: true
          }
        });

        const options = {
          upload_preset: 'TesteLifit',
          unsigned: true,
        };

        await new Promise<void>((resolve, reject) => {
          upload(cld, {
            file: imageUri,
            options: options,
            callback: (error: any, response: any) => {
              if (error) {
                console.error('Erro no upload:', error);
                Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
                setUploadingImage(false);
                reject(error);
              } else if (response?.secure_url) {
                console.log('Upload bem-sucedido:', response.secure_url);
                setFotoPerfil(response.secure_url);
                setUploadingImage(false);
                resolve();
              } else {
                reject(new Error('Upload falhou'));
                setUploadingImage(false);
              }
            },
          });
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível fazer upload da imagem.');
      setUploadingImage(false);
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    if (!nomeUsuario.trim()) {
      Alert.alert('Erro', 'O nome de usuário é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const usuarioAtualizado = {
        nome: nome.trim(),
        nomeUsuario: nomeUsuario.trim(),
        biografia: biografia.trim(),
        fotoPerfil: fotoPerfil || null,
        email: userData?.email || '',
        senha: '', // Backend ignora se estiver vazio
      };

      const response = await api.put('/usuario/me', usuarioAtualizado);
      
      // Atualiza o contexto com os novos dados
      setUserData(response.data);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      if (error.response?.status === 409) {
        Alert.alert('Erro', 'Nome de usuário já está em uso');
      } else if (error.response?.data?.message) {
        Alert.alert('Erro', error.response.data.message);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Foto de Perfil */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {uploadingImage ? (
              <View style={styles.profileImage}>
                <ActivityIndicator size="large" color="#4CD964" />
              </View>
            ) : (
              <Image
                source={
                  fotoPerfil
                    ? { uri: fotoPerfil }
                    : require('@/assets/images/AndrePai.jpg')
                }
                style={styles.profileImage}
              />
            )}
          </View>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Text style={styles.changePhotoText}>
              {uploadingImage ? 'Enviando...' : 'Alterar foto'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Campos de Edição */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de usuário</Text>
            <TextInput
              style={styles.input}
              value={nomeUsuario}
              onChangeText={setNomeUsuario}
              placeholder="@seunome"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biografia</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={biografia}
              onChangeText={setBiografia}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  container: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  changePhotoText: {
    color: '#4CD964',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: '#4CD964',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#a0d9af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
