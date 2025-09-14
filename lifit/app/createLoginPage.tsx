import { Button } from "@/components/button"
import { Input } from "@/components/input"
import axios from "axios"
import { router } from "expo-router"
import React, { useState } from "react"
import { Alert, View } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from "./styles"

export default function CreateLoginPage(){
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [nomeUsuario, setNomeUsuario] = useState("")
    const API="https://lifit-augfbubbgtcydahz.brazilsouth-01.azurewebsites.net/"

    async function handleCreateAccount(){
        if(senha !== confirmarSenha){
            Alert.alert("Erro", "As senhas não coincidem")
            return
        }

        try {
            const response = await axios.post(API+"/usuario", {
                nome,
                biografia: "Biografia padrão",
                email,
                senha,
                nomeUsuario
            })
            console.log(response)
            if(response.status === 200 || response.status === 201){
                Alert.alert("Sucesso", "Conta criada com sucesso!")
                router.navigate("/")
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Erro", "Não foi possível criar a conta.")
        }
    }

    return(
        <SafeAreaView style={styles.page}>
            <View style={[styles.container, {gap:32,}]}>
                <Input placeholder="Nome Completo" onChangeText={setNome} value={nome}/>
                <Input placeholder="Email" onChangeText={setEmail} value={email}/>
                <Input placeholder="Senha" secureTextEntry={true} onChangeText={setSenha} value={senha}/>
                <Input placeholder="Confirmar Senha" secureTextEntry={true} onChangeText={setConfirmarSenha} value={confirmarSenha}/>
                <Input placeholder="Nome de Usuário" onChangeText={setNomeUsuario} value={nomeUsuario}/>
            </View>
            
            <View style={styles.container}>
                <Button title="Criar Conta" onPress={handleCreateAccount} backgroundColor="#2B3C45" textColor="#FFFFFF"/> 
               <Button title="Voltar" onPress={() => router.back()} backgroundColor="#2B3C45" textColor="#FFFFFF"/> 
            </View>
            
        </SafeAreaView>
    )
}


