import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { apiService } from "../services/api";
import { parseJsonObject } from "../utils/safeJson";

export default function WeatherCard() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [village, setVillage] = useState<any>(null);

  useEffect(() => {
    loadWeatherAdvice();
  }, []);

  const loadWeatherAdvice = async () => {
    try {
      setLoading(true);

      const storedVillage = await AsyncStorage.getItem("scannedVillage");

      if (!storedVillage) {
        setWeather(null);
        setLoading(false);
        return;
      }

      const parsedVillage = parseJsonObject(storedVillage);
      if (!parsedVillage) {
        setVillage(null);
        setWeather(null);
        return;
      }

      setVillage(parsedVillage);

      const villageId = parsedVillage.villageId || parsedVillage._id;
      if (!villageId) {
        setWeather(null);
        return;
      }

      const res = await apiService.get(`/weather/basic-advice/${villageId}`);

      if (res?.success) {
        setWeather(res.data ?? null);
      } else {
        setWeather(null);
      }
    } catch (err: any) {
      console.log("Weather common.error:", apiService.getErrorMessage(err));
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getTranslatedStatLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      Temperature: "weather.card.stats.temperature",
      Wind: "weather.card.stats.wind",
      Humidity: "weather.card.stats.humidity",
      Rain: "weather.card.stats.rain",
      Pressure: "weather.card.stats.pressure",
      UV: "weather.card.stats.uv",
      Visibility: "weather.card.stats.visibility",
      Clouds: "weather.card.stats.clouds",
    };
    return labelMap[label] ? t(labelMap[label]) : label;
  };

  const getTranslatedAdvice = (title: string, answer: string): { title: string; answer: string } => {
    const titleMap: Record<string, string> = {
      Irrigation: "weather.adviceTitles.irrigation",
      Spraying: "weather.adviceTitles.spraying",
      Fertilizer: "weather.adviceTitles.fertilizer",
      "Pest Control": "weather.adviceTitles.pest_control",
      Harvest: "weather.adviceTitles.harvest",
      Sowing: "weather.adviceTitles.sowing",
      Water: "weather.adviceTitles.water",
      Weather: "weather.adviceTitles.weather",
      Frost: "weather.adviceTitles.frost",
      Heat: "weather.adviceTitles.heat",
    };

    const answerMap: Record<string, string> = {
      "Avoid today": "weather.messages.avoid_today",
      "Can irrigate if needed": "weather.messages.can_irrigate_if_needed",
      "Suitable today": "weather.messages.suitable_today",
      "Irrigation is recommended because temperature is high and the crop was not irrigated recently.": "weather.messages.irrigation_recommended_high_temp",
      "Avoid irrigation today because rainfall is expected.": "weather.messages.avoid_irrigation_rainfall",
      "Irrigation is optional today. Check soil moisture before watering.": "weather.messages.irrigation_optional",
      "Avoid spraying today because rain or strong wind may reduce spray effectiveness.": "weather.messages.avoid_spraying_rain_wind",
      "Spraying is suitable today. Prefer early morning or evening.": "weather.messages.spraying_suitable",
      "Delay fertilizer application because rainfall may wash away nutrients.": "weather.messages.delay_fertilizer_rainfall",
      "Fertilizer application is suitable if soil condition is proper.": "weather.messages.fertilizer_suitable",
    };

    const cleanTitle = title.replace(/[^\w\s]/g, '').trim();
    const translatedTitle = titleMap[cleanTitle] ? t(titleMap[cleanTitle]) : title;
    const translatedAnswer = answerMap[answer] ? t(answerMap[answer]) : answer;

    return { title: translatedTitle, answer: translatedAnswer };
  };

  const getAdviceIcon = (title: string): string => {
    const iconMap: Record<string, string> = {
      Irrigation: "\uD83D\uDCA7",
      Spraying: "\uD83C\uDF3F",
      Fertilizer: "\uD83E\uDDEA",
      "Pest Control": "\uD83D\uDC1B",
      Harvest: "\uD83C\uDF3E",
      Sowing: "\uD83C\uDF31",
      Water: "\uD83D\uDCA7",
      Weather: "\uD83C\uDF24\uFE0F",
      Frost: "\u2744\uFE0F",
      Heat: "\uD83D\uDD25",
    };
    const cleanTitle = title.replace(/[^\w\s]/g, '').trim();
    return iconMap[cleanTitle] || "\uD83D\uDCCB";
  };

  const getTranslatedSummary = (summary: string): string => {
    const summaryMap: Record<string, string> = {
      "Rain is expected today. Be careful with irrigation and spraying.": "weather.messages.rain_expected_today",
      "Weather looks normal for farm work today.": "weather.messages.normal_farm_weather",
      "Partly cloudy with no chance of rain": "weather.conditions.partly_cloudy_no_rain",
      "Clear skies expected today": "weather.conditions.clear_skies",
      "Rain showers expected in the afternoon": "weather.conditions.afternoon_showers",
      "Thunderstorms likely in the evening": "weather.conditions.evening_thunderstorms",
      "High humidity with scattered showers": "weather.conditions.humid_scattered_showers",
      "Cool and pleasant weather": "weather.conditions.cool_pleasant",
      "Hot and humid conditions": "weather.conditions.hot_humid",
      "Dry weather with strong winds": "weather.conditions.dry_strong_winds",
    };

    for (const [key, value] of Object.entries(summaryMap)) {
      if (summary.includes(key)) return t(value);
    }
    return summary;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (!weather) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.noDataText, { color: colors.text.muted }]}>
          {t("weather.card.data_not_available")}
        </Text>
        <TouchableOpacity 
          onPress={loadWeatherAdvice}
          style={[styles.retryButton, { backgroundColor: colors.primary[500] }]}
        >
          <Text style={styles.retryButtonText}>
            {t("common.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t("weather.card.todays_weather")}
          </Text>

          {village?.name && (
            <Text style={[styles.villageName, { color: colors.text.muted }]}>
              {village.name}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={loadWeatherAdvice}>
          <Ionicons
            name="refresh-outline"
            size={22}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.summary, { color: colors.text.secondary }]}>
        {getTranslatedSummary(weather.summary)}
      </Text>

      <View style={styles.statsRow}>
        {weather.stats?.map((item: any, index: number) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statIcon}>{item.icon}</Text>

            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {item.value}
            </Text>

            <Text style={[styles.statLabel, { color: colors.text.muted }]}>
              {getTranslatedStatLabel(item.label)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.adviceContainer}>
        {weather.quickAdvice?.map((item: any, index: number) => {
          const translated = getTranslatedAdvice(item.title, item.answer);
          const icon = getAdviceIcon(item.title);
          
          return (
            <View
              key={index}
              style={[
                styles.adviceBox,
                {
                  backgroundColor: `${colors.primary[500]}10`,
                },
              ]}
            >
              <Text style={styles.adviceIcon}>{icon}</Text>

              <View style={{ flex: 1 }}>
                <Text style={[styles.adviceTitle, { color: colors.text.primary }]}>
                  {translated.title}
                </Text>

                <Text
                  style={[
                    styles.adviceAnswer,
                    { color: colors.primary[700] },
                  ]}
                >
                  {translated.answer}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.detailButton, { borderColor: colors.primary[500] }]}
        onPress={() => router.push("/weather/weather-advisory" as any)}
      >
        <Text style={[styles.detailButtonText, { color: colors.primary[700] }]}>
          {t("weather.card.get_detailed_crop_advice")}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.footer, { color: colors.text.muted }]}>
        {t("weather.card.updated_at", {
          time: new Date().toLocaleString(currentLanguage === "mr" ? "mr-IN" : "en-IN"),
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
  },

  villageName: {
    fontSize: 12,
    marginTop: 2,
  },

  summary: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    flexWrap: "wrap",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 60,
  },

  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },

  adviceContainer: {
    gap: 10,
  },

  adviceBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },

  adviceIcon: {
    fontSize: 22,
    width: 30,
    textAlign: "center",
  },

  adviceTitle: {
    fontSize: 13,
    fontWeight: "600",
  },

  adviceAnswer: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  footer: {
    fontSize: 10,
    marginTop: 12,
    textAlign: "right",
    opacity: 0.7,
  },

  detailButton: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },

  detailButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },

  noDataText: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: 10,
  },

  retryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },

  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
