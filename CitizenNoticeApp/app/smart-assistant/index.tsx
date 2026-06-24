import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../context/ThemeContext";
import apiService from "../../services/api";
import { parseJsonArray, parseJsonObject } from "../../utils/safeJson";

type AssistantCard = {
  type:
    | "documents"
    | "process"
    | "scheme";
  title: string;
  subtitle?: string;
  items: string[];
};

type AssistantSuggestion = {
  label: string;
  query: string;
};

type SourceInfo = {
  sourceType: "government" | "village";
  sourceName: string;
  sourceUrl: string | null;
  disclaimer: string;
  schemeId?: string;
  schemeTitle?: string;
};

type AssistantResponse = {
  success: boolean;
  type: "smart_assistance";
  intent: string;
  title: string;
  summary: string;
  cards: AssistantCard[];
  sections: { title: string; items: string[] }[];
  suggestions: AssistantSuggestion[];
  sourceInfo?: SourceInfo | null;
  schemeSources?: SourceInfo[];
  disclaimer?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  response?: AssistantResponse;
};

const QUICK_CATEGORIES = [
  { labelKey: "assistant.categories.students", query: "Show schemes for students", icon: "school-outline", hintKey: "assistant.categories.students_hint" },
  { labelKey: "assistant.categories.farmers", query: "Show farmer schemes", icon: "leaf-outline", hintKey: "assistant.categories.farmers_hint" },
  { labelKey: "assistant.categories.women", query: "Show women welfare schemes", icon: "woman-outline", hintKey: "assistant.categories.women_hint" },
  { labelKey: "assistant.categories.pension", query: "Show pension schemes", icon: "accessibility-outline", hintKey: "assistant.categories.pension_hint" },
  { labelKey: "assistant.categories.housing", query: "Show housing schemes", icon: "home-outline", hintKey: "assistant.categories.housing_hint" },
  { labelKey: "assistant.categories.health", query: "Show health schemes", icon: "medkit-outline", hintKey: "assistant.categories.health_hint" },
  { labelKey: "assistant.categories.employment", query: "Show employment schemes", icon: "briefcase-outline", hintKey: "assistant.categories.employment_hint" },
  { labelKey: "assistant.categories.business", query: "Show business loan schemes", icon: "storefront-outline", hintKey: "assistant.categories.business_hint" },
] as const;

const SUGGESTED_QUESTIONS = [
  { labelKey: "assistant.suggested.students", query: "Show schemes for students" },
  { labelKey: "assistant.suggested.farmers", query: "Show farmer schemes" },
  { labelKey: "assistant.suggested.women", query: "Show women welfare schemes" },
  { labelKey: "assistant.suggested.pension", query: "Show pension schemes" },
  { labelKey: "assistant.suggested.business", query: "Show schemes for business loan" },
];

const CARD_META: Record<AssistantCard["type"], { icon: keyof typeof Ionicons.glyphMap; tone: string }> = {
  documents: { icon: "folder-open-outline", tone: "info" },
  process: { icon: "list-outline", tone: "primary" },
  scheme: { icon: "ribbon-outline", tone: "success" },
};

const OFFICIAL_SOURCE_URL = "https://www.myscheme.gov.in";

const getStoredVillageId = async () => {
  const directVillageId = await AsyncStorage.getItem("villageId");
  if (directVillageId) return directVillageId;

  const scannedVillage = await AsyncStorage.getItem("scannedVillage");
  if (scannedVillage) {
    const parsed = parseJsonObject(scannedVillage);
    if (parsed?.villageId) return parsed.villageId;
    if (parsed?._id) return parsed._id;
    if (parsed?.id) return parsed.id;
  }

  const recentVillages =
    (await AsyncStorage.getItem("recentVillages")) ||
    (await AsyncStorage.getItem("scannedVillagesHistory"));
  if (recentVillages) {
    const parsed = parseJsonArray<any>(recentVillages);
    if (parsed[0]?.villageId) return parsed[0].villageId;
    if (parsed[0]?._id) return parsed[0]._id;
    if (parsed[0]?.id) return parsed[0].id;
  }

  return "";
};

