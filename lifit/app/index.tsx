import React, {useState} from "react"
import { View , Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Alert} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import {styles} from "./styles"
import { Ionicons } from "@expo/vector-icons";
import  NotificationItem  from "@/app/notificacoes";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import axios from "axios"

export default function Index(){
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [login, setLogin] = useState("")
    const [senha, setSenha] = useState("")

    function handleNext(){
        router.navigate("/createLoginPage")
    }

    async function handleLogin(){
        try {
            const response = await axios.get(`http://localhost:8080/usuario/${login}/${senha}`)

            if(response.status === 200){
                router.navigate("/homePage")
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

    function testePagInicial(){
        router.navigate("/homePage")
    }
    return(

        <KeyboardAvoidingView 
                    style={[{ flex: 1 }]}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={80} 
                    contentContainerStyle={styles.scrollContainer}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                    {/* 2. ScrollView permite que o conteúdo role em telas pequenas */}
                    <ScrollView 
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled" // Garante que o toque em botões funcione com o teclado aberto
                    >

                        {/* 3. TouchableWithoutFeedback para fechar o teclado ao tocar fora */}
                        

                        <View style={styles.page}>

                            <View style={[styles.container, , { marginBottom: 68 }]}>
                                <Image source={require("@/assets/images/lifit-logo.png")}/> 
                            </View>
                                    

                            <View style={styles.container}>
                                <Input placeholder="Email / Nome de Usuário" onChangeText={setLogin} value={login}/>
                                <Input placeholder="Senha" secureTextEntry={!senhaVisivel} onChangeText={setSenha} value={senha}/>
                            </View>

                            <View style={styles.container}>
                                    <Button title="Login" onPress={handleLogin} textColor="#FFFFFF"/>
                                    <Button title="Criar Conta" backgroundColor="#90E05E" onPress={handleNext} textColor="#262626"/>
                                    <Button title="Teste pagInicial" textColor="tomato" onPress={testePagInicial}/>
                                <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
                                    <Ionicons
                                        name={senhaVisivel ? "eye" : "eye-off"}
                                        size={22}
                                        color="#555"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
                    
        </KeyboardAvoidingView>
    )
}


