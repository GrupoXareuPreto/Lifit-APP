import React from "react"
import { View , Text, StyleSheet, Image} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import {styles} from "./styles"

export default function SearchPage(){
    return(
        <Image source={require("@/assets/images/AndrePai.jpg")}></Image>
    )
}