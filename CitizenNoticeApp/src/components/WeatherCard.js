import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ADVICE_THEME = {
  DO_NOT_WATER: {
    color: "#DC2626",
    background: "#FEE2E2",
    label: "Do not water now",
  },
  WATER_REQUIRED: {
    color: "#2563EB",
    background: "#DBEAFE",
    label: "Watering required",
  },
  LIGHT_WATERING: {
    color: "#CA8A04",
    background: "#FEF9C3",
    label: "Light watering",
  },
  NORMAL_WATERING: {
    color: "#16A34A",
    background: "#DCFCE7",
    label: "Normal watering",
  },
};

const MetricRow = ({ label, value }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const WeatherCard = ({ weather }) => {
  const adviceTheme =
    ADVICE_THEME[weather?.adviceCode] || ADVICE_THEME.NORMAL_WATERING;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Smart Farming Weather Advisor</Text>

      <MetricRow
        label="Temperature"
        value={`${Number(weather?.temperature || 0).toFixed(1)}°C`}
      />
      <MetricRow label="Humidity" value={`${weather?.humidity ?? 0}%`} />
      <MetricRow
        label="Rain Probability"
        value={`${weather?.rainProbability ?? 0}%`}
      />
      <MetricRow
        label="Rainfall"
        value={`${Number(weather?.rainfall || 0).toFixed(1)} mm`}
      />

      <View style={[styles.adviceContainer, { backgroundColor: adviceTheme.background }]}>
        <Text style={[styles.adviceCode, { color: adviceTheme.color }]}>
          {adviceTheme.label}
        </Text>
        <Text style={[styles.adviceMessage, { color: adviceTheme.color }]}>
          {weather?.adviceMessage}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#475569",
  },
  metricValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  adviceContainer: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
  },
  adviceCode: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  adviceMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default WeatherCard;
