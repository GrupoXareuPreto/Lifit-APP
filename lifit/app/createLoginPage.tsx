import React, {useState} from "react"
import { View , Text, StyleSheet, TextInput} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import {styles} from "./styles"

export default function CreateLoginPage(){
    const [senhaVisivel, setSenhaVisivel] = useState(false);

    return(
        <View style={styles.page}>
            <View style={[styles.container, {gap:32,}]}>
                <Input placeholder="Nome Completo"/>
                <Input placeholder="Email"/>
                <Input placeholder="Senha"/>
                <Input placeholder="Confirmar Senha"/>
                <Input placeholder="Nome de Usuário"/>
            </View>
            
            <View style={styles.container}>
               <Button title="Voltar" onPress={() => router.back()} backgroundColor="#2B3C45" textColor="#FFFFFF"/> 
            </View>
            
        </View>
    )
}


