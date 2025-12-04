import { useUser } from '@/contexts/UserContext';
import React, { useState, useEffect } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeableScreen from '@/components/SwipeableScreen';
import { Ionicons } from '@expo/vector-icons';
import Icon from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import api from '@/config/axiosConfig';

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
  descricao: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
}

export default function Perfil() {
  const { userData, logout } = useUser();
  const router = useRouter();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loadingMetas, setLoadingMetas] = useState(true);
  const [updatingMetaId, setUpdatingMetaId] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [seguidores, setSeguidores] = useState(0);
  const [seguindo, setSeguindo] = useState(0);

  useEffect(() => {
    buscarMetas();
    buscarEventos();
    buscarContadores();
  }, []);

  const buscarMetas = async () => {
    try {
      setLoadingMetas(true);
      const response = await api.get('/meta/me');
      setMetas(response.data);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoadingMetas(false);
    }
  };

  const buscarEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await api.get('/evento/me');
      setEventos(response.data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoadingEventos(false);
    }
  };

  const buscarContadores = async () => {
    try {
      if (userData?.id) {
        const response = await api.get(`/seguidor/conta/${userData.id}`);
        setSeguidores(response.data.seguidores);
        setSeguindo(response.data.seguindo);
      }
    } catch (error) {
      console.error('Erro ao buscar contadores:', error);
    }
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
        publica: meta.publica,
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

  const alternarPrivacidadeMeta = async (meta: Meta) => {
    try {
      const novaPrivacidade = !meta.publica;
      
      const body = {
        nome: meta.nome,
        status: meta.status,
        dataFim: formatarDataAPI(meta.dataFim),
        publica: novaPrivacidade,
      };

      await api.put(`/meta/${meta.id}`, body);
      
      // Atualizar o estado local
      setMetas(prevMetas => 
        prevMetas.map(m => 
          m.id === meta.id ? { ...m, publica: novaPrivacidade } : m
        )
      );
      
      Alert.alert('Sucesso', `Meta agora é ${novaPrivacidade ? 'pública' : 'privada'}`);
    } catch (error) {
      console.error('Erro ao alternar privacidade da meta:', error);
      Alert.alert('Erro', 'Não foi possível alterar a privacidade da meta');
    }
  };

  const metasExibidas = metas.slice(0, 3);


  if (!userData) {
    return (
      <SwipeableScreen currentScreen="perfil">
        <View style={styles.loadingContainer}>
          <Text>Carregando perfil...</Text>
        </View>
      </SwipeableScreen>
    );
  }

  const eventosPostadosCount = (userData.eventosCriados?.length || 0) + (userData.postagens?.length || 0);

  return (
    <SwipeableScreen currentScreen="perfil">
      <SafeAreaView style={styles.safeArea}>
        
        <ScrollView 
          style={styles.container}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        
        {/* Header com menu de 3 pontos - posicionado absolutamente */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
          
          {menuVisible && (
            <View style={styles.menuDropdown}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/editarPerfil' as any);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#000" />
                <Text style={styles.menuText}>Editar Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  Alert.alert('Configurações', 'Em desenvolvimento');
                }}
              >
                <Ionicons name="settings-outline" size={20} color="#000" />
                <Text style={styles.menuText}>Configurações</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => {
                  setMenuVisible(false);
                  Alert.alert(
                    'Sair',
                    'Tem certeza que deseja sair?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Sair', 
                        style: 'destructive',
                        onPress: () => {
                          logout();
                          router.replace('/');
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={[styles.menuText, styles.menuTextDanger]}>Sair</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Header Perfil */}
        <View style={styles.header}>
          <Image
            source={{ uri: userData.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nome)}&background=4CD964&color=fff&size=200` }}
            style={styles.profileImage}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{userData.nome}</Text>
            <Text style={styles.username}>{"@" + userData.nomeUsuario}</Text>
          </View>
        </View>

        {/* Contadores */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{seguidores}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{seguindo}</Text>
            <Text style={styles.statLabel}>Seguindo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{eventos.length}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.bioText}>{userData.biografia || 'Nenhuma biografia disponível.'}</Text>
        </View>

        {/* Metas */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas · {metas.length}</Text>
            <TouchableOpacity onPress={() => router.push('/metas')}>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loadingMetas ? (
            <ActivityIndicator size="small" color="#4CD964" style={{ marginTop: 10 }} />
          ) : metasExibidas.length > 0 ? (
            metasExibidas.map((meta, index) => (
              <View key={index} style={styles.metaItem}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.metaTitle}>{meta.nome}</Text>
                    <TouchableOpacity onPress={() => alternarPrivacidadeMeta(meta)}>
                      <Ionicons 
                        name={meta.publica ? 'eye' : 'eye-off'} 
                        size={18} 
                        color={meta.publica ? '#4CD964' : '#999'} 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.metaDate}>até {formatarData(meta.dataFim)}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => alternarStatusMeta(meta)}
                  disabled={updatingMetaId === meta.id}
                >
                  {updatingMetaId === meta.id ? (
                    <ActivityIndicator size="small" color="#4CD964" />
                  ) : meta.status === 'CONCLUIDA' ? (
                    <Ionicons name='checkmark-circle' size={33} color="#4CD964" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={33} color="#ccc" />
                  )}
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.devText}>Nenhuma meta encontrada.</Text>
          )}
        </View>

        {/* Eventos Postados */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Eventos Postados · {eventos.length}</Text>
          
          {loadingEventos ? (
            <ActivityIndicator size="small" color="#4CD964" style={{ marginTop: 10 }} />
          ) : eventos.length > 0 ? (
            <FlatList
              data={eventos}
              horizontal
              keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventListContainer}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.eventCard}
                  onPress={() => Alert.alert('Em Desenvolvimento', 'Exibição de detalhes do evento em desenvolvimento')}
                >
                  <Image source={{ uri: item.midia }} style={styles.eventImage} />
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {item.titulo}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.devText}>Nenhum evento encontrado.</Text>
          )}
        </View>

        {/* Postagens */}
        <View style={styles.postagensContainer}>
          <Text style={styles.postagensTitle}>Postagens</Text>
          <FlatList
            data={userData?.postagens || []}
            renderItem={({ item }) => (
              <Image source={{ uri: item.midia }} style={styles.postImage} />
            )}
            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
            numColumns={3}
            contentContainerStyle={styles.postsGrid}
            ListEmptyComponent={<Text style={styles.devText}>Nenhuma postagem encontrada.</Text>}
            scrollEnabled={false} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBar: {
        position: 'absolute',
        top: 10,
        right: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    menuButton: {
        padding: 5,
    },
    menuDropdown: {
        position: 'absolute',
        top: 45,
        right: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 180,
        zIndex: 1000,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#000',
    },
    menuTextDanger: {
        color: '#FF3B30',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    headerInfo: {
        marginLeft: 20,
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    stat: {
        alignItems: 'center',
        marginRight: 20,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    bioContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bioText: {
        fontSize: 14,
        color: '#333',
    },
    sectionContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    devContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    devText: {
        fontSize: 14,
        color: '#999',
    },
    postsGrid: {
        justifyContent: 'flex-start',
    },
    postImage: {
        width: '32%',
        aspectRatio: 1,
        
    },
    metaItem: {
    marginTop: 13,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaTitle: {
    fontWeight: '500',
    fontSize: 15,
    color: '#222',
  },
  metaDate: {
    fontSize: 12,
    color: '#777',
  },
  eventCard: {
    marginRight: 12,
    width: 130,
  },
  eventListContainer: {
    paddingRight: 20,
  },
  eventImage: {
    width: 130,
    height: 90,
    borderRadius: 10,
    marginTop: 10,
  },
  eventTitle: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
  },
  postagensContainer: {
        padding: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        margin: 0,
    },
    postagensTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        margin: 10,
        alignSelf: 'center',
    },
});
