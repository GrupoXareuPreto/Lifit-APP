import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import PostCard from '../components/postCard'; // Importando nosso componente

// Dados fictícios para os posts
const MOCK_POSTS = [
  {
    id: '1',
    userName: 'Xareu Preto',
    userHandle: '@xareu',
    avatarUrl: 'https://i.imgur.com/S5yn29c.png', // Avatar do Xareu
    postImageUrl: 'https://images.pexels.com/photos/1576937/pexels-photo-1576937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    likes: 23000,
    comments: 2000,
    shares: 775,
    timestamp: 'HÁ 5 DIAS',
    event: {
      title: 'Caminhada no Maia - na trilha principal',
      date: '9 de Fevereiro de 2026',
      time: '09:30 - 11:00',
    },
  },
  {
    id: '2',
    userName: 'Horácio Augusto',
    userHandle: '@tks_has',
    avatarUrl: 'https://i.imgur.com/Qk9RNAB.png', // Avatar do Horácio
    postImageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    likes: 12500,
    comments: 852,
    shares: 321,
    timestamp: 'HÁ 1 DIA',
    event: null, // Sem evento para este post
  },
  {
    id: '3',
    userName: 'Juliana Silva',
    userHandle: '@juhsilva',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    postImageUrl: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    likes: 31800,
    comments: 4120,
    shares: 1205,
    timestamp: 'HÁ 7 DIAS',
    event: null,
  },
];


const FeedScreen = () => {
  // A função que diz ao FlatList como renderizar cada item
  const renderPost = ({ item }) => (
    <PostCard post={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={MOCK_POSTS}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Um cinza claro para o fundo
  },
});

export default FeedScreen;