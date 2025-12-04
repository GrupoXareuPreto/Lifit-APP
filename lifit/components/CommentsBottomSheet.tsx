import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/config/axiosConfig';
import { useUser } from '@/contexts/UserContext';

interface ComentarioAPI {
  id: number;
  conteudo: string;
  autorId: number;
  autorNomeUsuario: string;
  dataCriacao: string;
  postagemId?: number;
  eventoId?: number;
}

interface Comentario {
  id: number;
  conteudo: string;
  autor: {
    id: number;
    nome: string;
    nomeUsuario: string;
    fotoPerfil: string | null;
  };
  dataCriacao: string;
}

interface CommentsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postagemId?: number;
  eventoId?: number;
  onCommentAdded?: () => void;
}

const CommentsBottomSheet: React.FC<CommentsBottomSheetProps> = ({
  visible,
  onClose,
  postagemId,
  eventoId,
  onCommentAdded
}) => {
  const { userData } = useUser();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (visible) {
      carregarComentarios(true);
    } else {
      // Reseta ao fechar
      setComentarios([]);
      setPage(0);
      setHasMore(true);
    }
  }, [visible, postagemId, eventoId]);

  const carregarComentarios = async (reset = false) => {
    if (loading || loadingMore) return;
    
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const endpoint = postagemId 
        ? `/comentario/postagem/${postagemId}`
        : `/comentario/evento/${eventoId}`;

      console.log('Carregando comentários do endpoint:', endpoint);
      const response = await api.get<ComentarioAPI[]>(endpoint);
      const comentariosAPI = response.data;
      
      console.log('Total de comentários recebidos:', comentariosAPI.length);

      // Buscar dados completos dos autores
      const todosComentarios: Comentario[] = await Promise.all(
        comentariosAPI.map(async (c) => {
          try {
            // Buscar dados completos do usuário
            const userResponse = await api.get(`/usuario/${c.autorId}`);
            const userData = userResponse.data;
            
            return {
              id: c.id,
              conteudo: c.conteudo,
              dataCriacao: c.dataCriacao,
              autor: {
                id: userData.id,
                nome: userData.nome || userData.nomeUsuario,
                nomeUsuario: userData.nomeUsuario,
                fotoPerfil: userData.fotoPerfil
              }
            };
          } catch (error) {
            console.error('Erro ao buscar dados do autor:', error);
            // Fallback caso não consiga buscar o usuário
            return {
              id: c.id,
              conteudo: c.conteudo,
              dataCriacao: c.dataCriacao,
              autor: {
                id: c.autorId,
                nome: c.autorNomeUsuario,
                nomeUsuario: c.autorNomeUsuario,
                fotoPerfil: null
              }
            };
          }
        })
      );

      // Paginação manual no frontend
      const startIndex = reset ? 0 : (page + 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const novosComentarios = todosComentarios.slice(startIndex, endIndex);

      console.log('Mostrando comentários de', startIndex, 'até', endIndex);
      console.log('Novos comentários:', novosComentarios.length);

      if (reset) {
        setComentarios(novosComentarios);
        setPage(0);
      } else {
        setComentarios(prev => [...prev, ...novosComentarios]);
        setPage(prev => prev + 1);
      }

      setHasMore(endIndex < todosComentarios.length);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    try {
      setEnviando(true);

      await api.post('/comentario', {
        conteudo: novoComentario.trim(),
        postagemId: postagemId || null,
        eventoId: eventoId || null,
      });

      setNovoComentario('');
      carregarComentarios(true);
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setEnviando(false);
    }
  };

  const formatarTempo = (dataISO: string) => {
    const agora = new Date();
    const data = new Date(dataISO);
    const diffMs = agora.getTime() - data.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}min`;
    if (diffHoras < 24) return `${diffHoras}h`;
    return `${diffDias}d`;
  };

  const renderComentario = ({ item }: { item: Comentario }) => {
    if (!item || !item.autor) return null;
    
    return (
      <View style={styles.comentarioItem}>
        <Image
          source={{ uri: item.autor.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.autor.nomeUsuario) + '&background=4CD964&color=fff&size=200' }}
          style={styles.avatarComentario}
        />
        <View style={styles.comentarioContent}>
          <View style={styles.comentarioHeader}>
            <Text style={styles.nomeAutor}>{item.autor.nome}</Text>
            <Text style={styles.tempoComentario}>{formatarTempo(item.dataCriacao)}</Text>
          </View>
          <Text style={styles.textoComentario}>{item.conteudo}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Lista de Comentários */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CD964" />
            </View>
          ) : (
            <FlatList
              data={comentarios}
              renderItem={renderComentario}
              keyExtractor={(item) => item.id.toString()}
              style={styles.lista}
              contentContainerStyle={styles.listaContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhum comentário ainda.</Text>
                  <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
                </View>
              }
              ListFooterComponent={
                hasMore && comentarios.length > 0 && !loadingMore ? (
                  <TouchableOpacity 
                    style={styles.maisComentariosButton}
                    onPress={() => carregarComentarios(false)}
                  >
                    <Text style={styles.maisComentariosText}>Mais comentários</Text>
                  </TouchableOpacity>
                ) : loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#999" />
                  </View>
                ) : null
              }
            />
          )}

          {/* Input de Novo Comentário - Fixo na parte inferior */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              {userData && (
                <Image
                  source={{ uri: userData.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.nomeUsuario || 'User') + '&background=4CD964&color=fff&size=200' }}
                  style={styles.avatarInput}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Adicione um comentário..."
                placeholderTextColor="#999"
                value={novoComentario}
                onChangeText={setNovoComentario}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !novoComentario.trim() && styles.sendButtonDisabled]}
                onPress={enviarComentario}
                disabled={enviando || !novoComentario.trim()}
              >
                {enviando ? (
                  <ActivityIndicator size="small" color="#4CD964" />
                ) : (
                  <Ionicons name="send" size={20} color="#4CD964" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    maxHeight: '70%',
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 5,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
  },
  comentarioItem: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  avatarComentario: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  comentarioContent: {
    flex: 1,
  },
  comentarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nomeAutor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginRight: 6,
  },
  tempoComentario: {
    fontSize: 11,
    color: '#999',
  },
  textoComentario: {
    fontSize: 13,
    color: '#000',
    lineHeight: 18,
  },
  maisComentariosButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  maisComentariosText: {
    fontSize: 13,
    color: '#666',
  },
  loadingMoreContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  avatarInput: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
});

export default CommentsBottomSheet;
