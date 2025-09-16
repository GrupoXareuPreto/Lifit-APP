import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { apiAZURE, cloudinaryConfig } from '@/config/cloudinaryConfig';
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
    const API = apiAZURE;
    

    const uploadImage = async (uri: string) => {
        console.log('Configuração do Cloudinary:', cloudinaryConfig);
        const formData = new FormData();
        formData.append('file', {
            uri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        } as any);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset as string);
        

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            if (response.ok) {
                return data.secure_url;
            } else {
                console.error('Erro na resposta do Cloudinary:', data);
                Alert.alert("Erro", `Ocorreu um erro no upload: ${data.error.message}`);
                return null;
            }
        } catch (error) {
            console.error('Erro detalhado ao fazer upload da imagem:', error);
            Alert.alert("Erro", "Ocorreu um erro de rede ao fazer upload da imagem.");
            return null;
        }
    };

    const handlePost = async () => {
        if (!userData) {
            Alert.alert("Erro", "Você precisa estar logado para postar.");
            return;
        }

        if (!title || !description) {
            Alert.alert("Erro", "Por favor, preencha o título e a descrição.");
            return;
        }

        let imageUrl = "https://tse1.mm.bing.net/th/id/OIP.9Ks3otCnYxLp9XUmxruyQgHaD7?rs=1&pid=ImgDetMain&o=7&rm=3";
        if (imageUri) {
            const uploadedUrl = await uploadImage(imageUri);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            } else {
                return; 
            }
        }

        const postData = {
            titulo: title,
            midia: imageUrl,
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
                router.replace("/(tabs)");
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
