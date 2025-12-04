import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from "./style";
import Toast from 'react-native-toast-message';
import api from '@/config/axiosConfig';
import CommentsBottomSheet from '../CommentsBottomSheet';

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
  id: number;
  idPostagem: number;
  usuarioId: number;
  avatarUrl: string;
  userName: string;
  userHandle: string;
  postImageUrl: string;
  description?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  usuarioCurtiu: boolean;
  event?: PostEvent;
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const router = useRouter();
  const [liked, setLiked] = useState(post.usuarioCurtiu);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const handleUserProfile = () => {
    console.log('Navegando para perfil - usuarioId:', post.usuarioId, 'userHandle:', post.userHandle);
    router.push(`/userProfile/${post.usuarioId}?nomeUsuario=${encodeURIComponent(post.userHandle.replace('@', ''))}` as any);
  };

  // Função para curtir/descurtir
  const handleLike = async () => {
    try {
      if (liked) {
        // Descurtir
        await api.delete(`/curtida/postagem/${post.idPostagem}`);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Curtir
        await api.post('/curtida', { postagemId: post.idPostagem });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
      
      // Recarrega o feed se callback fornecido
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao processar curtida',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };
  const handleComment = () => {
    setCommentsVisible(true);
  };

  const handleCommentAdded = () => {
    if (onUpdate) {
      onUpdate();
    }
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
      <TouchableOpacity style={styles.header} onPress={handleUserProfile} activeOpacity={0.7}>
        <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.userHandle}>{post.userHandle}</Text>
        </View>
      </TouchableOpacity>

      {/* Imagem do Post */}
      <Image source={{ uri: post.postImageUrl }} style={styles.postImage} />

      {/* Descrição do Post */}
      {post.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{post.description}</Text>
        </View>
      )}

      {/* Barra de Ações */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <FontAwesome 
            name={liked ? "thumbs-up" : "thumbs-o-up"} 
            size={20} 
            color={liked ? "#4CD964" : "gray"} 
          />
          <Text style={[styles.actionText, liked && { color: '#4CD964' }]}>
            {formatNumber(likeCount)}
          </Text>
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

      {/* Bottom Sheet de Comentários */}
      <CommentsBottomSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        postagemId={post.idPostagem}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
};

export default PostCard;