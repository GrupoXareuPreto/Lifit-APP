import React from "react"
import { View , Text, StyleSheet} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import {styles} from "./styles"

export default function CreateLoginPage(){
    return(
        <View style={styles.container}>
            <Input placeholder="Nome Completo"/>
            <Input placeholder="Email"/>
            <Input placeholder="Senha"/>
            <Input placeholder="Confirmar Senha"/>
            <Input placeholder="Nome de Usuário"/>
            <Button title="Voltar" onPress={() => router.back()} style={styles.btn} textColor="#FFFFFF"/>
        </View>
    )
}


