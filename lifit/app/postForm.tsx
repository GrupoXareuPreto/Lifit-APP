import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

export default function PostForm() {
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { userData } = useUser();
    const API = "https://lifit-augfbubbgtcydahz.brazilsouth-01.azurewebsites.net/";

    const handlePost = async () => {
        if (!userData) {
            Alert.alert("Erro", "Você precisa estar logado para postar.");
            return;
        }

        if (!title || !description) {
            Alert.alert("Erro", "Por favor, preencha o título e a descrição.");
            return;
        }

        const postData = {
            titulo: title,
            midia: "https://tse1.mm.bing.net/th/id/OIP.9Ks3otCnYxLp9XUmxruyQgHaD7?rs=1&pid=ImgDetMain&o=7&rm=3",
            autor: {
                id: userData.id,
                nome: userData.nome,
                biografia: userData.biografia,
                email: userData.email,
                senha: userData.senha,
                nomeUsuario: userData.nomeUsuario
            },
            descricao: description
        };

        try {
            const response = await axios.post(`${API}/postagem`, postData);
            if (response.status === 201 || response.status === 200) {
                Alert.alert("Sucesso", "Postagem criada com sucesso!");
                router.navigate("/homePage");
            } else {
                Alert.alert("Erro", "Não foi possível criar a postagem.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Ocorreu um erro ao criar a postagem.");
        }
    };

    return (
        <View style={styles.container}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
            <View style={styles.inputContainer}>
                <Input placeholder="Título" value={title} onChangeText={setTitle} />
                <Input placeholder="Descrição" value={description} onChangeText={setDescription} />
            </View>
            <Button title="Postar" onPress={handlePost} backgroundColor="#2B3C45" textColor="#FFFFFF" />
            <Button title="Voltar" onPress={() => router.back()} backgroundColor="#2B3C45" textColor="#FFFFFF" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0f2f5',
        gap: 16,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        gap: 16,
    }
});
