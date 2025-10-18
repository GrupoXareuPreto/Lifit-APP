import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { useUser } from "@/contexts/UserContext"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { router } from "expo-router"
import React, { useState } from "react"
import { Alert, Image, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from "./styles"
import { apiAZURE } from "@/config/cloudinaryConfig"

export default function Index(){
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [login, setLogin] = useState("")
    const [senha, setSenha] = useState("")
    const { setUserData } = useUser();
    const API=apiAZURE

    function handleNext(){
        router.navigate("/createLoginPage")
    }

    async function handleLogin(){
        try {
            const dadosLogin = { 
                nomeUsuario: login, 
                senha: senha }
            const response = await axios.post(`${API}/usuario/autenticar`, dadosLogin)

            if(response.status === 200){
                setUserData(response.data);
                router.replace("/(tabs)");
            }else{
                Alert.alert("Erro", "Dados inválidos")
            }
        } catch (error) {
            if(axios.isAxiosError(error) && error.response?.status === 404){
                Alert.alert("Erro", "Dados inválidos")
            } else {
                console.error(error)
                Alert.alert("Erro", "Não foi possível fazer o login.")
            }
        }
    }

    
    return(
        <SafeAreaView style={styles.page}>

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
                                    <Button title="Login" onPress={handleLogin} textColor="#FFFFFF"/>
                                    <Button title="Criar Conta" backgroundColor="#90E05E" onPress={handleNext} textColor="#262626"/>
                            </View>

        </SafeAreaView>
    )
}