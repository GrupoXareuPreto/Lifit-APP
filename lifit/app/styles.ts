import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#90E05E",
        //BORDA PARA DEV
        borderWidth:0,

        padding: 8,

    },

    title: {
    fontWeight: "bold",
    fontSize: 16
    },
    btn:{
        width: "100%",
        height: 52,
        backgroundColor: "#2B3C45",
        borderRadius: 10,
        justifyContent: "center",
        alignItems:"center"
    },

    btnCriarConta: {
        backgroundColor: "#90E05E",
    },
    page: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        gap: 0,
        backgroundColor: "#90E05E",
        //BORDA PARA DEV
        borderWidth:1,
        
    },
})
