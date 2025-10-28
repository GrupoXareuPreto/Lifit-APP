import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeableScreen from '@/components/SwipeableScreen';
import { useRouter } from 'expo-router';

export default function Conversas() {
  const router = useRouter();
type Contato = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
};

const contatos: Contato[] = [
  {
    id: '1',
    name: 'Lucas Andrade',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'online',
  },
  {
    id: '2',
    name: 'Maria Souza',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    status: 'offline',
  },
  {
    id: '3',
    name: 'Thiago Santos',
    avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
    status: 'online',
  },
  {
    id: '4',
    name: 'Ana Beatriz',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    status: 'offline',
  },
];

const IrChat = () => {
  router.push('/chat');
};

  return (
    <SwipeableScreen currentScreen="conversas">
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          <Text style={styles.title}>Contatos</Text>
          <FlatList
            data={contatos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.contactItem} onPress={IrChat}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={[styles.status, item.status === 'online' ? styles.online : styles.offline]}>
                    {item.status === 'online' ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </SwipeableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    margin: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 13,
    marginTop: 4,
  },
  online: {
    color: '#2ecc71',
  },
  offline: {
    color: '#bdc3c7',
  },
});
