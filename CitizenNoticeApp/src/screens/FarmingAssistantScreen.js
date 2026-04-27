import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import WeatherCard from "../components/WeatherCard";
import { useWeather } from "../hooks/useWeather";

const FarmingAssistantScreen = () => {
  const { loading, data, error, reload } = useWeather();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Smart Farming Assistant</Text>
        <Text style={styles.subheading}>
          Weather-based irrigation advice for your current location
        </Text>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0F766E" />
            <Text style={styles.stateText}>Fetching latest weather advice...</Text>
          </View>
        )}

        {!loading && error ? (
          <View style={styles.centered}>
            <Text style={styles.errorTitle}>Unable to load advisor</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && data ? <WeatherCard weather={data} /> : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subheading: {
    marginTop: 4,
    marginBottom: 18,
    color: "#475569",
    fontSize: 14,
  },
  centered: {
    marginTop: 20,
    alignItems: "center",
  },
  stateText: {
    marginTop: 10,
    color: "#334155",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B91C1C",
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
    color: "#475569",
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default FarmingAssistantScreen;
