import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  StatusBar,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { apiService } from "../../services/api";
import { parseJsonObject } from "../../utils/safeJson";

// Custom Dropdown Component
interface DropdownItem {
  label: string;
  value: string;
  icon?: string;
}

interface CustomDropdownProps {
  label: string;
  selectedValue: string;
  items: DropdownItem[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  colors: any;
  isDark: boolean;
  icon?: string;
  borderColor?: string;
  labelColor?: string;
  showItemIcons?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  selectedValue,
  items,
  onValueChange,
  placeholder = "",
  colors,
  isDark,
  icon = "chevron-down",
  borderColor,
  labelColor,
  showItemIcons = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedItem = items.find(item => item.value === selectedValue);

  const getLabel = (item: DropdownItem) => {
    return isDark ? item.label : item.label;
  };

  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            borderColor: borderColor || colors.border,
            backgroundColor: colors.background,
            borderWidth: 2,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownButtonContent}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={18} 
              color={borderColor || colors.text.primary} 
              style={styles.dropdownIcon}
            />
          )}
          {selectedItem && selectedItem.icon && showItemIcons && (
            <Text style={styles.selectedItemIcon}>{selectedItem.icon}</Text>
          )}
          <Text
            style={[
              styles.dropdownButtonText,
              {
                color: selectedItem ? colors.text.primary : colors.text.muted,
              },
            ]}
          >
            {selectedItem ? getLabel(selectedItem) : placeholder}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.text.muted}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? `${borderColor || colors.primary[500]}25`
                            : `${borderColor || colors.primary[500]}10`
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      {item.icon && (
                        <Text style={styles.modalItemIcon}>{item.icon}</Text>
                      )}
                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color: isSelected
                              ? borderColor || colors.primary[500]
                              : colors.text.primary,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {isDark ? item.label : item.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={borderColor || colors.primary[500]}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Main Component
export default function WeatherAdvisoryScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [crop, setCrop] = useState("sugarcane");
  const [stage, setStage] = useState("vegetative");
  const [soilType, setSoilType] = useState("medium");
  const [lastIrrigationDays, setLastIrrigationDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);

  // Dynamic header colors
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : "#fff";
  const headerSubColor = isDark ? colors.primary[200] : "rgba(255,255,255,0.8)";
  const headerEyebrowColor = isDark ? colors.primary[300] : "rgba(255,255,255,0.6)";
  const backBtnBg = isDark ? `${colors.primary[500]}40` : "rgba(255,255,255,0.15)";

  const cropData: DropdownItem[] = [
    { label: t("weather.crops.sugarcane"), value: "sugarcane", icon: "\uD83C\uDF3E" },
    { label: t("weather.crops.soybean"), value: "soybean", icon: "\uD83C\uDF31" },
    { label: t("weather.crops.wheat"), value: "wheat", icon: "\uD83C\uDF3E" },
    { label: t("weather.crops.rice"), value: "rice", icon: "\uD83C\uDF3E" },
    { label: t("weather.crops.cotton"), value: "cotton", icon: "\uD83C\uDF3F" },
    { label: t("weather.crops.maize"), value: "maize", icon: "\uD83C\uDF3D" },
    { label: t("weather.crops.groundnut"), value: "groundnut", icon: "\uD83E\uDD5C" },
  ];

  const stageData: DropdownItem[] = [
    { label: t("weather.stages.sowing"), value: "sowing", icon: "\uD83C\uDF31" },
    { label: t("weather.stages.vegetative"), value: "vegetative", icon: "\uD83C\uDF3F" },
    { label: t("weather.stages.flowering"), value: "flowering", icon: "\uD83C\uDF38" },
    { label: t("weather.stages.fruiting"), value: "fruiting", icon: "\uD83C\uDF4E" },
    { label: t("weather.stages.harvest"), value: "harvest", icon: "\uD83C\uDF3E" },
    { label: t("weather.stages.maturity"), value: "maturity", icon: "\u2B50" },
  ];

  const soilData: DropdownItem[] = [
    { label: t("weather.soil.light"), value: "light", icon: "\uD83C\uDFD6\uFE0F" },
    { label: t("weather.soil.medium"), value: "medium", icon: "\uD83C\uDFDC\uFE0F" },
    { label: t("weather.soil.heavy"), value: "heavy", icon: "\u26F0\uFE0F" },
    { label: t("weather.soil.sandy"), value: "sandy", icon: "\uD83C\uDFD6\uFE0F" },
    { label: t("weather.soil.loamy"), value: "loamy", icon: "\uD83C\uDF3E" },
    { label: t("weather.soil.black"), value: "black", icon: "\u26AB" },
    { label: t("weather.soil.red"), value: "red", icon: "\uD83D\uDD34" },
  ];

  const getTranslatedTitle = (title: string): string => {
    const titleMap: Record<string, string> = {
      "Detailed Crop Advisory": "weather.advisory.result_title",
    };
    return titleMap[title] ? t(titleMap[title]) : title;
  };

  const getTranslatedAdviceTitle = (title: string): string => {
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
    return titleMap[title] ? t(titleMap[title]) : title;
  };

  const getTranslatedDecision = (decision: string): string => {
    const decisionMap: Record<string, string> = {
      avoid: "weather.decisions.avoid",
      recommended: "weather.decisions.recommended",
      optional: "weather.decisions.optional",
      suitable: "weather.decisions.suitable",
      delay: "weather.decisions.delay",
    };
    return decisionMap[decision] ? t(decisionMap[decision]) : decision;
  };

  const getTranslatedMessage = (message: string): string => {
    const messageMap: Record<string, string> = {
      "Avoid irrigation today because rainfall is expected.": "weather.messages.avoid_irrigation_rainfall",
      "Irrigation is recommended because temperature is high and the crop was not irrigated recently.": "weather.messages.irrigation_recommended_high_temp",
      "Irrigation is optional today. Check soil moisture before watering.": "weather.messages.irrigation_optional",
      "Avoid spraying today because rain or strong wind may reduce spray effectiveness.": "weather.messages.avoid_spraying_rain_wind",
      "Spraying is suitable today. Prefer early morning or evening.": "weather.messages.spraying_suitable",
      "Delay fertilizer application because rainfall may wash away nutrients.": "weather.messages.delay_fertilizer_rainfall",
      "Fertilizer application is suitable if soil condition is proper.": "weather.messages.fertilizer_suitable",
      "This advisory is based on weather forecast and farmer inputs. For critical decisions, consult a local agriculture officer.": "weather.messages.advisory_note",
    };
    return messageMap[message] ? t(messageMap[message]) : message;
  };

  const getTranslatedSummary = (summary: string): string => {
    const match = summary.match(/Advisory generated for (.+?) at (.+?) stage/);
    if (match) {
      const cropName = match[1];
      const stageName = match[2];
      const cropKeys: Record<string, string> = {
        sugarcane: "weather.crops.sugarcane",
        soybean: "weather.crops.soybean",
        wheat: "weather.crops.wheat",
        rice: "weather.crops.rice",
        cotton: "weather.crops.cotton",
        maize: "weather.crops.maize",
        groundnut: "weather.crops.groundnut",
      };
      const stageKeys: Record<string, string> = {
        sowing: "weather.stages.sowing",
        vegetative: "weather.stages.vegetative",
        flowering: "weather.stages.flowering",
        fruiting: "weather.stages.fruiting",
        harvest: "weather.stages.harvest",
        maturity: "weather.stages.maturity",
      };
      const cropLabel = cropKeys[cropName] ? t(cropKeys[cropName]) : cropName;
      const stageLabel = stageKeys[stageName] ? t(stageKeys[stageName]) : stageName;
      return t("weather.advisory.generated_summary", { crop: cropLabel, stage: stageLabel });
    }
    return summary;
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
    return iconMap[title] || "\uD83D\uDCCB";
  };

  const getDetailedAdvice = async () => {
    try {
      if (!crop.trim()) {
        Alert.alert(
          t("weather.advisory.missing_details"),
          t("weather.advisory.enter_crop_stage")
        );
        return;
      }

      setLoading(true);

      const storedVillage = await AsyncStorage.getItem("scannedVillage");

      if (!storedVillage) {
        Alert.alert(
          t("weather.advisory.no_village"),
          t("weather.advisory.scan_village_first")
        );
        setLoading(false);
        return;
      }

      const parsedVillage = parseJsonObject(storedVillage);
      const villageId = parsedVillage?.villageId || parsedVillage?._id;

      if (!villageId) {
        Alert.alert(
          t("weather.advisory.no_village"),
          t("weather.advisory.scan_village_first")
        );
        setLoading(false);
        return;
      }

      const res = await apiService.get(`/weather/crop-advice/${villageId}`, {
        params: {
          crop: crop.trim().toLowerCase(),
          stage: stage.trim().toLowerCase(),
          soil: soilType,
          lastIrrigationDays: Number(lastIrrigationDays || 0),
        },
      });

      setAdvice(res?.data ?? null);
    } catch (err: any) {
      console.log("Detailed weather common.error:", apiService.getErrorMessage(err));
      Alert.alert(
        t("weather.advisory.error"),
        apiService.getErrorMessage(err, t("weather.advisory.failed_generate"))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={headerBg}
      />

      {/* Header */}
      <LinearGradient
        colors={
          isDark
            ? [colors.primary[800], colors.primary[900]]
            : [colors.primary[600], colors.primary[700]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        <View
          style={[
            styles.accentCircle1,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.06)",
            },
          ]}
        />
        <View
          style={[
            styles.accentCircle2,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(255,255,255,0.04)",
            },
          ]}
        />

        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: backBtnBg }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>
              ←
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
            {t("weather.advisory.weather_services")}
          </Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>
            {t("weather.advisory.title")}
          </Text>
          <View style={styles.headerBreadcrumb}>
            <View
              style={[
                styles.headerBreadcrumbDot,
                { backgroundColor: headerSubColor },
              ]}
            />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>
              {t("weather.advisory.crop_weather")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t("weather.advisory.get_detailed_advice")}
          </Text>

          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {t("weather.advisory.enter_crop_details")}
          </Text>

          {/* Crop Name */}
          <Text style={[styles.label, { color: colors.primary[700] }]}>
            {t("weather.advisory.crop_name")}
          </Text>
          <CustomDropdown
            label={t("weather.advisory.crop_name")}
            selectedValue={crop}
            items={cropData}
            onValueChange={setCrop}
            colors={colors}
            isDark={isDark}
            icon="leaf"
            borderColor={colors.primary[500]}
            labelColor={colors.primary[700]}
            showItemIcons={true}
            placeholder={t("common.select_option")}
          />

          {/* Growth Stage - With Icon in Input */}
          <Text style={[styles.label, { color: colors.secondary || colors.primary[600] }]}>
            {t("weather.advisory.growth_stage")}
          </Text>
          <CustomDropdown
            label={t("weather.advisory.growth_stage")}
            selectedValue={stage}
            items={stageData}
            onValueChange={setStage}
            colors={colors}
            isDark={isDark}
            icon="flower" // Icon for growth stage input
            borderColor={colors.secondary || colors.primary[400]}
            labelColor={colors.secondary || colors.primary[600]}
            showItemIcons={true} // Show selected item icon in input
            placeholder={t("common.select_option")}
          />

          {/* Soil Type */}
          <Text style={[styles.label, { color: colors.success || colors.green[600] }]}>
            {t("weather.advisory.soil_type")}
          </Text>
          <CustomDropdown
            label={t("weather.advisory.soil_type")}
            selectedValue={soilType}
            items={soilData}
            onValueChange={setSoilType}
            colors={colors}
            isDark={isDark}
            icon="cube"
            borderColor={colors.success || colors.green[400]}
            labelColor={colors.success || colors.green[600]}
            showItemIcons={true}
            placeholder={t("common.select_option")}
          />

          {/* Last Irrigation */}
          <Text style={[styles.label, { color: colors.warning || colors.orange[600] }]}>
            {t("weather.advisory.last_irrigation_days")}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: colors.warning || colors.orange[400],
                backgroundColor: colors.background,
                borderWidth: 2,
              },
            ]}
          >
            <Ionicons name="water-outline" size={18} color={colors.warning || colors.orange[500]} />
            <TextInput
              placeholder={t("weather.advisory.days_placeholder")}
              placeholderTextColor={colors.text.muted}
              value={lastIrrigationDays}
              onChangeText={setLastIrrigationDays}
              keyboardType="numeric"
              style={[styles.input, { color: colors.text.primary }]}
            />
          </View>

          {/* Get Advisory Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={getDetailedAdvice}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="leaf-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>
                  {t("weather.advisory.get_advisory")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Advice Results */}
        {advice && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {getTranslatedTitle(advice.title)}
            </Text>

            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {getTranslatedSummary(advice.summary)}
            </Text>

            {/* Weather Stats */}
            <View style={styles.weatherGrid}>
              <WeatherMiniStat
                icon={"\uD83C\uDF27\uFE0F"}
                label={t("weather.advisory.rain")}
                value={`${advice.weather.rainNext24HoursMM} mm`}
                colors={colors}
                isDark={isDark}
              />
              <WeatherMiniStat
                icon={"\uD83D\uDCA8"}
                label={t("weather.advisory.wind")}
                value={`${advice.weather.maxWindKmph} km/h`}
                colors={colors}
                isDark={isDark}
              />
              <WeatherMiniStat
                icon={"\uD83C\uDF21\uFE0F"}
                label={t("weather.advisory.temp")}
                value={`${advice.weather.maxTemperatureC}\u00B0C`}
                colors={colors}
                isDark={isDark}
              />
              <WeatherMiniStat
                icon={"\uD83D\uDCA7"}
                label={t("weather.advisory.humidity")}
                value={`${advice.weather.averageHumidity}%`}
                colors={colors}
                isDark={isDark}
              />
            </View>

            {/* Advice Items */}
            {advice.advice.map((item: any, index: number) => {
              const icon = getAdviceIcon(item.title);
              const translatedTitle = getTranslatedAdviceTitle(item.title);
              const translatedDecision = getTranslatedDecision(item.decision);
              const translatedMessage = getTranslatedMessage(item.message);

              return (
                <View
                  key={index}
                  style={[
                    styles.adviceItem,
                    {
                      backgroundColor: isDark
                        ? colors.neutral[700]
                        : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.adviceHeader}>
                    <View style={styles.adviceTitleContainer}>
                      <Text style={styles.adviceIcon}>{icon}</Text>
                      <Text
                        style={[styles.adviceTitle, { color: colors.text.primary }]}
                      >
                        {translatedTitle}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.badge,
                        {
                          color: colors.primary[700],
                          backgroundColor: isDark
                            ? `${colors.primary[500]}18`
                            : `${colors.primary[500]}0E`,
                        },
                      ]}
                    >
                      {translatedDecision}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.adviceMessage,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {translatedMessage}
                  </Text>
                </View>
              );
            })}

            <Text style={[styles.note, { color: colors.text.muted }]}>
              {getTranslatedMessage(advice.note)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Weather Mini Stat Component
function WeatherMiniStat({ icon, label, value, colors, isDark }: any) {
  return (
    <View
      style={[
        styles.miniStat,
        {
          backgroundColor: isDark ? colors.neutral[700] : colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={styles.miniIcon}>{icon}</Text>
      <Text style={[styles.miniValue, { color: colors.text.primary }]}>
        {value}
      </Text>
      <Text style={[styles.miniLabel, { color: colors.text.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header Styles
  headerShell: {
    paddingBottom: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  accentCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    right: -50,
  },
  accentCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -30,
    left: 30,
  },
  headerNavRow: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnTxt: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  headerTitleBlock: {
    paddingHorizontal: 18,
    gap: 4,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  headerBreadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
  },
  headerBreadcrumbDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Content Styles
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: "500",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
    marginTop: 10,
    textTransform: "uppercase",
  },

  // Custom Dropdown Styles
  dropdownWrapper: {
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 50,
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  selectedItemIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 2,
  },
  modalItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 15,
    flex: 1,
  },

  // Input Styles
  inputWrapper: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    padding: 0,
  },

  // Button Styles
  button: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // Weather Stats
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  miniStat: {
    width: "47%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  miniIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  miniValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  miniLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },

  // Advice Items
  adviceItem: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  adviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  adviceTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  adviceIcon: {
    fontSize: 18,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    textTransform: "capitalize",
  },
  adviceMessage: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  note: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    fontWeight: "500",
  },
});
