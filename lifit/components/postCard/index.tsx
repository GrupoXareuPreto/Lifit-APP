import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from "./style";
import Toast from 'react-native-toast-message';

// Função para formatar números grandes (ex: 23000 -> 23 mil)
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0).replace('.', ',') + ' mil';
  }
  return num;
};

interface PostEvent {
  title: string;
  date: string;
  time: string;
}

interface Post {
  avatarUrl: string;
  userName: string;
  userHandle: string;
  postImageUrl: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  event?: PostEvent;

}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {

  // Funções para ações
  const handleLike = () => {
    Toast.show({
      type: 'success',
      text1: 'Você curtiu a postagem!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleComment = () => {
    Toast.show({
      type: 'info',
      text1: 'Abrindo comentários...',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handleShare = () => {
    Toast.show({
      type: 'success',
      text1: 'Post compartilhado!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho do Post */}
      <View style={styles.header}>
        <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.userHandle}>{post.userHandle}</Text>
        </View>
      </View>

      {/* Imagem do Post */}
      <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />

      {/* Barra de Ações */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <FontAwesome name="thumbs-o-up" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(post.likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={handleComment}>
          <FontAwesome name="comment-o" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(post.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={handleShare}>
          <FontAwesome name="share" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(post.shares)}</Text>
        </TouchableOpacity>

        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>

      {/* Bloco de Evento (renderização condicional) */}
      {post.event && (
        <View style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{post.event.title}</Text>
          <Text style={styles.eventDetails}>{post.event.date}</Text>
          <Text style={styles.eventDetails}>{post.event.time}</Text>
          <View style={styles.likesContainer}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.likedAvatar} />
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/46.jpg' }} style={[styles.likedAvatar, styles.likedAvatarOverlap]} />
            <Text style={styles.likedText}>curtido por...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PostCard;