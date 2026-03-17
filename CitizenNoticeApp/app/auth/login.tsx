import { View, Text, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import apiService from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await apiService.loginCitizen({
        phone,
        password,
      });

      await AsyncStorage.setItem("token", res.token);

      Alert.alert("Success", "Logged in");
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} />

      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}