export default function SmartAssistantScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [villageId, setVillageId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const themedStyles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    getStoredVillageId()
      .then(setVillageId)
      .catch(() => setVillageId(""));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getStoredVillageId()
        .then(setVillageId)
        .catch(() => setVillageId(""));
    }, [])
  );

  useEffect(() => {
    if (messages.length || loading) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages, loading]);

  const sendMessage = async (text: string, displayText?: string) => {
    const message = text.trim();
    if (!message || loading) return;

    if (!villageId) {
      Alert.alert(t("assistant.scan_village_first"), t("assistant.scan_village_first_message"));
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: displayText || message,
      },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = (await apiService.post("/assistant/chat", {
        message,
        villageId,
      })) as AssistantResponse;

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          response,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          response: {
            success: false,
            type: "smart_assistance",
            intent: "general",
            title: t("assistant.unavailable_title"),
            summary: t("assistant.unavailable_summary"),
            cards: [],
            sections: [],
            suggestions: [
              { label: t("assistant.search_schemes"), query: "Show government schemes" },
              { label: t("assistant.student_schemes"), query: "Show student schemes" },
            ],
            sourceInfo: {
              sourceType: "government",
              sourceName: "myScheme - Government of India",
              sourceUrl: OFFICIAL_SOURCE_URL,
              disclaimer:
                "GramVartha is not a government app. Scheme information is for awareness only. Please verify details from the official myScheme portal before applying.",
            },
            schemeSources: [],
            disclaimer:
              "GramVartha is not a government app and is not affiliated with, endorsed by, authorized by, or representing any government entity. Scheme information is for awareness only. Please verify details from the official source or concerned department before applying.",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const buildDetailQuery = (detailType: string, schemeTitle: string) => {
    if (detailType === "documents") return `What documents are required for ${schemeTitle}?`;
    if (detailType === "application") return `How can I apply for ${schemeTitle}?`;
    return `Am I eligible for ${schemeTitle}?`;
  };

  const getDetailActionLabel = (detailType: "eligibility" | "documents" | "application") => {
    if (detailType === "application") return t("assistant.how_to_apply");
    if (detailType === "documents") return t("assistant.required_documents");
    return t("assistant.check_eligibility");
  };

  const showSchemePicker = (detailType: "eligibility" | "documents" | "application", response: AssistantResponse) => {
    const schemeCards = (response.cards || []).filter((card) => card.type === "scheme").slice(0, 4);

    if (!schemeCards.length) {
      sendMessage(detailType, getDetailActionLabel(detailType));
      return;
    }

    const title =
      detailType === "documents"
        ? t("assistant.choose_scheme_for_documents")
        : detailType === "application"
        ? t("assistant.choose_scheme_to_apply")
        : t("assistant.choose_scheme_for_eligibility");

    const question =
      detailType === "documents"
        ? t("assistant.which_scheme_documents")
        : detailType === "application"
        ? t("assistant.which_scheme_apply")
        : t("assistant.which_scheme_eligibility");

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: getDetailActionLabel(detailType),
      },
      {
        id: `assistant-picker-${Date.now()}`,
        role: "assistant",
        response: {
          success: true,
          type: "smart_assistance",
          intent: "scheme",
          title,
          summary: t("assistant.select_scheme_summary"),
          cards: [
            {
              type: "process",
              title: question,
              subtitle: t("assistant.choose_one_option"),
              items: schemeCards.map((card) => card.title),
            },
          ],
          sections: [],
          suggestions: schemeCards.map((card) => ({
            label: card.title,
            query: buildDetailQuery(detailType, card.title),
          })),
          sourceInfo: response.sourceInfo,
          schemeSources: response.schemeSources,
          disclaimer: response.disclaimer,
        },
      },
    ]);
  };

  const handleSuggestionPress = (suggestion: AssistantSuggestion, response: AssistantResponse) => {
    const normalizedQuery = suggestion.query.trim().toLowerCase();

    if (normalizedQuery === "eligibility") {
      showSchemePicker("eligibility", response);
      return;
    }

    if (normalizedQuery === "documents") {
      showSchemePicker("documents", response);
      return;
    }

    if (normalizedQuery === "how to apply") {
      showSchemePicker("application", response);
      return;
    }

    sendMessage(suggestion.query, suggestion.label);
  };

  const getToneColor = (tone: string) => {
    if (tone === "success") return colors.success;
    if (tone === "warning") return colors.warning;
    if (tone === "info") return colors.info;
    return colors.primary[500];
  };

  const openOfficialSource = () => {
    Linking.openURL(OFFICIAL_SOURCE_URL).catch(() => {
      Alert.alert("Unable to open link", `Please visit ${OFFICIAL_SOURCE_URL}`);
    });
  };

  const renderSourceBanner = () => (
    <View style={themedStyles.sourceBanner}>
      <View style={themedStyles.sourceBannerIcon}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary[500]} />
      </View>
      <View style={themedStyles.sourceBannerCopy}>
        <Text style={themedStyles.sourceBannerText}>Government scheme source: myScheme - Government of India</Text>
        <Text style={themedStyles.sourceBannerLink}>Official website: {OFFICIAL_SOURCE_URL}</Text>
        <Text style={themedStyles.sourceBannerNote}>GramVartha is not a government app.</Text>
      </View>
      <Pressable style={themedStyles.sourceBannerButton} onPress={openOfficialSource}>
        <Ionicons name="open-outline" size={18} color="#fff" />
        <Text style={themedStyles.sourceBannerButtonText}>Open Official Source</Text>
      </Pressable>
    </View>
  );

  const renderHelpDeskHome = () => (
    <View style={themedStyles.homeWrap}>
      <View style={themedStyles.heroPanel}>
        <View style={themedStyles.heroTopRow}>
          <View style={themedStyles.heroIcon}>
            <Ionicons name="search-outline" size={26} color={colors.primary[500]} />
          </View>
          <View style={themedStyles.heroBadge}>
            <Text style={themedStyles.heroBadgeText}>{t("assistant.scheme_finder")}</Text>
          </View>
        </View>
        <Text style={themedStyles.heroTitle}>{t("assistant.find_right_scheme")}</Text>
        <Text style={themedStyles.heroSub}>
          {t("assistant.hero_subtitle")}
        </Text>
        <Pressable style={themedStyles.heroSearch} onPress={() => sendMessage("Show government schemes")}>
          <Ionicons name="sparkles-outline" size={18} color={colors.primary[500]} />
          <Text style={themedStyles.heroSearchText}>{t("assistant.start_by_choosing")}</Text>
        </Pressable>
      </View>

      <View style={themedStyles.blockHeader}>
        <Text style={themedStyles.blockTitle}>{t("assistant.popular_categories")}</Text>
        <Text style={themedStyles.blockHint}>{t("assistant.tap_one_to_search")}</Text>
      </View>
      <View style={themedStyles.categoryList}>
        {QUICK_CATEGORIES.map((category) => (
          <Pressable
            key={category.labelKey}
            style={themedStyles.categoryCard}
            onPress={() => sendMessage(category.query)}
          >
            <View style={themedStyles.categoryIcon}>
              <Ionicons name={category.icon} size={20} color={colors.primary[500]} />
            </View>
            <View style={themedStyles.categoryCopy}>
              <Text style={themedStyles.categoryText}>{t(category.labelKey)}</Text>
              <Text style={themedStyles.categoryHint}>{t(category.hintKey)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </Pressable>
        ))}
      </View>

      <View style={themedStyles.blockHeader}>
        <Text style={themedStyles.blockTitle}>{t("assistant.try_search")}</Text>
        <Text style={themedStyles.blockHint}>{t("assistant.quick_examples")}</Text>
      </View>
      <View style={themedStyles.questionList}>
        {SUGGESTED_QUESTIONS.map((question) => (
          <Pressable key={question.labelKey} style={themedStyles.questionRow} onPress={() => sendMessage(question.query, t(question.labelKey))}>
            <Text style={themedStyles.questionText}>{t(question.labelKey)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderAssistantCard = (card: AssistantCard, index: number) => {
    const meta = CARD_META[card.type] || CARD_META.scheme;
    const toneColor = getToneColor(meta.tone);
    const isScheme = card.type === "scheme";

    return (
      <View
        key={`${card.type}-${card.title}-${index}`}
        style={[themedStyles.assistanceCard, isScheme && themedStyles.schemeCard]}
      >
        <View style={themedStyles.cardHeader}>
          <View style={[themedStyles.cardIcon, { backgroundColor: `${toneColor}18` }]}>
            <Ionicons name={meta.icon} size={20} color={toneColor} />
          </View>
          <View style={themedStyles.cardBody}>
            <Text style={themedStyles.cardTitle}>{card.title}</Text>
            {!!card.subtitle && <Text style={[themedStyles.cardSubtitle, { color: toneColor }]}>{card.subtitle}</Text>}
          </View>
        </View>
        <View style={themedStyles.cardItems}>
          {card.items.map((item, itemIndex) => (
            <View key={`${card.title}-${itemIndex}`} style={themedStyles.cardItemRow}>
              <View style={[themedStyles.cardBullet, { backgroundColor: toneColor }]} />
              <Text style={themedStyles.cardItem}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAssistantResponse = (response: AssistantResponse) => (
    <View style={themedStyles.responsePanel}>
      <View style={themedStyles.responseHeader}>
        <View style={themedStyles.responseIcon}>
          <Ionicons name="ribbon-outline" size={20} color={colors.primary[500]} />
        </View>
        <View style={themedStyles.responseHeaderText}>
          <Text style={themedStyles.responseTitle}>{response.title}</Text>
          <Text style={themedStyles.intentText}>{response.intent.replace(/_/g, " ").toUpperCase()}</Text>
        </View>
      </View>

      <Text style={themedStyles.summaryText}>{response.summary}</Text>

      <View style={themedStyles.cardsWrap}>
        {(response.cards || []).map(renderAssistantCard)}
      </View>

      {!!response.suggestions?.length && (
        <View style={themedStyles.suggestionWrap}>
          {response.suggestions.slice(0, 4).map((suggestion) => (
            <Pressable
              key={`${suggestion.label}-${suggestion.query}`}
              style={themedStyles.suggestionChip}
              onPress={() => handleSuggestionPress(suggestion, response)}
            >
              <Text style={themedStyles.suggestionText}>{suggestion.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={themedStyles.sourceInfoBox}>
        <Text style={themedStyles.sourceInfoTitle}>Source Information</Text>
        {(response.schemeSources?.length ? response.schemeSources : response.sourceInfo ? [response.sourceInfo] : []).map((source, index) => (
          <View key={`${source.sourceName}-${source.schemeTitle || index}`} style={themedStyles.sourceInfoItem}>
            {!!source.schemeTitle && <Text style={themedStyles.sourceInfoScheme}>{source.schemeTitle}</Text>}
            <Text style={themedStyles.sourceInfoText}>Source: {source.sourceName}</Text>
            {!!source.sourceUrl && (
              <Pressable onPress={() => Linking.openURL(source.sourceUrl || OFFICIAL_SOURCE_URL)}>
                <Text style={themedStyles.sourceInfoUrl}>Official source: {source.sourceUrl}</Text>
              </Pressable>
            )}
            <Text style={themedStyles.sourceInfoDisclaimer}>{source.disclaimer}</Text>
          </View>
        ))}
        {!!response.disclaimer && <Text style={themedStyles.sourceInfoDisclaimer}>{response.disclaimer}</Text>}
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === "assistant" && item.response) {
      return <View style={themedStyles.assistantRow}>{renderAssistantResponse(item.response)}</View>;
    }

    return (
      <View style={themedStyles.userRow}>
        <View style={themedStyles.userBubble}>
          <Text style={themedStyles.userText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={themedStyles.root} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={themedStyles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={themedStyles.header}>
          <Pressable style={themedStyles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <View style={themedStyles.headerCopy}>
            <Text style={themedStyles.headerTitle}>{t("assistant.title")}</Text>
            <Text style={themedStyles.headerSubtitle}>{t("assistant.subtitle")}</Text>
          </View>
          <Pressable style={themedStyles.headerButton} onPress={() => router.push("/sources-disclaimer" as any)}>
            <Ionicons name="information-circle-outline" size={22} color={colors.text.primary} />
          </Pressable>
        </View>

        {renderSourceBanner()}

        {messages.length === 0 ? (
          <ScrollView
            style={themedStyles.homeScroll}
            contentContainerStyle={themedStyles.homeContent}
            showsVerticalScrollIndicator={false}
          >
            {renderHelpDeskHome()}
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={themedStyles.listContent}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              loading ? (
                <View style={themedStyles.typingRow}>
                  <ActivityIndicator color={colors.primary[500]} />
                  <Text style={themedStyles.typingText}>{t("assistant.checking_records")}</Text>
                </View>
              ) : null
            }
          />
        )}

        <View style={themedStyles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("assistant.input_placeholder")}
            placeholderTextColor={colors.text.muted}
            style={themedStyles.input}
            multiline
          />
          <Pressable
            style={[themedStyles.sendButton, (!input.trim() || loading) && themedStyles.sendButtonDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboard: {
      flex: 1,
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
    },
    headerCopy: {
      flex: 1,
      marginLeft: 12,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: "800",
    },
    headerSubtitle: {
      color: colors.text.secondary,
      fontSize: 12,
      marginTop: 2,
    },
    sourceBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? colors.background : colors.primary[50],
    },
    sourceBannerIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary[500]}15`,
    },
    sourceBannerCopy: {
      flex: 1,
      minWidth: 0,
    },
    sourceBannerText: {
      color: colors.text.primary,
      fontSize: 12,
      fontWeight: "900",
      lineHeight: 17,
    },
    sourceBannerLink: {
      color: colors.primary[500],
      fontSize: 11,
      fontWeight: "800",
      lineHeight: 16,
    },
    sourceBannerNote: {
      color: colors.text.secondary,
      fontSize: 11,
      lineHeight: 16,
    },
    sourceBannerButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 18,
      justifyContent: "center",
      backgroundColor: colors.primary[500],
    },
    sourceBannerButtonText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "900",
    },
    homeScroll: {
      flex: 1,
    },
    homeContent: {
      padding: 16,
      paddingBottom: 28,
    },
    homeWrap: {
      gap: 16,
    },
    heroPanel: {
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    heroIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary[500]}15`,
    },
    heroBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: `${colors.primary[500]}12`,
    },
    heroBadgeText: {
      color: colors.primary[500],
      fontSize: 11,
      fontWeight: "900",
    },
    heroTitle: {
      color: colors.text.primary,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 6,
    },
    heroSub: {
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 20,
    },
    heroSearch: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.background : colors.primary[50],
    },
    heroSearchText: {
      flex: 1,
      color: colors.text.primary,
      fontSize: 13,
      fontWeight: "800",
    },
    blockHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginTop: 2,
    },
    blockTitle: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: "800",
    },
    blockHint: {
      color: colors.text.muted,
      fontSize: 11,
      fontWeight: "700",
    },
    categoryList: {
      gap: 10,
    },
    categoryCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 13,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary[500]}12`,
      marginRight: 12,
    },
    categoryCopy: {
      flex: 1,
      minWidth: 0,
    },
    categoryText: {
      color: colors.text.primary,
      fontSize: 13,
      fontWeight: "800",
    },
    categoryHint: {
      color: colors.text.muted,
      fontSize: 11,
      marginTop: 2,
      lineHeight: 15,
    },
    questionList: {
      gap: 8,
    },
    questionRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    questionText: {
      flex: 1,
      color: colors.text.primary,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 18,
    },
    listContent: {
      padding: 16,
      paddingBottom: 22,
    },
    userRow: {
      alignItems: "flex-end",
      marginBottom: 12,
    },
    userBubble: {
      maxWidth: "86%",
      borderRadius: 16,
      borderTopRightRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.primary[500],
    },
    userText: {
      color: "#fff",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "700",
    },
    assistantRow: {
      marginBottom: 14,
    },
    responsePanel: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
    },
    responseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    responseIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary[500]}15`,
      marginRight: 10,
    },
    responseHeaderText: {
      flex: 1,
      minWidth: 0,
    },
    responseTitle: {
      color: colors.text.primary,
      fontSize: 17,
      fontWeight: "900",
    },
    intentText: {
      color: colors.text.muted,
      fontSize: 10,
      fontWeight: "900",
      marginTop: 2,
    },
    summaryText: {
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 12,
    },
    cardsWrap: {
      gap: 10,
    },
    assistanceCard: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.background : colors.primary[50],
    },
    schemeCard: {
      backgroundColor: colors.surface,
      borderColor: colors.primary[200] || colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: "900",
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 7,
    },
    cardItems: {
      marginTop: 8,
    },
    cardItemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 5,
    },
    cardBullet: {
      width: 5,
      height: 5,
      borderRadius: 3,
      marginTop: 7,
      marginRight: 8,
    },
    cardItem: {
      flex: 1,
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 19,
    },
    suggestionWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    suggestionChip: {
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: `${colors.primary[500]}15`,
    },
    suggestionText: {
      color: colors.primary[500],
      fontSize: 12,
      fontWeight: "800",
    },
    sourceInfoBox: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: 8,
    },
    sourceInfoTitle: {
      color: colors.text.primary,
      fontSize: 12,
      fontWeight: "900",
    },
    sourceInfoItem: {
      gap: 3,
    },
    sourceInfoScheme: {
      color: colors.text.primary,
      fontSize: 12,
      fontWeight: "800",
    },
    sourceInfoText: {
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 17,
    },
    sourceInfoUrl: {
      color: colors.primary[500],
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 17,
    },
    sourceInfoDisclaimer: {
      color: colors.text.muted,
      fontSize: 11,
      lineHeight: 16,
    },
    typingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    typingText: {
      color: colors.text.secondary,
      fontSize: 13,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      padding: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      maxHeight: 112,
      minHeight: 44,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text.primary,
      backgroundColor: colors.background,
      fontSize: 14,
      lineHeight: 19,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary[500],
    },
    sendButtonDisabled: {
      opacity: 0.45,
    },
  });
