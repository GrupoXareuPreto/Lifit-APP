import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { useUser } from "@/contexts/UserContext"
import { Ionicons } from "@expo/vector-icons"
import api from "@/config/axiosConfig"
import { router } from "expo-router"
import React, { useState } from "react"
import { Alert, Image, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from "./styles"

export default function Index(){
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [login, setLogin] = useState("")
    const [senha, setSenha] = useState("")
    const { setUserData, setToken } = useUser();

    function handleNext(){
        router.navigate("/createLoginPage")
    }

    async function handleLogin(testCredentials?: { nomeUsuarioEmail: string; senha: string }){
        try {
            const dadosLogin = testCredentials || { 
                nomeUsuarioEmail: login, 
                senha: senha 
            }
            
            console.log('1. Tentando fazer login com:', dadosLogin.nomeUsuarioEmail);
            // 1. Faz login e recebe o token
            const loginResponse = await api.post('auth/login', dadosLogin)
            console.log('2. Login response status:', loginResponse.status);
            console.log('2.1 Response data:', loginResponse.data);

            if(loginResponse.status === 200 && loginResponse.data.token){
                const receivedToken = loginResponse.data.token;
                console.log('3. Token recebido:', receivedToken.substring(0, 30) + '...');
                
                // 2. Salva o token
                await setToken(receivedToken);
                console.log('4. Token salvo no AsyncStorage');
                
                // Aguarda um pouco para garantir que o AsyncStorage salvou
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 3. Decodifica o token para extrair o email
                const tokenParts = receivedToken.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                const userEmail = payload.sub;
                console.log('5. Email extraído do token:', userEmail);
                
                // 4. Busca os dados do usuário pelo email usando endpoint público
                console.log('6. Buscando dados do usuário pelo email...');
                const { apiAZURE } = await import('@/config/cloudinaryConfig');
                const userResponse = await fetch(`${apiAZURE}usuario/email/${encodeURIComponent(userEmail)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('7. User response status:', userResponse.status);
                
                if(userResponse.status === 200){
                    const userData = await userResponse.json();
                    console.log('8. Dados do usuário recebidos:', userData.nome);
                    setUserData(userData);
                    router.replace("/(tabs)");
                } else if(userResponse.status === 404) {
                    console.error('Usuário não encontrado no banco de dados');
                    Alert.alert("Erro", "Usuário não encontrado. Por favor, crie uma conta primeiro.")
                } else {
                    const errorText = await userResponse.text();
                    console.error('Erro ao buscar usuário:', errorText);
                    Alert.alert("Erro", "Não foi possível carregar os dados do usuário")
                }
            } else {
                Alert.alert("Erro", "Dados inválidos")
            }
        } catch (error: any) {
            console.error('ERRO DETALHADO:', error);
            console.error('Status do erro:', error.response?.status);
            console.error('Dados do erro:', error.response?.data);
            console.error('Config da requisição:', error.config?.url);
            console.error('Headers da requisição:', error.config?.headers);
            
            if(error.response?.status === 404 || error.response?.status === 401){
                Alert.alert("Erro", "Dados inválidos")
            } else if(error.response?.status === 403){
                Alert.alert("Erro", `Acesso negado (403). URL: ${error.config?.url}`)
            } else {
                console.error(error)
                Alert.alert("Erro", "Não foi possível fazer o login.")
            }
        }
    }

    function handleTestLogin(){
        handleLogin({
            nomeUsuarioEmail: "teste3@gmail.com",
            senha: "teste3"
        });
    }

    function handleTestLogin2(){
        handleLogin({
            nomeUsuarioEmail: "teste4@gmail.com",
            senha: "teste4"
        });
    }
    
    return(
        <SafeAreaView style={styles.page}>
                            <TouchableOpacity 
                                onPress={handleTestLogin}
                                style={{ position: 'absolute', top: 40, right: 10, backgroundColor: '#FF6B6B', padding: 10, borderRadius: 5, zIndex: 999 }}
                            >
                                <Ionicons name="flask" size={20} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleTestLogin2}
                                style={{ position: 'absolute', top: 90, right: 10, backgroundColor: '#2326ffff', padding: 10, borderRadius: 5, zIndex: 999 }}
                            >
                                <Ionicons name="flask" size={20} color="white" />
                            </TouchableOpacity>

                            <View style={[styles.container, { marginBottom: 60, marginTop: -70 }]}>
                                <Image source={require("@/assets/images/lifit-logo.png")}/>
                            </View>
                                    
                                <Input placeholder="Email" onChangeText={setLogin} value={login}/>

                            <View style={styles.senhacontainer}>
                                <Input placeholder="Senha" secureTextEntry={!senhaVisivel} onChangeText={setSenha} value={senha}  style={styles.senhaInput}/>

                                <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.eyeIcon}>
                                    <Ionicons name={senhaVisivel ? "eye" : "eye-off"} size={24} color="gray" />
                                </TouchableOpacity>
                            </View>
                            {/* <Button title="Esqueci minha senha" backgroundColor="#90E05E" textColor="#262626" onPress={() => Alert.alert("Funcionalidade não implementada")}/> */}

                            <View style={[styles.container, {marginTop: 50, marginBottom: -30}]}>
                                    <Button title="Login" onPress={() => handleLogin()} textColor="#FFFFFF"/>
                                    <Button title="Criar Conta" backgroundColor="#90E05E" onPress={handleNext} textColor="#262626"/>
                            </View>

        </SafeAreaView>
    )
}