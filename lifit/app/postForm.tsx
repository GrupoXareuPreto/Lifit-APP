import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { cloudinaryConfig } from '@/config/cloudinaryConfig';
import { useUser } from '@/contexts/UserContext';
import api from '@/config/axiosConfig';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Cloudinary } from "@cloudinary/url-gen";
import { upload } from 'cloudinary-react-native';

export default function PostForm() {
    const params = useLocalSearchParams();
    const rawImageParam = (params?.imageUri as unknown) as string | string[] | undefined;
    const selectedImageParam = Array.isArray(rawImageParam) ? rawImageParam[0] : rawImageParam;
    const previewUri = selectedImageParam ? decodeURIComponent(selectedImageParam) : undefined;
    const [resolvedUri, setResolvedUri] = useState<string | undefined>(undefined);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { userData } = useUser();
    
    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (!previewUri) {
                if (isMounted) setResolvedUri(undefined);
                return;
            }

            try {
                let uri = previewUri.trim().replace(/^"|"$/g, '');
                if (uri.startsWith('file:/') && !uri.startsWith('file:///')) {
                    uri = uri.replace(/^file:\/+/, 'file:///');
                }

                if (uri.startsWith('content://')) {
                    const dest = FileSystem.cacheDirectory + `upload_${Date.now()}.jpg`;
                    try {
                        await FileSystem.copyAsync({ from: uri, to: dest });
                        uri = dest;
                    } catch (e) {
                        console.warn('Falha ao copiar content URI para cache:', e);
                    }
                }

                if (isMounted) setResolvedUri(uri);
            } catch (e) {
                console.warn('Falha ao normalizar URI da imagem:', e);
                if (isMounted) setResolvedUri(previewUri);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [previewUri]);

    const uploadImage = async (uri: string) => {
        console.log('Configuração do Cloudinary:', cloudinaryConfig);
        const cld = new Cloudinary({
            cloud: { 
                cloudName: cloudinaryConfig.cloudName,
                apiKey: cloudinaryConfig.apiKey,
                apiSecret: cloudinaryConfig.apiSecret
            },
            url: { 
                secure: true
            }
        });

        const options = {
            upload_preset: 'TesteLifit',
            unsigned: true,
        }

        try {
            const response = await upload(cld, {
                file: previewUri, 
                options: options, 
                callback: async (error: any, uploadResponse: any) => {
                    if (error) {
                        console.log("Erro no upload:", error);
                        Alert.alert("Erro", "Falha ao fazer upload da imagem.");
                        return;
                    }
                    
                    console.log("Upload bem-sucedido:", uploadResponse);
                    
                    if (uploadResponse?.secure_url) {
                        // Enviar postagem para a API
                        try {
                            const postData = {
                                midia: uploadResponse.secure_url,
                                titulo: title,
                                descricao: description
                            };

                            console.log("Enviando postagem para API:", postData);
                            const apiResponse = await api.post('postagens', postData);
                            
                            if (apiResponse.status === 201 || apiResponse.status === 200) {
                                Alert.alert("Sucesso", "Postagem criada com sucesso!");
                                router.replace("/(tabs)");
                            } else {
                                Alert.alert("Erro", "Não foi possível criar a postagem.");
                            }
                        } catch (apiError: any) {
                            console.error("Erro ao enviar postagem:", apiError);
                            console.error("Status:", apiError.response?.status);
                            console.error("Mensagem:", apiError.response?.data);
                            Alert.alert("Erro", "Ocorreu um erro ao criar a postagem.");
                        }
                    }
                }    
            });
        } catch (error) {
            console.error('Erro detalhado ao fazer upload da imagem:', error);
            Alert.alert("Erro", "Ocorreu um erro de rede ao fazer upload da imagem.");
            return null;
        }
    };

    const handlePost = async () => {
        console.log("previewUri", previewUri)
        
        if (!userData) {
            Alert.alert("Erro", "Você precisa estar logado para postar.");
            return;
        }

        if (!title || !description) {
            Alert.alert("Erro", "Por favor, preencha o título e a descrição.");
            return;
        }

        if (!resolvedUri) {
            Alert.alert("Erro", "Por favor, selecione uma imagem.");
            return;
        }

        // Faz upload da imagem e envia o post
        await uploadImage(resolvedUri);
    };

    return (
        <View style={styles.container}>
            {resolvedUri ? (
                <Image
                    source={{ uri: resolvedUri }}
                    style={styles.image}
                    onError={(e) => console.warn('Falha ao exibir imagem de preview:', e.nativeEvent)}
                />
            ) : null}
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
