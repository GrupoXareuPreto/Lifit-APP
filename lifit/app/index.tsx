import React, {useState} from "react"
import { View , Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import {styles} from "./styles"
import { Ionicons } from "@expo/vector-icons";
import  NotificationItem  from "@/app/notificacoes";

export default function Index(){
    const [senhaVisivel, setSenhaVisivel] = useState(false);

    function handleNext(){
        router.navigate("/createLoginPage")
    }

    function nextHomePage(){
        router.navigate("/homePage")
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
                                <Input placeholder="Email / Nome de Usuário"/>
                                <Input placeholder="Senha" secureTextEntry={!senhaVisivel} />
                            </View>

                            <View style={styles.container}>
                                    <Button title="Login" onPress={nextHomePage} textColor="#FFFFFF"/>
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


