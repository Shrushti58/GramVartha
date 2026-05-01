import React from "react";
import { StyleSheet, Text, View } from "react-native";

const STATUS_COLORS = {
  red: { bg: "#FEE2E2", text: "#B91C1C" },
  green: { bg: "#DCFCE7", text: "#166534" },
  yellow: { bg: "#FEF9C3", text: "#A16207" },
};

const getSeverity = (value) => {
  const upper = String(value || "").toUpperCase();
  if (
    upper.includes("AVOID") ||
    upper.includes("DO_NOT") ||
    upper.includes("DELAY") ||
    upper === "HIGH"
  ) {
    return STATUS_COLORS.red;
  }
  if (upper.includes("SAFE") || upper === "LOW" || upper.includes("REQUIRED")) {
    return STATUS_COLORS.green;
  }
  return STATUS_COLORS.yellow;
};

const Row = ({ label, value }) => {
  const tone = getSeverity(value);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: tone.bg }]}>
        <Text style={[styles.badgeText, { color: tone.text }]}>{value}</Text>
      </View>
    </View>
  );
};

const AdviceCard = ({ data }) => {
  if (!data) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Advanced Farming Advisor</Text>

      <View style={styles.advisorBox}>
        <Text style={styles.advisorHeadline}>{data?.advisor?.headline}</Text>
        <Text style={styles.advisorSummary}>{data?.advisor?.summary}</Text>
      </View>

      <View style={styles.planBox}>
        <Text style={styles.planTitle}>Today's Plan</Text>
        <Text style={styles.planLine}>1. {data?.advisor?.todayPlan?.immediateAction}</Text>
        <Text style={styles.planLine}>2. {data?.advisor?.todayPlan?.timing}</Text>
        <Text style={styles.planLine}>3. {data?.advisor?.todayPlan?.nextCheck}</Text>
        <Text style={styles.planWarning}>Avoid: {data?.advisor?.todayPlan?.avoidAction}</Text>
      </View>

      <Row label="Irrigation Advice" value={data?.irrigation?.advice} />
      <Text style={styles.subValue}>Score: {data?.irrigation?.score ?? 0}</Text>
      <Row label="Spraying Advice" value={data?.spraying} />
      <Row label="Soil Moisture" value={data?.metrics?.soilMoisture} />
      <Row label="Evaporation Level" value={data?.metrics?.evaporation} />
      <Row label="Disease Risk" value={data?.metrics?.diseaseRisk} />

      <Text style={styles.sectionTitle}>Why This Advice</Text>
      {(data?.advisor?.reasons || []).map((step, index) => (
        <Text key={`${step}-${index}`} style={styles.listItem}>
          - {step}
        </Text>
      ))}
      <Text style={styles.contextLine}>{data?.advisor?.caution}</Text>
      <Text style={styles.contextLine}>{data?.advisor?.diseaseNote}</Text>
      <Text style={styles.contextLine}>{data?.advisor?.waterManagement}</Text>

      <Text style={styles.sectionTitle}>Weather Insights</Text>
      {(data?.insights || []).map((insight, index) => (
        <Text key={`${insight}-${index}`} style={styles.listItem}>
          - {insight}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
    marginBottom: 14,
  },
  advisorBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  advisorHeadline: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  advisorSummary: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
  },
  planBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  planTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9A3412",
    marginBottom: 6,
  },
  planLine: {
    color: "#7C2D12",
    lineHeight: 20,
    marginBottom: 2,
  },
  planWarning: {
    marginTop: 6,
    color: "#B91C1C",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  subValue: {
    color: "#334155",
    marginBottom: 8,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  listItem: {
    color: "#334155",
    lineHeight: 20,
  },
  contextLine: {
    marginTop: 6,
    color: "#475569",
    lineHeight: 19,
  },
});

export default AdviceCard;
