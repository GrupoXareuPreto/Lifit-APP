import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  username: string;
  type: "like" | "follow" | "message";
  text?: string;
};

// pega o tipo exato aceito pelo Ionicons
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// mapeia cada tipo de notificação para um ícone válido
const ICONS: Record<Props["type"], IoniconName> = {
  like: "heart",
  follow: "person-add",
  message: "chatbubble-outline",
};

export default function NotificationItem({ username, type, text }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={ICONS[type]} size={28} color="#000" style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>@{username}</Text>
        <Text numberOfLines={1} style={styles.text}>
          {text ??
            (type === "like"
              ? "curtiu sua postagem"
              : type === "follow"
              ? "seguiu você"
              : "enviou uma mensagem")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 10, marginVertical: 6 },
  icon: { marginRight: 12 },
  username: { fontWeight: "bold" },
  text: { color: "#555" },
});
