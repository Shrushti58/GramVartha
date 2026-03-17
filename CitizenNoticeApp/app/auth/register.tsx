import { View, Text, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import apiService from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const villageStr = await AsyncStorage.getItem("scannedVillage");
const villageObj = JSON.parse(villageStr || "{}");


      const res = await apiService.registerCitizen({
        name,
        phone,
        password,
        village: villageObj.villageId,
      });

      await AsyncStorage.setItem("token", res.token);

      Alert.alert("Success", "Registered successfully");
      router.replace("/"); // go to home
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} />

      <Text>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} />

      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}