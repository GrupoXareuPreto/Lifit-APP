import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/config/axiosConfig';

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

interface EventoDetalhes {
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
}

export default function EventoDetalhes() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [evento, setEvento] = useState<EventoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEvento();
  }, [id]);

  const carregarEvento = async () => {
    try {
      setLoading(true);
      console.log('Carregando evento ID:', id);
      const response = await api.get(`/evento/${id}`);
      console.log('Evento carregado com sucesso:', response.data.titulo);
      setEvento(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar evento:', error);
      console.error('Status:', error.response?.status);
      console.error('Mensagem:', error.response?.data);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do evento. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresencaToggle = async () => {
    if (!evento) return;

    try {
      if (evento.usuarioConfirmado) {
        await api.delete(`/evento/${evento.id}/confirmar`);
      } else {
        await api.post(`/evento/${evento.id}/confirmar`);
      }
      // Recarrega evento para atualizar dados
      carregarEvento();
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      Alert.alert('Erro', 'Não foi possível confirmar presença.');
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long' 
    });
  };

  const formatarHorario = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CD964" />
        </View>
      </SafeAreaView>
    );
  }

  if (!evento) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Evento não encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Verde com Presença Confirmada */}
      <View style={[styles.header, evento.usuarioConfirmado && styles.headerConfirmado]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={28} color={evento.usuarioConfirmado ? '#fff' : '#222'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, evento.usuarioConfirmado && styles.headerTitleConfirmado]}>
          Evento
        </Text>
        {evento.usuarioConfirmado && (
          <View style={styles.confirmadoBadge}>
            <Text style={styles.confirmadoText}>Presença confirmada</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Imagem do Evento */}
        <Image source={{ uri: evento.midia }} style={styles.eventoImage} />

        {/* Barra de Ações */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="thumbs-o-up" size={22} color="#666" />
            <Text style={styles.actionText}>{evento.numCurtidas} mil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="comment-o" size={22} color="#666" />
            <Text style={styles.actionText}>{evento.numComentarios} mil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="share" size={22} color="#666" />
            <Text style={styles.actionText}>{evento.numCompartilhamentos}</Text>
          </TouchableOpacity>

          <View style={styles.actionItem}>
            <Text style={styles.daysText}>HÁ 5 DIAS</Text>
          </View>
        </View>

        {/* Participantes */}
        {evento.numParticipantes > 0 && (
          <View style={styles.participantesPreview}>
            <View style={styles.avatarsRow}>
              {evento.participantes.slice(0, 3).map((participante, index) => (
                <Image
                  key={participante.id}
                  source={{ uri: participante.fotoPerfil || 'https://i.imgur.com/Qk9RNAB.png' }}
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

        {/* Dados do Evento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do evento</Text>
          
          <View style={styles.dadosRow}>
            <View style={styles.dadoItem}>
              <Text style={styles.dadoLabel}>Data</Text>
              <Text style={styles.dadoValue}>
                {formatarData(evento.dataInicio)}
              </Text>
              <Text style={styles.dadoSubvalue}>(Sábado)</Text>
            </View>

            <View style={styles.dadoItem}>
              <Text style={styles.dadoLabel}>Horário</Text>
              <Text style={styles.dadoValue}>
                {formatarHorario(evento.dataInicio)} - {formatarHorario(evento.dataFim)}
              </Text>
            </View>
          </View>

          <View style={styles.dadoFull}>
            <Text style={styles.dadoLabel}>Local</Text>
            <Text style={styles.dadoValue}>{evento.localizacao}</Text>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.descricaoHeader}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.descricaoText}>{evento.descricao}</Text>
        </View>

        {/* Confirmados */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.confirmadosHeader}>
            <Text style={styles.sectionTitle}>Confirmados {evento.numParticipantes}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {evento.participantes.map((participante) => (
            <View key={participante.id} style={styles.participanteItem}>
              <Image 
                source={{ uri: participante.fotoPerfil || 'https://i.imgur.com/Qk9RNAB.png' }} 
                style={styles.participanteItemAvatar} 
              />
              <View>
                <Text style={styles.participanteNome}>{participante.nome}</Text>
                <Text style={styles.participanteUsername}>@{participante.nomeUsuario}</Text>
              </View>
            </View>
          ))}

          {evento.numParticipantes > evento.participantes.length && (
            <TouchableOpacity style={styles.verMaisButton}>
              <Text style={styles.verMaisText}>Ver mais {evento.numParticipantes - evento.participantes.length} confirmados</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botão Confirmar Presença */}
        <TouchableOpacity
          style={[styles.confirmButton, evento.usuarioConfirmado && styles.confirmButtonActive]}
          onPress={handlePresencaToggle}
        >
          <Text style={[styles.confirmButtonText, evento.usuarioConfirmado && styles.confirmButtonTextActive]}>
            {evento.usuarioConfirmado ? 'Presença confirmada' : 'Confirmar presença'}
          </Text>
          {evento.usuarioConfirmado && (
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CD964',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerConfirmado: {
    backgroundColor: '#4CD964',
    borderBottomWidth: 0,
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 15,
  },
  headerTitleConfirmado: {
    color: '#fff',
  },
  confirmadoBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmadoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  scrollView: {
    flex: 1,
  },
  eventoImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  daysText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  participantesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarsRow: {
    flexDirection: 'row',
    marginRight: 12,
  },
  participanteAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantesText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  dadosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dadoItem: {
    flex: 1,
  },
  dadoFull: {
    marginTop: 10,
  },
  dadoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dadoValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  dadoSubvalue: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  descricaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  descricaoText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  confirmadosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  participanteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  participanteItemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  participanteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  participanteUsername: {
    fontSize: 14,
    color: '#888',
  },
  verMaisButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  verMaisText: {
    fontSize: 14,
    color: '#4CD964',
    fontWeight: '600',
  },
  confirmButton: {
    margin: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmButtonActive: {
    backgroundColor: '#4CD964',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  confirmButtonTextActive: {
    color: '#fff',
  },
});
