import React from "react"
import { View , Text, StyleSheet, Image} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import {styles} from "./styles"

export default function Index(){
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
        <View style={styles.page}>

            <View style={[styles.container, , { marginBottom: 100 }]}>
               <Image source={require("@/assets/images/lifit-logo.png")}/> 
            </View>
            

            <View style={styles.container}>
                <Input placeholder="Email / Nome de Usuário"/>
                <Input placeholder="Senha"/>
            </View>

            <View style={styles.container}>
                <Button title="Login" style={styles.btn} onPress={nextHomePage} textColor="#FFFFFF"/>
                <Button title="Criar Conta" style={styles.btnCriarConta} onPress={handleNext} textColor="#262626"/>
                <Button title="Teste pagInicial" style={styles.btn} textColor="tomato" onPress={testePagInicial}/>
            </View>
            
        </View>
    )
}


