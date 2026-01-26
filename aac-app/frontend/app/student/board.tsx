import { useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, ScrollView, StyleSheet, Platform, Image } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getPacks, getVocabItems, type Pack, type VocabItem } from "../../services/api";

type Tile = { 
  label: string; 
  say: string; 
  icon?: keyof typeof Ionicons.glyphMap;
  image_url?: string;
};
type Category = { 
  name: string; 
  color: string; 
  tiles: Tile[];
  image_url?: string;
};

/** Treat these as “symbol keypad tiles” (big, centered, no label/hint) */
const MATH_SYMBOLS = new Set(["+", "−", "-", "×", "*", "÷", "/", "=", "≠", "<", ">", "≤", "≥"]);
const isMathSymbol = (label: string) => MATH_SYMBOLS.has(label.trim());

function numberToWords(num: number): string {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  
  function convertHundreds(n: number): string {
    let result = "";
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " hundred ";
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      if (n % 10 !== 0) result += "-" + ones[n % 10];
    } else if (n >= 10) {
      result += teens[n - 10];
    } else if (n > 0) {
      result += ones[n];
    }
    
    return result.trim();
  }
  
  if (num === 0) return "zero";
  if (num < 0) return "negative " + numberToWords(-num);
  if (num < 1000) return convertHundreds(num);
  
  const billions = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;
  
  let result = "";
  
  if (billions > 0) {
    result += convertHundreds(billions) + " billion ";
  }
  if (millions > 0) {
    result += convertHundreds(millions) + " million ";
  }
  if (thousands > 0) {
    result += convertHundreds(thousands) + " thousand ";
  }
  if (remainder > 0) {
    result += convertHundreds(remainder);
  }
  
  return result.trim();
}

const PACKS: Record<string, Category[]> = {
  math: [
    {
      name: "Numbers",
      color: "#FFF2CC",
      tiles: [
        { label: "0", say: "zero" },
        { label: "1", say: "one" },
        { label: "2", say: "two" },
        { label: "3", say: "three" },
        { label: "4", say: "four" },
        { label: "5", say: "five" },
        { label: "6", say: "six" },
        { label: "7", say: "seven" },
        { label: "8", say: "eight" },
        { label: "9", say: "nine" },
      ],
    },
    {
      name: "Operators",
      color: "#CFE8FF",
      tiles: [
        { label: "+", say: "plus" },
        { label: "−", say: "minus" },
        { label: "=", say: "equals" },
        { label: "×", say: "times" },
        { label: "÷", say: "divide" },
      ],
    },
    {
      name: "Math Words",
      color: "#E6FFE6",
      tiles: [
        { label: "add", say: "add", icon: "add-circle-outline" },
        { label: "subtract", say: "subtract", icon: "remove-circle-outline" },
        { label: "plus", say: "plus", icon: "add-outline" },
        { label: "minus", say: "minus", icon: "remove-outline" },
        { label: "equals", say: "equals", icon: "git-compare-outline" },
        { label: "count", say: "count", icon: "list-outline" },
        { label: "more", say: "more", icon: "arrow-up-outline" },
        { label: "less", say: "less", icon: "arrow-down-outline" },
        { label: "same", say: "same", icon: "repeat-outline" },
        { label: "all", say: "all", icon: "albums-outline" },
        { label: "none", say: "none", icon: "close-circle-outline" },
        { label: "take away", say: "take away", icon: "trash-outline" },
        { label: "share", say: "share", icon: "share-social-outline" },
        { label: "group", say: "group", icon: "people-outline" },
      ],
    },
    {
      name: "Shapes",
      color: "#FFE6F0",
      tiles: [
        { label: "circle", say: "circle", icon: "ellipse-outline" },
        { label: "square", say: "square", icon: "square-outline" },
        { label: "triangle", say: "triangle", icon: "triangle-outline" },
      ],
    },
    {
      name: "Help",
      color: "#D6F5D6",
      tiles: [
        { label: "Repeat step", say: "Could you show me that step again?", icon: "refresh" },
        { label: "Slower please", say: "Can you go slower?", icon: "walk-outline" },
        { label: "I'm stuck", say: "I'm stuck.", icon: "hand-left-outline" },
      ],
    },
    {
      name: "Units",
      color: "#E3D7FF",
      tiles: [
        { label: "cm", say: "centimeters" },
        { label: "kg", say: "kilograms" },
        { label: "L", say: "liters" },
      ],
    },
  ],

  english: [
    {
      name: "Classroom",
      color: "#CFE8FF",
      tiles: [
        { label: "Can you repeat?", say: "Can you repeat?", icon: "refresh-outline" },
        { label: "Slower please", say: "Can you speak slower please?", icon: "speedometer-outline" },
        { label: "How to spell?", say: "How do you spell this?", icon: "text-outline" },
      ],
    },
    {
      name: "Writing",
      color: "#FFE2B8",
      tiles: [
        { label: "Sentence", say: "This is my sentence.", icon: "create-outline" },
        { label: "Paragraph", say: "This is my paragraph.", icon: "document-text-outline" },
        { label: "I want to read", say: "I want to read.", icon: "book-outline" },
      ],
    },
    {
      name: "Teacher said…",
      color: "#E3D7FF",
      tiles: [
        { label: "Teacher said…", say: "Teacher said", icon: "person-outline" },
        { label: "My idea is…", say: "My idea is", icon: "bulb-outline" },
      ],
    },
  ],

  help: [
    {
      name: "General",
      color: "#FFC7C7",
      tiles: [
        { label: "I need help", say: "I need help.", icon: "help-circle-outline" },
        { label: "Toilet", say: "I need the toilet.", icon: "water-outline" },
        { label: "Drink", say: "I need a drink.", icon: "cafe-outline" },
      ],
    },
  ],
};

