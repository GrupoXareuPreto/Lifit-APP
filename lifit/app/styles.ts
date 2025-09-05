import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    
    container: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#90E05E",
        //BORDA PARA DEV
        borderWidth:1,

        padding: 8,

    },

    title: {
    fontWeight: "bold",
    fontSize: 16
    },
    page: {
         width: "100%",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        
        backgroundColor: "#90E05E",
        //BORDA PARA DEV
        borderWidth:1,
        
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center', // Centraliza o conteúdo verticalmente
        backgroundColor: "#90E05E",
    },
    
})
