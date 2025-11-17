import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/config/axiosConfig';

export default function CriarMeta() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [dataFim, setDataFim] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatarDataExibicao = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatarDataAPI = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const obterDataHoje = () => {
    const hoje = new Date();
    return formatarDataAPI(hoje);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDataFim(selectedDate);
    }
  };

  const criarMeta = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a meta.');
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataFimSelecionada = new Date(dataFim);
    dataFimSelecionada.setHours(0, 0, 0, 0);

    if (dataFimSelecionada < hoje) {
      Alert.alert('Erro', 'A data limite deve ser hoje ou uma data futura.');
      return;
    }

    try {
      setLoading(true);
      const body = {
        nome: nome.trim(),
        dataInicio: obterDataHoje(),
        dataFim: formatarDataAPI(dataFim),
      };

      await api.post('/meta', body);
      Alert.alert('Sucesso', 'Meta criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao criar meta:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível criar a meta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Meta</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome da Meta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Correr 5km por dia"
              value={nome}
              onChangeText={setNome}
              maxLength={100}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Data Limite</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#4CD964" />
              <Text style={styles.dateText}>{formatarDataExibicao(dataFim)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dataFim}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
                locale="pt-BR"
              />
            )}
          </View>

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={criarMeta}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Criar Meta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateContainer: {
    marginBottom: 40,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
    flex: 1,
  },
  createButton: {
    backgroundColor: '#4CD964',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
