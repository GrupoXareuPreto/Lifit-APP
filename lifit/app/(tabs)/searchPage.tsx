import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SwipeableScreen from '@/components/SwipeableScreen';
import api from '@/config/axiosConfig';
import { useUser } from '@/contexts/UserContext';

interface Usuario {
  id: number;
  nome: string;
  nomeUsuario: string;
  fotoPerfil: string | null;
  biografia: string | null;
}

export default function SearchPage() {
  const router = useRouter();
  const { userData } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const buscarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/usuario/buscar?query=${encodeURIComponent(searchQuery)}`);
      // Filtrar o próprio usuário dos resultados (comparar por nomeUsuario se id não estiver disponível)
      const usuariosFiltrados = response.data.filter((u: Usuario) => {
        if (userData?.id && u.id) {
          return u.id !== userData.id;
        }
        // Fallback: comparar por nomeUsuario
        return u.nomeUsuario !== userData?.nomeUsuario;
      });
      setUsuarios(usuariosFiltrados);
      setSearched(true);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, userData?.id, userData?.nomeUsuario]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const delaySearch = setTimeout(() => {
        buscarUsuarios();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(delaySearch);
    } else {
      setUsuarios([]);
      setSearched(false);
    }
  }, [searchQuery, buscarUsuarios]);

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <TouchableOpacity 
      style={styles.usuarioCard}
      onPress={() => router.push({
        pathname: `/userProfile/${item.id}`,
        params: { nomeUsuario: item.nomeUsuario }
      })}
    >
      <Image
        source={{ 
          uri: item.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nome)}&background=4CD964&color=fff&size=200` 
        }}
        style={styles.avatar}
      />
      <View style={styles.usuarioInfo}>
        <Text style={styles.nomeUsuario}>{item.nome}</Text>
        <Text style={styles.username}>@{item.nomeUsuario}</Text>
        {item.biografia && (
          <Text style={styles.bio} numberOfLines={1}>{item.biografia}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SwipeableScreen currentScreen="searchPage">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* Barra de Pesquisa */}
          <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuários..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Resultados */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4CD964" />
          </View>
        ) : searched && usuarios.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="person-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
            <Text style={styles.emptySubtext}>Tente buscar por outro nome</Text>
          </View>
        ) : usuarios.length > 0 ? (
          <FlatList
            data={usuarios}
            renderItem={renderUsuario}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.centerContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Buscar pessoas</Text>
            <Text style={styles.emptySubtext}>Digite um nome ou @usuario</Text>
          </View>
        )}
        </View>
      </SafeAreaView>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
  },
  usuarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  usuarioInfo: {
    flex: 1,
  },
  nomeUsuario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: '#999',
  },
});