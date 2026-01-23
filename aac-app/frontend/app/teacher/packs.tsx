import { View, Text, StyleSheet } from "react-native";

export default function Packs() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Packs</Text>
      <Text style={styles.subtitle}>Coming soon: Manage vocab packs here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
});

