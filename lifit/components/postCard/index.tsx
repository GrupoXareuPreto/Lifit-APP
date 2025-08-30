import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Certifique-se de ter @expo/vector-icons instalado
import { styles } from "./style"

// Função para formatar números grandes (ex: 23000 -> 23 mil)
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0).replace('.', ',') + ' mil';
  }
  return num;
};

const PostCard = ({ post }) => {
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
        <View style={styles.action}>
          <FontAwesome name="thumbs-o-up" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(post.likes)}</Text>
        </View>
        <View style={styles.action}>
          <FontAwesome name="comment-o" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(post.comments)}</Text>
        </View>
        <View style={styles.action}>
          <FontAwesome name="share" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(post.shares)}</Text>
        </View>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>

      {/* Bloco de Evento (renderização condicional) */}
      {post.event && (
        <View style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{post.event.title}</Text>
          <Text style={styles.eventDetails}>{post.event.date}</Text>
          <Text style={styles.eventDetails}>{post.event.time}</Text>
          <View style={styles.likesContainer}>
            {/* Simulação das imagens de quem curtiu */}
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