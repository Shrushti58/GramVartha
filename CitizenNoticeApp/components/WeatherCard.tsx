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
      console.log("Weather error:", apiService.getErrorMessage(err));
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Get translated stats labels
  const getTranslatedStatLabel = (label: string): string => {
    const labelMap: Record<string, { en: string; mr: string }> = {
      "Temperature": { en: "Temperature", mr: "तापमान" },
      "Wind": { en: "Wind", mr: "वारा" },
      "Humidity": { en: "Humidity", mr: "आर्द्रता" },
      "Rain": { en: "Rain", mr: "पाऊस" },
      "Pressure": { en: "Pressure", mr: "दाब" },
      "UV": { en: "UV Index", mr: "यूव्ही निर्देशांक" },
      "Visibility": { en: "Visibility", mr: "दृश्यता" },
      "Clouds": { en: "Cloud Cover", mr: "ढगांचे आवरण" },
    };
    
    return currentLanguage === 'mr'
      ? (labelMap[label]?.mr || label)
      : (labelMap[label]?.en || label);
  };

  // Get translated advice titles (without icons) and answers
  const getTranslatedAdvice = (title: string, answer: string): { title: string; answer: string } => {
    // Advice titles translation (without emoji icons)
    const titleMap: Record<string, { en: string; mr: string }> = {
      "Irrigation": { en: "Irrigation", mr: "सिंचन" },
      "Spraying": { en: "Spraying", mr: "फवारणी" },
      "Fertilizer": { en: "Fertilizer", mr: "खत" },
      "Pest Control": { en: "Pest Control", mr: "कीड नियंत्रण" },
      "Harvest": { en: "Harvest", mr: "कापणी" },
      "Sowing": { en: "Sowing", mr: "पेरणी" },
      "Water": { en: "Water", mr: "पाणी" },
      "Weather": { en: "Weather", mr: "हवामान" },
      "Frost": { en: "Frost Protection", mr: "दंव संरक्षण" },
      "Heat": { en: "Heat Protection", mr: "उष्णता संरक्षण" },
    };

    // Advice answers translation
    const answerMap: Record<string, { en: string; mr: string }> = {
      "Avoid today": { en: "Avoid today", mr: "आज टाळा" },
      "Can irrigate if needed": { en: "Can irrigate if needed", mr: "आवश्यक असल्यास सिंचन करा" },
      "Suitable today": { en: "Suitable today", mr: "आज योग्य आहे" },
      "Irrigation is recommended because temperature is high and the crop was not irrigated recently.": { 
        en: "Irrigation is recommended because temperature is high and the crop was not irrigated recently.", 
        mr: "तापमान जास्त असल्याने आणि पिकाला अलीकडे सिंचन न केल्याने सिंचनाची शिफारस केली जाते." 
      },
      "Avoid irrigation today because rainfall is expected.": { 
        en: "Avoid irrigation today because rainfall is expected.", 
        mr: "आज पावसाची शक्यता असल्याने सिंचन टाळा." 
      },
      "Irrigation is optional today. Check soil moisture before watering.": { 
        en: "Irrigation is optional today. Check soil moisture before watering.", 
        mr: "आज सिंचन ऐच्छिक आहे. पाणी देण्यापूर्वी जमिनीतील ओलावा तपासा." 
      },
      "Avoid spraying today because rain or strong wind may reduce spray effectiveness.": { 
        en: "Avoid spraying today because rain or strong wind may reduce spray effectiveness.", 
        mr: "आज फवारणी टाळा कारण पाऊस किंवा जोरदार वारा फवारणीची प्रभावीता कमी करू शकतो." 
      },
      "Spraying is suitable today. Prefer early morning or evening.": { 
        en: "Spraying is suitable today. Prefer early morning or evening.", 
        mr: "आज फवारणी योग्य आहे. सकाळी लवकर किंवा संध्याकाळी करा." 
      },
      "Delay fertilizer application because rainfall may wash away nutrients.": { 
        en: "Delay fertilizer application because rainfall may wash away nutrients.", 
        mr: "खताचा वापर विलंब करा कारण पावसामुळे पोषक तत्वे वाहून जाऊ शकतात." 
      },
      "Fertilizer application is suitable if soil condition is proper.": { 
        en: "Fertilizer application is suitable if soil condition is proper.", 
        mr: "जमिनीची स्थिती योग्य असल्यास खताचा वापर योग्य आहे." 
      },
    };

    const cleanTitle = title.replace(/[^\w\s]/g, '').trim();
    const translatedTitle = currentLanguage === 'mr'
      ? (titleMap[cleanTitle]?.mr || title)
      : (titleMap[cleanTitle]?.en || title);

    const translatedAnswer = currentLanguage === 'mr'
      ? (answerMap[answer]?.mr || answer)
      : (answerMap[answer]?.en || answer);

    return { title: translatedTitle, answer: translatedAnswer };
  };

  // Get icon for advice type
  const getAdviceIcon = (title: string): string => {
    const iconMap: Record<string, string> = {
      "Irrigation": "💧",
      "Spraying": "🌿",
      "Fertilizer": "🧪",
      "Pest Control": "🐛",
      "Harvest": "🌾",
      "Sowing": "🌱",
      "Water": "💧",
      "Weather": "🌤️",
      "Frost": "❄️",
      "Heat": "🔥",
    };
    const cleanTitle = title.replace(/[^\w\s]/g, '').trim();
    return iconMap[cleanTitle] || "📋";
  };

  // Get translated summary
  const getTranslatedSummary = (summary: string): string => {
    if (currentLanguage === 'mr') {
      const summaryMap: Record<string, string> = {
        "Rain is expected today. Be careful with irrigation and spraying.": 
          "आज पावसाची शक्यता आहे. सिंचन आणि फवारणीत काळजी घ्या.",
        "Weather looks normal for farm work today.": 
          "आज शेतीच्या कामासाठी हवामान सामान्य आहे.",
        "Partly cloudy with no chance of rain": 
          "अंशतः ढगाळ, पावसाची शक्यता नाही",
        "Clear skies expected today": 
          "आज स्वच्छ आकाश अपेक्षित",
        "Rain showers expected in the afternoon": 
          "दुपारी पावसाच्या सरी अपेक्षित",
        "Thunderstorms likely in the evening": 
          "संध्याकाळी वादळाची शक्यता",
        "High humidity with scattered showers": 
          "उच्च आर्द्रता आणि विखुरलेल्या सरी",
        "Cool and pleasant weather": 
          "थंड आणि सुखद हवामान",
        "Hot and humid conditions": 
          "उष्ण आणि दमट परिस्थिती",
        "Dry weather with strong winds": 
          "कोरडे हवामान आणि जोरदार वारे",
      };
      
      for (const [key, value] of Object.entries(summaryMap)) {
        if (summary.includes(key)) return value;
      }
      return summary;
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
          {currentLanguage === 'mr' 
            ? "हवामान डेटा उपलब्ध नाही" 
            : "Weather data not available"}
        </Text>
        <TouchableOpacity 
          onPress={loadWeatherAdvice}
          style={[styles.retryButton, { backgroundColor: colors.primary[500] }]}
        >
          <Text style={styles.retryButtonText}>
            {currentLanguage === 'mr' ? "पुन्हा प्रयत्न करा" : "Retry"}
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
            {currentLanguage === 'mr' ? "🌤️ आजचे हवामान" : "🌤️ Today's Weather"}
          </Text>

          {village?.name && (
            <Text style={[styles.villageName, { color: colors.text.muted }]}>
              {village.name}
              {currentLanguage === 'mr' && " - गाव"}
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
          {currentLanguage === 'mr' 
            ? "📋 तपशीलवार पीक सल्ला मिळवा" 
            : "📋 Get detailed crop advice"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.footer, { color: colors.text.muted }]}>
        {currentLanguage === 'mr' 
          ? `🔄 ${new Date().toLocaleString('mr-IN')} रोजी अपडेट केले`
          : `🔄 Updated at ${new Date().toLocaleString('en-IN')}`}
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
