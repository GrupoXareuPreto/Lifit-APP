import { useUser } from '@/contexts/UserContext';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Perfil() {
  const { userData } = useUser();

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  const eventosPostadosCount = (userData.eventosCriados?.length || 0) + (userData.postagens?.length || 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Image
              source={require('@/assets/images/AndrePai.jpg')} // Placeholder image
              style={styles.profileImage}
            />
            <View style={styles.headerInfo}>
                <Text style={styles.name}>{userData.nome}</Text>
                <Text style={styles.username}>{userData.nomeUsuario}</Text>
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

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Metas</Text>
          <View style={styles.devContainer}>
            <Text style={styles.devText}>Em desenvolvimento</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Eventos postados</Text>
          <FlatList
            data={userData.postagens}
            renderItem={({ item }) => (
              <Image source={{ uri: item.midia }} style={styles.postImage} />
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.postsGrid}
            ListEmptyComponent={<Text style={styles.devText}>Nenhuma postagem encontrada.</Text>}
            scrollEnabled={false} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
        margin: '0.66%',
    },
});
