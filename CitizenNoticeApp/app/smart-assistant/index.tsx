import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
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

type AssistantResponse = {
  success: boolean;
  type: "smart_assistance";
  intent: string;
  title: string;
  summary: string;
  cards: AssistantCard[];
  sections: { title: string; items: string[] }[];
  suggestions: AssistantSuggestion[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  response?: AssistantResponse;
};

const QUICK_CATEGORIES = [
  { label: "Students", query: "Show schemes for students", icon: "school-outline", hint: "Scholarships, fee support" },
  { label: "Farmers", query: "Show farmer schemes", icon: "leaf-outline", hint: "Crop, subsidy, support" },
  { label: "Women", query: "Show women welfare schemes", icon: "woman-outline", hint: "Welfare and self help" },
  { label: "Pension", query: "Show pension schemes", icon: "accessibility-outline", hint: "Senior, widow, disabled" },
  { label: "Housing", query: "Show housing schemes", icon: "home-outline", hint: "House and repair help" },
  { label: "Health", query: "Show health schemes", icon: "medkit-outline", hint: "Insurance and treatment" },
  { label: "Employment", query: "Show employment schemes", icon: "briefcase-outline", hint: "Jobs and skill training" },
  { label: "Business", query: "Show business loan schemes", icon: "storefront-outline", hint: "Loans and startup help" },
] as const;

const SUGGESTED_QUESTIONS = [
  "Show schemes for students",
  "Show farmer schemes",
  "Show women welfare schemes",
  "Show pension schemes",
  "Show schemes for business loan",
];

const CARD_META: Record<AssistantCard["type"], { icon: keyof typeof Ionicons.glyphMap; tone: string }> = {
  documents: { icon: "folder-open-outline", tone: "info" },
  process: { icon: "list-outline", tone: "primary" },
  scheme: { icon: "ribbon-outline", tone: "success" },
};

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
      Alert.alert("Scan village first", "Please scan a village QR code before using Smart Assistance.");
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
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          response: {
            success: false,
            type: "smart_assistance",
            intent: "general",
            title: "Scheme Assistance Unavailable",
            summary: "Unable to reach Scheme Assistance right now. Please try again.",
            cards: [],
            sections: [],
            suggestions: [
              { label: "Search Schemes", query: "Show government schemes" },
              { label: "Student Schemes", query: "Show student schemes" },
            ],
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

  const showSchemePicker = (detailType: "eligibility" | "documents" | "application", response: AssistantResponse) => {
    const schemeCards = (response.cards || []).filter((card) => card.type === "scheme").slice(0, 4);

    if (!schemeCards.length) {
      sendMessage(detailType, detailType === "application" ? "How To Apply" : detailType === "documents" ? "Required Documents" : "Check Eligibility");
      return;
    }

    const title =
      detailType === "documents"
        ? "Choose Scheme For Documents"
        : detailType === "application"
        ? "Choose Scheme To Apply"
        : "Choose Scheme For Eligibility";

    const question =
      detailType === "documents"
        ? "Which scheme do you need documents for?"
        : detailType === "application"
        ? "Which scheme do you want to apply for?"
        : "Which scheme do you want eligibility for?";

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: detailType === "application" ? "How To Apply" : detailType === "documents" ? "Required Documents" : "Check Eligibility",
      },
      {
        id: `assistant-picker-${Date.now()}`,
        role: "assistant",
        response: {
          success: true,
          type: "smart_assistance",
          intent: "scheme",
          title,
          summary: "Select one scheme from the current results.",
          cards: [
            {
              type: "process",
              title: question,
              subtitle: "Choose one option",
              items: schemeCards.map((card) => card.title),
            },
          ],
          sections: [],
          suggestions: schemeCards.map((card) => ({
            label: card.title,
            query: buildDetailQuery(detailType, card.title),
          })),
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

  const renderHelpDeskHome = () => (
    <View style={themedStyles.homeWrap}>
      <View style={themedStyles.heroPanel}>
        <View style={themedStyles.heroTopRow}>
          <View style={themedStyles.heroIcon}>
            <Ionicons name="search-outline" size={26} color={colors.primary[500]} />
          </View>
          <View style={themedStyles.heroBadge}>
            <Text style={themedStyles.heroBadgeText}>Scheme Finder</Text>
          </View>
        </View>
        <Text style={themedStyles.heroTitle}>Find The Right Government Scheme</Text>
        <Text style={themedStyles.heroSub}>
          Choose a category or ask in simple words. Results are ranked using your village state and scheme details.
        </Text>
        <Pressable style={themedStyles.heroSearch} onPress={() => sendMessage("Show government schemes")}>
          <Ionicons name="sparkles-outline" size={18} color={colors.primary[500]} />
          <Text style={themedStyles.heroSearchText}>Start by choosing who the scheme is for</Text>
        </Pressable>
      </View>

      <View style={themedStyles.blockHeader}>
        <Text style={themedStyles.blockTitle}>Popular Categories</Text>
        <Text style={themedStyles.blockHint}>Tap one to search</Text>
      </View>
      <View style={themedStyles.categoryList}>
        {QUICK_CATEGORIES.map((category) => (
          <Pressable
            key={category.label}
            style={themedStyles.categoryCard}
            onPress={() => sendMessage(category.query)}
          >
            <View style={themedStyles.categoryIcon}>
              <Ionicons name={category.icon} size={20} color={colors.primary[500]} />
            </View>
            <View style={themedStyles.categoryCopy}>
              <Text style={themedStyles.categoryText}>{category.label}</Text>
              <Text style={themedStyles.categoryHint}>{category.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </Pressable>
        ))}
      </View>

      <View style={themedStyles.blockHeader}>
        <Text style={themedStyles.blockTitle}>Try A Search</Text>
        <Text style={themedStyles.blockHint}>Quick examples</Text>
      </View>
      <View style={themedStyles.questionList}>
        {SUGGESTED_QUESTIONS.map((question) => (
          <Pressable key={question} style={themedStyles.questionRow} onPress={() => sendMessage(question)}>
            <Text style={themedStyles.questionText}>{question}</Text>
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
            <Text style={themedStyles.headerTitle}>Scheme Assistance</Text>
            <Text style={themedStyles.headerSubtitle}>Government scheme help desk</Text>
          </View>
        </View>

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
                  <Text style={themedStyles.typingText}>Checking GramVartha records...</Text>
                </View>
              ) : null
            }
          />
        )}

        <View style={themedStyles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about government schemes..."
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
