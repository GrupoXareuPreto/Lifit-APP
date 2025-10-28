import { useUser } from '@/contexts/UserContext';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeableScreen from '@/components/SwipeableScreen';
import { Ionicons } from '@expo/vector-icons';
import Icon from '@expo/vector-icons/Feather';

export default function Perfil() {
  const { userData } = useUser();

  {/* Metas padrão só para exibir algo, como um pavão*/}
  const metas = [
    { id: '1', titulo: '120kg 💪🏼', data: '12 de Novembro de 2025', feita: true },
    { id: '2', titulo: 'Ganhar no Fut do fim do Ano', data: '17 de Janeiro de 2025', feita: false },
    { id: '3', titulo: 'Zerar academia de casa', data: '06 de Setembro de 2024', feita: true },
  ];

  {/* Eventos padrão só para exibir algo, como um pavão*/}
  const eventos = [
    { id: '1', titulo: 'Treino de Peito', imagem: 'https://imgs.search.brave.com/haOpIIq0F642KfxxzZdTXG2X3Em2bhHFIKYFSbJSYW4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/emlvYmVyYnJhc2ls/LmNvbS5ici9ibG9n/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIx/LzEwLzQwMmUwMDRm/LTYxYzgtNDQ1Mi05/ZDQ1LThkMmZjN2Ex/YmY4MS01NDJ4NDEw/LmpwZw' },
    { id: '2', titulo: 'Corrida na Praia', imagem: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1' },
    { id: '3', titulo: 'Aula de Yoga', imagem: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa' },
  ];


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
        <View style={styles.header}>
            <Image
              source={userData.fotoPerfil ? { uri: userData.fotoPerfil } : require('@/assets/images/AndrePai.jpg')} // Placeholder image
              style={styles.profileImage}
            />
            <View style={styles.headerInfo}>
                <Text style={styles.name}>{userData.nome}</Text>
                <Text style={styles.username}>{"@" + userData.nomeUsuario}</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{userData.seguidores?.length || 0}</Text>
                        <Text style={styles.statLabel}>Seguidores</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{eventosPostadosCount}</Text>
                        <Text style={styles.statLabel}>Eventos postados</Text>
                    </View>
                </View>
            </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.bioText}>{userData.biografia || 'Nenhuma biografia disponível.'}</Text>
        </View>

        {/* Metas */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Metas</Text>

          {metas.map((meta) => (
            <View key={meta.id} style={styles.metaItem}>
              <View>
                <Text style={styles.metaTitle}>{meta.titulo}</Text>
                <Text style={styles.metaDate}>{meta.data}</Text>
              </View>
              {meta.feita ? (
                <Ionicons name='checkmark-circle' size={33} color="#4CD964" />
              ) : (
                <Ionicons name="ellipse-outline" size={33} color="#ccc" />
              )}
            </View>
            ))}
        </View>

        {/* Eventos Postados */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Eventos Postados</Text>
          
          <FlatList
            data={eventos}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventListContainer}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <Image source={{ uri: item.imagem }} style={styles.eventImage} />
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {item.titulo}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Postagens */}
        <View style={styles.postagensContainer}>
          <Text style={styles.postagensTitle}>Postagens</Text>
          <FlatList
            data={userData.postagens}
            renderItem={({ item }) => (
              <Image source={{ uri: item.midia }} style={styles.postImage} />
            )}
            //keyExtractor={(item) => item.id.toString()}
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
