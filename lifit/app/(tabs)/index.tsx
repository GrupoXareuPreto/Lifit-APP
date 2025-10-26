import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../../components/postCard';
import SwipeableScreen from '@/components/SwipeableScreen';
import api from '@/config/axiosConfig';

interface Autor {
  fotoPerfil: string | null;
  nome: string;
  nomeUsuario: string;
}

interface PostagemFeed {
  autor: Autor;
  midia: string;
  titulo: string;
  descricao?: string; 
  dataPublicacao: string;
  numCurtidas: number;
  numComentaios: number;
  numCompartilhamentos: number;
}

interface FeedResponse {
  postagens: PostagemFeed[];
  nextCursor: string | null;
  hasMore: boolean;
}

const FeedScreen = () => {
  const [posts, setPosts] = useState<PostagemFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Função para calcular tempo relativo
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
                                        //esse +180 tem sentido
    if (diffMins < 60) return `HÁ ${diffMins+180} MIN${diffMins !== 1 ? 'S' : ''}`;
    if (diffHours < 24) return `HÁ ${diffHours} HORA${diffHours !== 1 ? 'S' : ''}`;
    return `HÁ ${diffDays} DIA${diffDays !== 1 ? 'S' : ''}`;
  };

  // Transforma a postagem da API para o formato do PostCard
  const transformPost = (post: PostagemFeed) => {
    return {
      id: post.dataPublicacao + post.autor.nomeUsuario, // ID único
      userName: post.autor.nome || 'Usuário',
      userHandle: post.autor.nomeUsuario ? `@${post.autor.nomeUsuario}` : '@usuario',
      avatarUrl: post.autor.fotoPerfil || 'https://i.imgur.com/Qk9RNAB.png', // Avatar padrão AndrePai
      postImageUrl: post.midia,
      description: post.descricao || post.titulo, // Usa título como fallback se não houver descrição
      likes: post.numCurtidas,
      comments: post.numComentaios,
      shares: post.numCompartilhamentos,
      timestamp: getTimeAgo(post.dataPublicacao),
      event: undefined, // Por enquanto sem evento
    };
  };

  // Carregar feed inicial
  const loadFeed = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('Carregando feed...');
      const response = await api.get<FeedResponse>('/postagens/feed', {
        params: {
          tamanhoPagina: 10,
        },
      });

      console.log('Feed carregado com sucesso:', response.data.postagens.length, 'posts');
      setPosts(response.data.postagens);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } catch (error: any) {
      console.error('Erro ao carregar feed:', error);
      console.error('Status:', error.response?.status);
      console.error('Mensagem:', error.response?.data);
      Alert.alert(
        'Erro ao carregar feed',
        'Não foi possível carregar as postagens. Deseja tentar novamente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tentar novamente', onPress: () => loadFeed(isRefresh) },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar mais posts
  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);

      const response = await api.get<FeedResponse>('/postagens/feed', {
        params: {
          ultimoCursor: nextCursor,
          tamanhoPagina: 10,
        },
      });

      // Adiciona novos posts ao array existente (evita duplicatas)
      const newPosts = response.data.postagens.filter(
        (newPost) => !posts.some((existingPost) => 
          existingPost.dataPublicacao === newPost.dataPublicacao && 
          existingPost.autor.nomeUsuario === newPost.autor.nomeUsuario
        )
      );

      setPosts([...posts, ...newPosts]);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } catch (error: any) {
      console.error('Erro ao carregar mais posts:', error);
      Alert.alert(
        'Erro ao carregar mais posts',
        'Não foi possível carregar mais postagens. Deseja tentar novamente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tentar novamente', onPress: loadMorePosts },
        ]
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // Atualizar feed (pull to refresh)
  const onRefresh = useCallback(() => {
    loadFeed(true);
  }, []);

  // Carregar feed ao montar o componente
  useEffect(() => {
    loadFeed();
  }, []);

  // Renderizar cada post
  const renderPost = ({ item }: { item: PostagemFeed }) => (
    <PostCard post={transformPost(item)} />
  );

  // Renderizar loading no final da lista
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2B3C45" />
        <Text style={styles.loadingText}>Carregando mais posts...</Text>
      </View>
    );
  };

  // Renderizar mensagem quando não há posts
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum post disponível</Text>
      </View>
    );
  };

  // Loading inicial
  if (loading) {
    return (
      <SwipeableScreen currentScreen="index">
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B3C45" />
            <Text style={styles.loadingText}>Carregando feed...</Text>
          </View>
        </SafeAreaView>
      </SwipeableScreen>
    );
  }

  return (
    <SwipeableScreen currentScreen="index">
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item, index) => `${item.dataPublicacao}-${item.autor.nomeUsuario}-${index}`}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2B3C45']}
              tintColor="#2B3C45"
            />
          }
        />
      </SafeAreaView>
    </SwipeableScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default FeedScreen;