export default function Board() {
  const params = useLocalSearchParams();
  const subject = (params.subject as string) || "english";
  
  // State for API data
  const [apiPacks, setApiPacks] = useState<Pack[]>([]);
  const [apiVocabItems, setApiVocabItems] = useState<VocabItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [packs, vocabItems] = await Promise.all([
          getPacks(),
          getVocabItems(),
        ]);
        setApiPacks(packs);
        setApiVocabItems(vocabItems);
        setIsOnline(true);
      } catch (error) {
        console.warn("Failed to fetch data from API, using offline mode:", error);
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Convert API data to Category format
  const apiCategories: Category[] = useMemo(() => {
    if (!isOnline || apiPacks.length === 0) return [];
    
    return apiPacks
      .filter(pack => pack.subject?.toLowerCase() === subject.toLowerCase())
      .map(pack => ({
        name: pack.name,
        color: pack.color || "#D6F5D6", // Default color
        image_url: pack.image_url,
        tiles: apiVocabItems
          .filter(item => item.pack_id === pack.id)
          .sort((a, b) => a.order - b.order)
          .map(item => ({
            label: item.label,
            say: item.say || item.label,
            icon: item.icon as keyof typeof Ionicons.glyphMap | undefined,
            image_url: item.image_url,
          })),
      }))
      .filter(cat => cat.tiles.length > 0); // Only include categories with tiles
  }, [apiPacks, apiVocabItems, subject, isOnline]);

  // Use API data if available, otherwise fallback to hardcoded PACKS
  const categories: Category[] = apiCategories.length > 0 
    ? apiCategories 
    : (PACKS[subject] ?? PACKS.english);

  const [active, setActive] = useState(0);
  const [sentence, setSentence] = useState<string[]>([]);
  const [numberBuffer, setNumberBuffer] = useState<string>("");
  const activeCat = categories[active];

  async function speakText(text: string) {
    if (!text) return;

    if (Platform.OS === "web") {
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return;
    }

    const Speech = await import("expo-speech");
    Speech.stop();
    Speech.speak(text, { rate: 0.95 });
  }

  const sentenceText = useMemo(() => sentence.join(" "), [sentence]);

    function isNumberTile(label: string) {
        const num = Number(label);
        return !isNaN(num) && label.trim() !== "";
    }

  return (
    // ✅ Make the whole page scrollable
    <ScrollView
      style={s.page}
      contentContainerStyle={s.pageContent}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {/* header */}
      <View style={s.topRow}>
        <Text style={s.title}>Student AAC Board</Text>
        <View style={s.subjectPill}>
          <Ionicons name="school-outline" size={16} />
          <Text style={s.subjectText}>{subject.toUpperCase()}</Text>
          {!isOnline && <Text style={s.offlineIndicator}> • OFFLINE</Text>}
        </View>
      </View>

      {/* sentence bar */}
      <View style={s.sentenceBox}>
        <Text style={s.sentenceLabel}>Sentence</Text>
        <Text style={s.sentenceValue}>{sentenceText || "Tap tiles to build a sentence"}</Text>

        <View style={s.actions}>
          <Pressable style={s.actionBtn} onPress={() => speakText(sentenceText)}>
            <Ionicons name="volume-high-outline" size={16} />
            <Text style={s.actionText}>Speak</Text>
          </Pressable>

          <Pressable style={s.actionBtn} onPress={() => {
            setSentence([]);
            setNumberBuffer("");
          }}>
            <Ionicons name="trash-outline" size={16} />
            <Text style={s.actionText}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {/* category pills (horizontal scroll ok) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pills}>
        {categories.map((c, i) => {
          const isOn = i === active;
          return (
            <Pressable
              key={c.name}
              onPress={() => setActive(i)}
              style={[s.pill, { backgroundColor: c.color, opacity: isOn ? 1 : 0.55 }]}
            >
              <Text style={s.pillText}>{c.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* tiles */}
      <View style={s.tilesArea}>
        <View style={[s.rowHeader, { backgroundColor: activeCat.color }]}>
          <Text style={s.rowHeaderText}>{activeCat.name}</Text>
        </View>

        <View style={s.tilesGrid}>
{activeCat.tiles.map((t) => {
  const symbolMode = !t.icon && isMathSymbol(t.label);
  const numberMode = isNumberTile(t.label);

  return (
    <Pressable
      key={t.label}
      style={[
        s.tile,
        (symbolMode || numberMode) && s.tileSymbol,
      ]}
      onPress={() => {
        if (numberMode) {
          // Building multi-digit numbers
          const newBuffer = numberBuffer + t.label;
          setNumberBuffer(newBuffer);
          const numValue = parseInt(newBuffer, 10);
          const spokenText = numberToWords(numValue);
          speakText(spokenText);
          
          // Update sentence with the current number
          setSentence((prev) => {
            const newSentence = [...prev];
            if (newSentence.length > 0 && isNumberTile(newSentence[newSentence.length - 1])) {
              newSentence[newSentence.length - 1] = newBuffer;
            } else {
              newSentence.push(newBuffer);
            }
            return newSentence;
          });
        } else {
          // Reset number buffer when non-number is pressed
          setNumberBuffer("");
          setSentence((prev) => [...prev, t.label]);
          speakText(t.say);
        }
      }}
    >
      <View
        style={[
          s.tileIcon,
          (symbolMode || numberMode) && s.tileIconSymbol,
        ]}
      >
        {t.image_url ? (
          <Image source={{ uri: t.image_url }} style={s.tileImage} />
        ) : t.icon ? (
          <Ionicons name={t.icon} size={18} />
        ) : (
          <Text
            style={[
              s.symbol,
              (symbolMode || numberMode) && s.symbolBig,
            ]}
          >
            {t.label}
          </Text>
        )}
      </View>

      {/* ❌ hide label + hint for numbers & symbols */}
      {!symbolMode && !numberMode && (
        <>
          <Text style={s.tileLabel}>{t.label}</Text>
          <Text style={s.tileHint}>Tap to speak + add</Text>
        </>
      )}
    </Pressable>
  );
})}

        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // ✅ ScrollView uses style + contentContainerStyle
  page: { flex: 1, backgroundColor: "#F7F7FB" },
  pageContent: { padding: 16, gap: 12 },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "800" },
  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
  },
  subjectText: { fontWeight: "800", letterSpacing: 0.5 },
  offlineIndicator: { 
    fontWeight: "600", 
    letterSpacing: 0.5, 
    color: "#FF6B6B",
    fontSize: 10,
  },

  sentenceBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    gap: 8,
  },
  sentenceLabel: { fontWeight: "800", color: "#222" },
  sentenceValue: { color: "#444" },

  actions: { flexDirection: "row", gap: 10, marginTop: 6, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    backgroundColor: "#fff",
  },
  actionText: { fontWeight: "700" },

  pills: { gap: 10, paddingVertical: 2 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  pillText: { fontWeight: "800" },

  // ✅ no flex:1 here (let page scroll naturally)
  tilesArea: { gap: 10 },

  rowHeader: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  rowHeaderText: { fontWeight: "900" },

  tilesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { fontSize: 18, fontWeight: "900" },
  tileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },

  tileLabel: { fontSize: 16, fontWeight: "900" },
  tileHint: { fontSize: 12, color: "#666" },

  // Symbol keypad look (big + centered)
  tileSymbol: {
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  tileIconSymbol: {
    width: "100%",
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F0F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  symbolBig: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 44,
  },
});
