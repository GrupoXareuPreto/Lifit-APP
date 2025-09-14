import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/postCard'; // Importando nosso componente
import axios from 'axios';
const API="https://lifit-augfbubbgtcydahz.brazilsouth-01.azurewebsites.net";

// Dados fictícios para os posts
const MOCK_POSTS = [
  {
    id: '4',
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
  axios.get(`${API}/postagem`)
];


const FeedScreen = () => {
  // A função que diz ao FlatList como renderizar cada item
  const renderPost = ({ item }: { item: any }) => (
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.navigate('/createPost')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Um cinza claro para o fundo
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#2B3C45',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default FeedScreen;