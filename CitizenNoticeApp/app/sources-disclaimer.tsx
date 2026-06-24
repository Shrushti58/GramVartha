import React, { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";

const OFFICIAL_SOURCE_URL = "https://www.myscheme.gov.in";

export default function SourcesDisclaimerScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Sources & Disclaimer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Government Scheme Information</Text>
          <Text style={styles.bodyText}>
            Scheme data is shown for awareness and should be verified from the official myScheme portal.
          </Text>
          <Pressable style={styles.linkRow} onPress={() => Linking.openURL(OFFICIAL_SOURCE_URL)}>
            <Ionicons name="open-outline" size={18} color={colors.primary[500]} />
            <Text style={styles.linkText}>Official source: {OFFICIAL_SOURCE_URL}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Village Information</Text>
          <Text style={styles.bodyText}>
            Village notices, work guides, and village-specific schemes are provided and maintained by participating Gram Panchayats and their authorized officials through GramVartha.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disclaimer</Text>
          <Text style={styles.bodyText}>
            GramVartha is an independent digital governance platform and is not affiliated with, endorsed by, authorized by, or representing any government authority.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? colors.surface2 || colors.surface : colors.primary[50],
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: "900",
    },
    content: {
      padding: 16,
      gap: 12,
      paddingBottom: 28,
    },
    section: {
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 8,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: "900",
    },
    bodyText: {
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 20,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    linkText: {
      flex: 1,
      color: colors.primary[500],
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 18,
    },
  });
