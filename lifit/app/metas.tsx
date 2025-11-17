import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '@/config/axiosConfig';

interface Meta {
  id: string;
  nome: string;
  publica: boolean;
  status: 'PENDENTE' | 'CONCLUIDA';
  dataFim: string;
}

export default function Metas() {
  const router = useRouter();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingMetaId, setUpdatingMetaId] = useState<string | null>(null);

  useEffect(() => {
    buscarMetas();
  }, []);

  const buscarMetas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meta/me');
      setMetas(response.data);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarMetas();
    setRefreshing(false);
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatarDataAPI = (dataISO: string) => {
    const data = new Date(dataISO);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const alternarStatusMeta = async (meta: Meta) => {
    try {
      setUpdatingMetaId(meta.id);
      const novoStatus = meta.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
      
      const body = {
        nome: meta.nome,
        status: novoStatus,
        dataFim: formatarDataAPI(meta.dataFim),
      };

      await api.put(`/meta/${meta.id}`, body);
      
      // Atualizar o estado local
      setMetas(prevMetas => 
        prevMetas.map(m => 
          m.id === meta.id ? { ...m, status: novoStatus } : m
        )
      );
    } catch (error) {
      console.error('Erro ao alternar status da meta:', error);
    } finally {
      setUpdatingMetaId(null);
    }
  };

  const renderMeta = ({ item }: { item: Meta }) => (
    <View style={styles.metaCard}>
      <View style={styles.metaContent}>
        <Text style={styles.metaTitle}>{item.nome}</Text>
        <Text style={styles.metaDate}>até {formatarData(item.dataFim)}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => alternarStatusMeta(item)}
        disabled={updatingMetaId === item.id}
      >
        {updatingMetaId === item.id ? (
          <ActivityIndicator size="small" color="#4CD964" />
        ) : item.status === 'CONCLUIDA' ? (
          <Ionicons name="checkmark-circle" size={36} color="#4CD964" />
        ) : (
          <Ionicons name="ellipse-outline" size={36} color="#ccc" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Metas · {metas.length}</Text>
      <View style={{ width: 28 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CD964" />
          </View>
        ) : (
          <>
            <FlatList
              data={metas}
              renderItem={renderMeta}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma meta encontrada.</Text>
                  <Text style={styles.emptySubtext}>Crie sua primeira meta!</Text>
                </View>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CD964']} />
              }
            />

            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={() => router.push('/criarMeta')}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
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
  headerContainer: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  metaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metaContent: {
    flex: 1,
    marginRight: 15,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  metaDate: {
    fontSize: 13,
    color: '#777',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
