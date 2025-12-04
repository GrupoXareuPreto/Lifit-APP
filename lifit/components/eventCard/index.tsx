import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import api from '@/config/axiosConfig';
import CommentsBottomSheet from '../CommentsBottomSheet';

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0).replace('.', ',') + ' mil';
  }
  return num;
};

interface Participante {
  id: number;
  nome: string;
  nomeUsuario: string;
  fotoPerfil: string;
}

interface Autor {
  fotoPerfil: string | null;
  nome: string;
  nomeUsuario: string;
}

interface EventoData {
  id: number;
  titulo: string;
  descricao: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  autor: Autor;
  midia: string;
  numCurtidas: number;
  numComentarios: number;
  numCompartilhamentos: number;
  numParticipantes: number;
  participantes: Participante[];
  usuarioConfirmado: boolean;
  usuarioCurtiu: boolean;
}

interface EventCardProps {
  evento: EventoData;
  onPresencaToggle?: (eventoId: number, confirmado: boolean) => void;
  onUpdate?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ evento, onPresencaToggle, onUpdate }) => {
  const router = useRouter();
  const [liked, setLiked] = useState(evento.usuarioCurtiu);
  const [likeCount, setLikeCount] = useState(evento.numCurtidas);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatarHorario = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const calcularDiasAteEvento = (dataInicio: string) => {
    const hoje = new Date();
    const dataEvento = new Date(dataInicio);
    const diffTime = dataEvento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'HOJE';
    if (diffDays === 1) return 'AMANHÃ';
    if (diffDays < 0) return `HÁ ${Math.abs(diffDays)} DIAS`;
    return `EM ${diffDays} DIAS`;
  };

  const handlePresencaToggle = async () => {
    try {
      if (evento.usuarioConfirmado) {
        await api.delete(`/evento/${evento.id}/confirmar`);
      } else {
        await api.post(`/evento/${evento.id}/confirmar`);
      }
      onPresencaToggle?.(evento.id, !evento.usuarioConfirmado);
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/curtida/evento/${evento.id}`);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await api.post('/curtida', { eventoId: evento.id });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Erro ao curtir/descurtir evento:', error);
      console.error('Response completa:', error.response);
      Toast.show({
        type: 'error',
        text1: 'Erro ao processar curtida',
        text2: 'Verifique sua conexão e tente novamente',
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

  const handleCardPress = () => {
    // Implementar navegação para detalhes do evento
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image 
          source={{ uri: evento.autor.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(evento.autor.nome) + '&background=4CD964&color=fff&size=200' }} 
          style={styles.avatar} 
        />
        <View>
          <Text style={styles.userName}>{evento.autor.nome}</Text>
          <Text style={styles.userHandle}>@{evento.autor.nomeUsuario}</Text>
        </View>
      </View>

      {/* Imagem do Evento */}
      <TouchableOpacity onPress={handleCardPress}>
        <Image source={{ uri: evento.midia }} style={styles.eventImage} />
      </TouchableOpacity>

      {/* Informações do Evento */}
      <View style={styles.infoContainer}>
        <Text style={styles.eventTitle}>{evento.titulo}</Text>
        <Text style={styles.eventDate}>
          {formatarData(evento.dataInicio)} | {formatarHorario(evento.dataInicio, evento.dataFim)}
        </Text>
      </View>

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
          <Text style={styles.actionText}>{formatNumber(evento.numComentarios)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <FontAwesome name="share" size={20} color="gray" />
          <Text style={styles.actionText}>{formatNumber(evento.numCompartilhamentos)}</Text>
        </TouchableOpacity>

        <Text style={styles.timestamp}>{calcularDiasAteEvento(evento.dataInicio)}</Text>
      </View>

      {/* Participantes */}
      {evento.numParticipantes > 0 && (
        <View style={styles.participantesContainer}>
          <View style={styles.avatarsContainer}>
            {evento.participantes.slice(0, 3).map((participante, index) => (
              <Image
                key={participante.id}
                source={{ uri: participante.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(participante.nomeUsuario) + '&background=4CD964&color=fff&size=200' }}
                style={[styles.participanteAvatar, { marginLeft: index > 0 ? -10 : 0 }]}
              />
            ))}
          </View>
          <Text style={styles.participantesText}>
            Curtido por {evento.participantes[0]?.nomeUsuario || 'pessoas'}
            {evento.numParticipantes > 1 && ` e outros ${evento.numParticipantes - 1}`}...
          </Text>
        </View>
      )}

      {/* Botão Presença Confirmada */}
      <TouchableOpacity
        style={[styles.confirmButton, evento.usuarioConfirmado && styles.confirmButtonActive]}
        onPress={handlePresencaToggle}
      >
        <Text style={[styles.confirmButtonText, evento.usuarioConfirmado && styles.confirmButtonTextActive]}>
          Presença confirmada
        </Text>
        {evento.usuarioConfirmado ? (
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
        ) : (
          <Ionicons name="close-circle" size={20} color="#999" style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>

      {/* Bottom Sheet de Comentários */}
      <CommentsBottomSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        eventoId={evento.id}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  userHandle: {
    fontSize: 14,
    color: '#888',
  },
  eventImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  participantesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  participanteAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantesText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  confirmButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonActive: {
    backgroundColor: '#4CD964',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonTextActive: {
    color: '#fff',
  },
});

export default EventCard;
