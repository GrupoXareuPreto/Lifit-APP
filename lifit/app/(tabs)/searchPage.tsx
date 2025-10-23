import React from "react"
import { View , Text, StyleSheet, Image} from "react-native"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Route, router } from "expo-router"
import SwipeableScreen from "@/components/SwipeableScreen"

export default function SearchPage(){
    return(
        <SwipeableScreen currentScreen="searchPage">
            <Image source={require("@/assets/images/AndrePai.jpg")} style={{ height: "100%", width: "100%" }}></Image>
        </SwipeableScreen>
    )
}