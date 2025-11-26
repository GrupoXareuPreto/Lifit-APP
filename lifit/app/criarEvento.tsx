import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Cloudinary } from "@cloudinary/url-gen";
import { upload } from 'cloudinary-react-native';
import { cloudinaryConfig } from '@/config/cloudinaryConfig';
import api from '@/config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CriarEvento() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePickerInicio, setShowTimePickerInicio] = useState(false);
  const [showTimePickerFim, setShowTimePickerFim] = useState(false);
  const [uploading, setUploading] = useState(false);

  const formatarData = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarHora = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const combinarDataHora = (data: Date, hora: Date): string => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const horas = String(hora.getHours()).padStart(2, '0');
    const minutos = String(hora.getMinutes()).padStart(2, '0');
    return `${ano}-${mes}-${dia}T${horas}:${minutos}:00`;
  };

  const handlePublicar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Digite um título para o evento');
      return;
    }
    if (!localizacao.trim()) {
      Alert.alert('Erro', 'Digite o local do evento');
      return;
    }

    // Validar que horário fim é depois do início
    const inicioTime = horaInicio.getHours() * 60 + horaInicio.getMinutes();
    const fimTime = horaFim.getHours() * 60 + horaFim.getMinutes();
    if (fimTime <= inicioTime) {
      Alert.alert('Erro', 'O horário de término deve ser posterior ao horário de início');
      return;
    }

    setUploading(true);

    try {
      // Upload da imagem para Cloudinary
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

      let imageUrl: string | null = null;

      await new Promise<void>((resolve, reject) => {
        upload(cld, {
          file: imageUri,
          options: options,
          callback: (error: any, response: any) => {
            if (error) {
              console.error('Erro no upload:', error);
              reject(error);
            } else if (response?.secure_url) {
              imageUrl = response.secure_url;
              resolve();
            } else {
              reject(new Error('Upload falhou'));
            }
          },
        });
      });

      if (!imageUrl) {
        throw new Error('Falha ao obter URL da imagem');
      }

      // Combinar data + hora para criar os timestamps
      const dataInicio = combinarDataHora(data, horaInicio);
      const dataFim = combinarDataHora(data, horaFim);

      // Enviar para a API
      const response = await api.post('/evento', {
        titulo,
        midia: imageUrl,
        descricao: descricao.trim() || null,
        localizacao,
        dataInicio,
        dataFim,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Evento criado com sucesso!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', response.data?.message || 'Erro ao criar evento');
      }
    } catch (error) {
      console.error('Erro ao publicar evento:', error);
      Alert.alert('Erro', 'Não foi possível publicar o evento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2B3C45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Evento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do evento"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva seu evento..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Data *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>{formatarData(data)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={data}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setData(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Horário Início *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePickerInicio(true)}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatarHora(horaInicio)}</Text>
              </TouchableOpacity>
              {showTimePickerInicio && (
                <DateTimePicker
                  value={horaInicio}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePickerInicio(Platform.OS === 'ios');
                    if (selectedTime) {
                      setHoraInicio(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Horário Fim *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePickerFim(true)}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatarHora(horaFim)}</Text>
              </TouchableOpacity>
              {showTimePickerFim && (
                <DateTimePicker
                  value={horaFim}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowTimePickerFim(Platform.OS === 'ios');
                    if (selectedTime) {
                      setHoraFim(selectedTime);
                    }
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Local *</Text>
            <TextInput
              style={styles.input}
              placeholder="Endereço ou nome do local"
              value={localizacao}
              onChangeText={setLocalizacao}
              maxLength={200}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.publishButton, uploading && styles.publishButtonDisabled]}
          onPress={handlePublicar}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.publishButtonText}>Criar Evento</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B3C45',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B3C45',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2B3C45',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#2B3C45',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  publishButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
