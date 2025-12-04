import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { cloudinaryConfig } from '@/config/cloudinaryConfig';
import { useUser } from '@/contexts/UserContext';
import api from '@/config/axiosConfig';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#2B3C45" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Postagem</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {resolvedUri && (
                    <Image 
                        source={{ uri: resolvedUri }} 
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Título *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Título da postagem"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Descreva sua postagem..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.publishButton}
                    onPress={handlePost}
                >
                    <Text style={styles.publishButtonText}>Publicar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B3C45',
    },
    content: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#F5F5F5',
    },
    form: {
        padding: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B3C45',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#2B3C45',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    publishButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    publishButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
