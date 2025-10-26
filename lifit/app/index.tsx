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
            
            // 1. Faz login e recebe o token
            const loginResponse = await api.post('auth/login', dadosLogin)

            if(loginResponse.status === 200 && loginResponse.data.token){
                const receivedToken = loginResponse.data.token;
                
                // 2. Salva o token
                await setToken(receivedToken);
                
                // 3. Busca os dados do usuário usando o token
                const userResponse = await api.get('usuario/me');
                
                if(userResponse.status === 200){
                    setUserData(userResponse.data);
                    router.replace("/(tabs)");
                } else {
                    Alert.alert("Erro", "Não foi possível carregar os dados do usuário")
                }
            } else {
                Alert.alert("Erro", "Dados inválidos")
            }
        } catch (error: any) {
            if(error.response?.status === 404 || error.response?.status === 401){
                Alert.alert("Erro", "Dados inválidos")
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
            nomeUsuarioEmail: "teste$@gmail.com",
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
                            <Button title="Esqueci minha senha" backgroundColor="#90E05E" textColor="#262626" onPress={() => Alert.alert("Funcionalidade não implementada")}/>

                            <View style={[styles.container, {marginTop: 50, marginBottom: -30}]}>
                                    <Button title="Login" onPress={() => handleLogin()} textColor="#FFFFFF"/>
                                    <Button title="Criar Conta" backgroundColor="#90E05E" onPress={handleNext} textColor="#262626"/>
                            </View>

        </SafeAreaView>
    )
}