import React from "react"
import { View , Text, StyleSheet, Image} from "react-native"
import SwipeableScreen from "@/components/SwipeableScreen"

export default function SearchPage(){
    return(
        <SwipeableScreen currentScreen="searchPage" >
            <View style={styles.container}>
                <Text style={styles.text}>pesquisar em desenvolvimento</Text>
            </View>
        </SwipeableScreen>
    )

    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    color: '#222',
    margin: 20,
  },
});