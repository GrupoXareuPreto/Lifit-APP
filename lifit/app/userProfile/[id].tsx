import React, { useState, useEffect } from 'react';
import SwipeableScreen from '@/components/SwipeableScreen';
import { 
  FlatList, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/config/axiosConfig';

interface Usuario {
  id: number;
  nome: string;
  nomeUsuario: string;
  fotoPerfil: string | null;
  biografia: string | null;
}

interface Meta {
  id: string;
  nome: string;
  publica: boolean;
  status: 'PENDENTE' | 'CONCLUIDA';
  dataFim: string;
}

interface Evento {
  id: number;
  titulo: string;
  midia: string;
}

interface Postagem {
  id: number;
  titulo: string;
  midia: string;
  descricao: string;
}

interface ContadorSeguidor {
  seguidores: number;
  seguindo: number;
  estaSeguindo: boolean;
}

export default function UserProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const nomeUsuario = Array.isArray(params.nomeUsuario) ? params.nomeUsuario[0] : params.nomeUsuario;
  
  console.log('UserProfile - ID recebido:', id);
  console.log('UserProfile - nomeUsuario recebido:', nomeUsuario);
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [contadores, setContadores] = useState<ContadorSeguidor>({ seguidores: 0, seguindo: 0, estaSeguindo: false });
  const [loading, setLoading] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Tentar carregar dados do usuário - primeiro por ID, depois por nomeUsuario
      let userRes;
      let usuarioIdReal = id;
      
      try {
        if (id && id !== 'undefined') {
          userRes = await api.get(`/usuario/${id}`);
        } else if (nomeUsuario) {
          console.log('ID undefined, buscando por nomeUsuario:', nomeUsuario);
          // Buscar usando o endpoint de busca
          const buscaRes = await api.get(`/usuario/buscar?query=${nomeUsuario}`);
          if (buscaRes.data && buscaRes.data.length > 0) {
            // Encontrar o usuário exato (match perfeito)
            const usuarioEncontrado = buscaRes.data.find((u: any) => u.nomeUsuario === nomeUsuario);
            if (usuarioEncontrado) {
              usuarioIdReal = usuarioEncontrado.id;
              // Agora buscar dados completos do usuário
              userRes = await api.get(`/usuario/${usuarioIdReal}`);
            } else {
              throw new Error('Usuário não encontrado');
            }
          } else {
            throw new Error('Usuário não encontrado');
          }
        } else {
          throw new Error('Nem ID nem nomeUsuario disponíveis');
        }
      } catch (error) {
        console.log('Erro ao buscar usuário:', error);
        throw error;
      }

      console.log('Dados do usuário carregados:', userRes.data.nomeUsuario);
      console.log('ID real do usuário:', usuarioIdReal);
      console.log('Metas do usuário:', userRes.data.metas?.length || 0);
      console.log('Eventos do usuário:', userRes.data.eventos?.length || 0);
      console.log('Postagens do usuário:', userRes.data.postagens?.length || 0);
      
      // Carregar apenas contadores usando o ID real
      const contadoresRes = await api.get(`/seguidor/conta/${usuarioIdReal}`).catch((err) => {
        console.log('Erro ao carregar contadores:', err.response?.status);
        return { data: { seguidores: 0, seguindo: 0, estaSeguindo: false } };
      });

      console.log('Contadores:', contadoresRes.data);

      // Usar dados que já vêm no userRes
      setUsuario(userRes.data);
      setMetas((userRes.data.metas || []).filter((m: Meta) => m.publica));
      setEventos(userRes.data.eventos || []);
      setPostagens(userRes.data.postagens || []);
      setContadores(contadoresRes.data);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      Alert.alert('Erro', 'Não foi possível carregar o perfil. Verifique sua conexão e tente novamente.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSeguir = async () => {
    try {
      setLoadingFollow(true);
      const usuarioId = usuario?.id || id;
      console.log('Tentando seguir/deixar de seguir usuário:', usuarioId);
      console.log('Usuario object:', usuario);
      console.log('Ação:', contadores.estaSeguindo ? 'DEIXAR DE SEGUIR' : 'SEGUIR');
      
      if (!usuarioId || usuarioId === 'undefined') {
        Alert.alert('Erro', 'ID do usuário não encontrado');
        return;
      }
      
      if (contadores.estaSeguindo) {
        const response = await api.delete(`/seguidor/${usuarioId}`);
        console.log('Deixou de seguir com sucesso');
        setContadores(prev => ({ ...prev, estaSeguindo: false, seguidores: prev.seguidores - 1 }));
      } else {
        const response = await api.post(`/seguidor/${usuarioId}`);
        console.log('Seguiu com sucesso');
        setContadores(prev => ({ ...prev, estaSeguindo: true, seguidores: prev.seguidores + 1 }));
      }
    } catch (error: any) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      console.error('Status do erro:', error.response?.status);
      console.error('Mensagem do erro:', error.response?.data);
      Alert.alert('Erro', `Não foi possível processar a ação. Status: ${error.response?.status || 'desconhecido'}`);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleEventoClick = () => {
    Alert.alert('Em desenvolvimento', 'Visualização de eventos em breve!');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + ' mil';
    }
    return num.toString();
  };

  if (loading || !usuario) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CD964" />
      </SafeAreaView>
    );
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <SwipeableScreen currentScreen="searchPage">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header com botão voltar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>

          {/* Header Perfil */}
          <View style={styles.header}>
            <Image
              source={{ uri: usuario.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nome)}&background=4CD964&color=fff&size=200` }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{usuario.nome}</Text>
            <Text style={styles.name}>@{usuario.nomeUsuario}</Text>
          </View>

          {/* Botão Seguir */}
          <View style={styles.followButtonContainer}>
            <TouchableOpacity 
              style={[styles.followButton, contadores.estaSeguindo && styles.followingButton]}
              onPress={handleSeguir}
              disabled={loadingFollow}
            >
              {loadingFollow ? (
                <ActivityIndicator size="small" color={contadores.estaSeguindo ? "#4CD964" : "#fff"} />
              ) : (
                <Text style={[styles.followButtonText, contadores.estaSeguindo && styles.followingButtonText]}>
                  {contadores.estaSeguindo ? 'Seguindo' : 'Seguir'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Contadores */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{contadores.seguidores}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{contadores.seguindo}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{eventos.length}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
          </View>

          {/* Biografia */}
          <View style={styles.bioContainer}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.bioText}>{usuario.biografia || 'Nenhuma biografia disponível.'}</Text>
          </View>

          {/* Metas */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Metas · {metas.length}</Text>
            {metas.length > 0 ? (
              metas.map((meta, index) => (
                <View key={index} style={styles.metaItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaTitle}>{meta.nome}</Text>
                    <Text style={styles.metaDate}>até {formatarData(meta.dataFim)}</Text>
                  </View>
                  {meta.status === 'CONCLUIDA' && (
                    <Ionicons name='checkmark-circle' size={33} color="#4CD964" />
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.devText}>Nenhuma meta pública.</Text>
            )}
          </View>

          {/* Eventos Postados */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Eventos Postados · {eventos.length}</Text>
            {eventos.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventListContainer}
              >
                {eventos.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id?.toString() || `evento-${index}`}
                    style={styles.eventCard}
                    onPress={handleEventoClick}
                  >
                    <Image source={{ uri: item.midia }} style={styles.eventImage} />
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.devText}>Nenhum evento encontrado.</Text>
            )}
          </View>

          {/* Postagens */}
          <View style={styles.postagensContainer}>
            <Text style={styles.postagensTitle}>Postagens</Text>
            {postagens.length > 0 ? (
              <View style={styles.postsGridContainer}>
                {postagens.map((item, index) => (
                  <Image 
                    key={item.id?.toString() || `postagem-${index}`}
                    source={{ uri: item.midia }} 
                    style={styles.postImage} 
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.devText}>Nenhuma postagem encontrada.</Text>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    color: '#666',
  },
  followButtonContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  followButton: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CD964',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#4CD964',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  metaDate: {
    fontSize: 14,
    color: '#666',
  },
  eventListContainer: {
    paddingRight: 10,
  },
  eventCard: {
    marginRight: 12,
  },
  eventImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    width: 150,
    color: '#333',
  },
  postagensContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  postagensTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  postsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postImage: {
    width: (Dimensions.get('window').width - 48) / 3,
    height: (Dimensions.get('window').width - 48) / 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  devText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
