import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Tile type definition
type VocabTile = {
  label: string;
  say: string;
  color: string;
  icon?: any;
  textColor?: string;
  imageUrl?: string;
};

// Frequently used core vocabulary with Proloquo2Go color scheme
const INITIAL_CORE_VOCAB: VocabTile[] = [
  // Pronouns (Orange)
  { label: "I", say: "I", color: "#FFB366", icon: "person" },
  { label: "you", say: "you", color: "#FFB366", icon: "people" },
  { label: "he", say: "he", color: "#FFB366", icon: "male" },
  { label: "she", say: "she", color: "#FFB366", icon: "female" },
  { label: "we", say: "we", color: "#FFB366", icon: "people-circle" },
  { label: "they", say: "they", color: "#FFB366", icon: "people-outline" },
  { label: "it", say: "it", color: "#FFB366" },
  { label: "this", say: "this", color: "#FFB366" },
  { label: "that", say: "that", color: "#FFB366" },
  
  // Core verbs (Pink/Purple)
  { label: "is", say: "is", color: "#FFB3E6" },
  { label: "can", say: "can", color: "#FFB3E6" },
  { label: "will", say: "will", color: "#FFB3E6" },
  { label: "do", say: "do", color: "#E6B3FF", icon: "hand-left" },
  { label: "have", say: "have", color: "#E6B3FF", icon: "gift" },
  { label: "want", say: "want", color: "#FFB3E6", icon: "heart" },
  { label: "like", say: "like", color: "#FFB3E6", icon: "heart-outline" },
  { label: "need", say: "need", color: "#FFB3E6", icon: "alert-circle" },
  { label: "get", say: "get", color: "#E6B3FF", icon: "hand-right" },
  { label: "stop", say: "stop", color: "#FFB3E6", icon: "stop-circle" },
  { label: "go", say: "go", color: "#FFB3E6", icon: "arrow-forward" },
  { label: "come", say: "come", color: "#E6B3FF", icon: "return-up-back" },
  { label: "take", say: "take", color: "#E6B3FF", icon: "hand-left" },
  { label: "see", say: "see", color: "#FFB3E6", icon: "eye" },
  { label: "look", say: "look", color: "#FFB3E6", icon: "search" },
  { label: "make", say: "make", color: "#E6B3FF", icon: "construct" },
  { label: "know", say: "know", color: "#FFB3E6", icon: "bulb" },
  { label: "think", say: "think", color: "#FFB3E6", icon: "cloud" },
  { label: "say", say: "say", color: "#E6B3FF", icon: "chatbox" },
  { label: "give", say: "give", color: "#E6B3FF", icon: "gift-outline" },
  { label: "eat", say: "eat", color: "#FFB3E6", icon: "restaurant" },
  { label: "help", say: "help", color: "#FFB3E6", icon: "hand-right-outline" },
  { label: "play", say: "play", color: "#E6B3FF", icon: "game-controller" },
  
  // Prepositions & Location (Green)
  { label: "to", say: "to", color: "#A3E6A3", icon: "arrow-forward-outline" },
  { label: "with", say: "with", color: "#A3E6A3" },
  { label: "in", say: "in", color: "#A3E6A3", icon: "enter" },
  { label: "for", say: "for", color: "#A3E6A3" },
  { label: "on", say: "on", color: "#A3E6A3" },
  { label: "here", say: "here", color: "#A3E6A3", icon: "location" },
  { label: "there", say: "there", color: "#A3E6A3", icon: "navigate" },
  { label: "up", say: "up", color: "#A3E6A3", icon: "arrow-up" },
  { label: "out", say: "out", color: "#A3E6A3", icon: "exit" },
  { label: "off", say: "off", color: "#A3E6A3" },
  { label: "down", say: "down", color: "#A3E6A3", icon: "arrow-down" },
  { label: "now", say: "now", color: "#99CCFF", icon: "time" },
  
  // Common words (Light blue/cyan)
  { label: "the", say: "the", color: "#FFFFFF" },
  { label: "a", say: "a", color: "#FFFFFF" },
  { label: "of", say: "of", color: "#A3E6A3" },
  { label: "and", say: "and", color: "#333333", textColor: "#FFFFFF", icon: "add" },
  { label: "but", say: "but", color: "#FFE0B3" },
  { label: "or", say: "or", color: "#FFD699" },
  { label: "because", say: "because", color: "#FFE0B3" },
  
  // Questions & modifiers (Various colors)
  { label: "what", say: "what", color: "#FFE6B3", icon: "help-circle" },
  { label: "where", say: "where", color: "#FFE6B3", icon: "location-outline" },
  { label: "who", say: "who", color: "#FFE6B3", icon: "person-outline" },
  { label: "not", say: "not", color: "#FFB3B3", icon: "close-circle" },
  { label: "more", say: "more", color: "#99CCFF", icon: "add-circle" },
  { label: "all done", say: "all done", color: "#99CCFF", icon: "checkmark-done" },
  { label: "good", say: "good", color: "#99CCFF", icon: "happy" },
  { label: "different", say: "different", color: "#99CCFF" },
  { label: "bad", say: "bad", color: "#99CCFF", icon: "sad" },
  { label: "all", say: "all", color: "#99CCFF", icon: "apps" },
  { label: "some", say: "some", color: "#99CCFF" },
];

// Category-specific vocabularies
const INITIAL_CATEGORY_VOCAB: Record<string, VocabTile[]> = {
  people: [
    { label: "mom", say: "mom", color: "#FFB366", icon: "woman" },
    { label: "dad", say: "dad", color: "#FFB366", icon: "man" },
    { label: "teacher", say: "teacher", color: "#FFB366", icon: "school" },
    { label: "friend", say: "friend", color: "#FFB366", icon: "people" },
    { label: "student", say: "student", color: "#FFB366", icon: "person" },
    { label: "brother", say: "brother", color: "#FFB366", icon: "male" },
    { label: "sister", say: "sister", color: "#FFB366", icon: "female" },
    { label: "family", say: "family", color: "#FFB366", icon: "people-circle" },
    { label: "classmate", say: "classmate", color: "#FFB366", icon: "people-outline" },
    { label: "helper", say: "helper", color: "#FFB366", icon: "hand-right" },
    { label: "doctor", say: "doctor", color: "#FFB366", icon: "medkit" },
    { label: "nurse", say: "nurse", color: "#FFB366", icon: "medical" },
  ],
  
  things: [
    { label: "book", say: "book", color: "#D4A574", icon: "book" },
    { label: "pencil", say: "pencil", color: "#D4A574", icon: "pencil" },
    { label: "paper", say: "paper", color: "#D4A574", icon: "document" },
    { label: "computer", say: "computer", color: "#D4A574", icon: "laptop" },
    { label: "tablet", say: "tablet", color: "#D4A574", icon: "tablet-portrait" },
    { label: "phone", say: "phone", color: "#D4A574", icon: "phone-portrait" },
    { label: "bag", say: "bag", color: "#D4A574", icon: "bag" },
    { label: "water bottle", say: "water bottle", color: "#D4A574", icon: "water" },
    { label: "toy", say: "toy", color: "#D4A574", icon: "game-controller" },
    { label: "ball", say: "ball", color: "#D4A574", icon: "football" },
    { label: "chair", say: "chair", color: "#D4A574", icon: "square" },
    { label: "table", say: "table", color: "#D4A574", icon: "grid" },
  ],
  
  food: [
    { label: "apple", say: "apple", color: "#FFB366", icon: "nutrition" },
    { label: "banana", say: "banana", color: "#FFB366", icon: "nutrition" },
    { label: "sandwich", say: "sandwich", color: "#FFB366", icon: "fast-food" },
    { label: "pizza", say: "pizza", color: "#FFB366", icon: "pizza" },
    { label: "water", say: "water", color: "#FFB366", icon: "water" },
    { label: "juice", say: "juice", color: "#FFB366", icon: "wine" },
    { label: "milk", say: "milk", color: "#FFB366", icon: "cafe" },
    { label: "snack", say: "snack", color: "#FFB366", icon: "fast-food-outline" },
    { label: "lunch", say: "lunch", color: "#FFB366", icon: "restaurant" },
    { label: "breakfast", say: "breakfast", color: "#FFB366", icon: "sunny" },
    { label: "dinner", say: "dinner", color: "#FFB366", icon: "moon" },
    { label: "cookie", say: "cookie", color: "#FFB366", icon: "ellipse" },
  ],
  
  places: [
    { label: "school", say: "school", color: "#A3E6A3", icon: "school" },
    { label: "home", say: "home", color: "#A3E6A3", icon: "home" },
    { label: "classroom", say: "classroom", color: "#A3E6A3", icon: "book" },
    { label: "bathroom", say: "bathroom", color: "#A3E6A3", icon: "water" },
    { label: "playground", say: "playground", color: "#A3E6A3", icon: "fitness" },
    { label: "library", say: "library", color: "#A3E6A3", icon: "library" },
    { label: "cafeteria", say: "cafeteria", color: "#A3E6A3", icon: "restaurant" },
    { label: "office", say: "office", color: "#A3E6A3", icon: "business" },
    { label: "gym", say: "gym", color: "#A3E6A3", icon: "barbell" },
    { label: "park", say: "park", color: "#A3E6A3", icon: "leaf" },
    { label: "outside", say: "outside", color: "#A3E6A3", icon: "sunny" },
    { label: "inside", say: "inside", color: "#A3E6A3", icon: "enter" },
  ],
  
  actions: [
    { label: "run", say: "run", color: "#E6B3FF", icon: "walk" },
    { label: "walk", say: "walk", color: "#E6B3FF", icon: "walk" },
    { label: "sit", say: "sit", color: "#E6B3FF", icon: "person" },
    { label: "stand", say: "stand", color: "#E6B3FF", icon: "person" },
    { label: "jump", say: "jump", color: "#E6B3FF", icon: "arrow-up" },
    { label: "read", say: "read", color: "#E6B3FF", icon: "book" },
    { label: "write", say: "write", color: "#E6B3FF", icon: "create" },
    { label: "draw", say: "draw", color: "#E6B3FF", icon: "brush" },
    { label: "listen", say: "listen", color: "#E6B3FF", icon: "ear" },
    { label: "talk", say: "talk", color: "#E6B3FF", icon: "chatbubbles" },
    { label: "ask", say: "ask", color: "#E6B3FF", icon: "help-circle" },
    { label: "answer", say: "answer", color: "#E6B3FF", icon: "checkmark-circle" },
  ],
  
  math: [
    { label: "+", say: "plus", color: "#FFE6B3" },
    { label: "−", say: "minus", color: "#FFE6B3" },
    { label: "×", say: "times", color: "#FFE6B3" },
    { label: "÷", say: "divide", color: "#FFE6B3" },
    { label: "=", say: "equals", color: "#FFE6B3" },
    { label: "number", say: "number", color: "#FFE6B3", icon: "keypad" },
    { label: "count", say: "count", color: "#FFE6B3", icon: "list" },
    { label: "add", say: "add", color: "#FFE6B3", icon: "add" },
    { label: "subtract", say: "subtract", color: "#FFE6B3", icon: "remove" },
    { label: "I don't understand", say: "I don't understand", color: "#FFE6B3", icon: "help-circle" },
    { label: "Can you repeat?", say: "Can you repeat?", color: "#FFE6B3", icon: "refresh" },
    { label: "I'm stuck", say: "I'm stuck", color: "#FFE6B3", icon: "hand-left" },
    { label: "0", say: "0", color: "#FFE6B3" },
    { label: "1", say: "1", color: "#FFE6B3" },
    { label: "2", say: "2", color: "#FFE6B3" },
    { label: "3", say: "3", color: "#FFE6B3" },
    { label: "4", say: "4", color: "#FFE6B3" },
    { label: "5", say: "5", color: "#FFE6B3" },
    { label: "6", say: "6", color: "#FFE6B3" },
    { label: "7", say: "7", color: "#FFE6B3" },
    { label: "8", say: "8", color: "#FFE6B3" },
    { label: "9", say: "9", color: "#FFE6B3" },
  ],
  
  science: [
    { label: "experiment", say: "experiment", color: "#7DD3C0", icon: "flask" },
    { label: "observe", say: "observe", color: "#7DD3C0", icon: "eye" },
    { label: "measure", say: "measure", color: "#7DD3C0", icon: "resize" },
    { label: "plant", say: "plant", color: "#7DD3C0", icon: "leaf" },
    { label: "animal", say: "animal", color: "#7DD3C0", icon: "paw" },
    { label: "water", say: "water", color: "#7DD3C0", icon: "water" },
    { label: "light", say: "light", color: "#7DD3C0", icon: "sunny" },
    { label: "heat", say: "heat", color: "#7DD3C0", icon: "flame" },
    { label: "cold", say: "cold", color: "#7DD3C0", icon: "snow" },
    { label: "question", say: "I have a question", color: "#7DD3C0", icon: "help-circle" },
    { label: "hypothesis", say: "My hypothesis is", color: "#7DD3C0", icon: "bulb" },
    { label: "result", say: "The result is", color: "#7DD3C0", icon: "checkmark-circle" },
  ],
  
  english: [
    { label: "read", say: "read", color: "#99CCFF", icon: "book" },
    { label: "write", say: "write", color: "#99CCFF", icon: "create" },
    { label: "spell", say: "How do you spell this?", color: "#99CCFF", icon: "text" },
    { label: "word", say: "word", color: "#99CCFF", icon: "text" },
    { label: "sentence", say: "sentence", color: "#99CCFF", icon: "reader" },
    { label: "story", say: "story", color: "#99CCFF", icon: "book-outline" },
    { label: "letter", say: "letter", color: "#99CCFF", icon: "at" },
    { label: "capital", say: "capital letter", color: "#99CCFF", icon: "arrow-up" },
    { label: "lowercase", say: "lowercase", color: "#99CCFF", icon: "arrow-down" },
    { label: "repeat", say: "Can you repeat?", color: "#FFE6B3", icon: "refresh" },
    { label: "slower", say: "Can you speak slower?", color: "#FFE6B3", icon: "speedometer" },
    { label: "finish", say: "I finished", color: "#A3E6A3", icon: "checkmark-done" },
  ],
  
  questions: [
    { label: "what", say: "what", color: "#E6B3D6", icon: "help-circle" },
    { label: "where", say: "where", color: "#E6B3D6", icon: "location" },
    { label: "when", say: "when", color: "#E6B3D6", icon: "time" },
    { label: "who", say: "who", color: "#E6B3D6", icon: "person" },
    { label: "why", say: "why", color: "#E6B3D6", icon: "help-circle-outline" },
    { label: "how", say: "how", color: "#E6B3D6", icon: "help" },
    { label: "which", say: "which", color: "#E6B3D6", icon: "list" },
    { label: "can I", say: "can I", color: "#E6B3D6", icon: "hand-right" },
    { label: "may I", say: "may I", color: "#E6B3D6", icon: "hand-left" },
    { label: "I wonder", say: "I wonder", color: "#E6B3D6", icon: "cloud" },
    { label: "tell me", say: "tell me", color: "#E6B3D6", icon: "chatbubble" },
    { label: "show me", say: "show me", color: "#E6B3D6", icon: "eye" },
  ],
  
  help: [
    { label: "help", say: "help", color: "#FFB3B3", icon: "hand-right" },
    { label: "bathroom", say: "bathroom", color: "#FFB3B3", icon: "water" },
    { label: "water", say: "water", color: "#FFB3B3", icon: "water" },
    { label: "break", say: "break", color: "#FFB3B3", icon: "pause" },
    { label: "tired", say: "tired", color: "#FFB3B3", icon: "moon" },
    { label: "sick", say: "sick", color: "#FFB3B3", icon: "medical" },
    { label: "hurt", say: "hurt", color: "#FFB3B3", icon: "bandage" },
    { label: "hungry", say: "hungry", color: "#FFB3B3", icon: "restaurant" },
    { label: "thirsty", say: "thirsty", color: "#FFB3B3", icon: "water" },
    { label: "hot", say: "hot", color: "#FFB3B3", icon: "sunny" },
    { label: "cold", say: "cold", color: "#FFB3B3", icon: "snow" },
    { label: "quiet please", say: "quiet please", color: "#FFB3B3", icon: "volume-mute" },
  ],
};

// Subject folders for bottom navigation (base folders)
const BASE_FOLDERS = [
  { key: "home", label: "Home", icon: "home", color: "#4CAF50" },
  { key: "people", label: "People", icon: "people", color: "#FFB366" },
  { key: "things", label: "Things", icon: "cube", color: "#FFD699" },
  { key: "food", label: "Food", icon: "restaurant", color: "#FF9966" },
  { key: "places", label: "Places", icon: "location", color: "#A3E6A3" },
  { key: "actions", label: "Actions", icon: "walk", color: "#E6B3FF" },
  { key: "math", label: "Math", icon: "calculator", color: "#FFE6B3" },
  { key: "science", label: "Science", icon: "flask", color: "#A3E6C6" },
  { key: "english", label: "English", icon: "book", color: "#99CCFF" },
  { key: "questions", label: "Questions?", icon: "help-circle", color: "#FFB3E6" },
  { key: "help", label: "Help", icon: "medkit", color: "#FFB3B3" },
];

export default function Home() {
  const [sentence, setSentence] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>("home");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const [draggedTileIndex, setDraggedTileIndex] = useState<number>(-1);
  const [editingTile, setEditingTile] = useState<VocabTile | null>(null);
  const [editingTileIndex, setEditingTileIndex] = useState<number>(-1);
  const [originalTile, setOriginalTile] = useState<VocabTile | null>(null);
  const [showAddWordModal, setShowAddWordModal] = useState<boolean>(false);
  
  // State for vocabulary (so we can update it)
  const [coreVocab, setCoreVocab] = useState<VocabTile[]>(INITIAL_CORE_VOCAB);
  const [categoryVocab, setCategoryVocab] = useState<Record<string, VocabTile[]>>(INITIAL_CATEGORY_VOCAB);
  
  // Form states
  const [formLabel, setFormLabel] = useState<string>("");
  const [formSay, setFormSay] = useState<string>("");
  const [formColor, setFormColor] = useState<string>("#FFB366");
  const [formIcon, setFormIcon] = useState<string>("");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  
  // Edit form states
  const [editLabel, setEditLabel] = useState<string>("");
  const [editSay, setEditSay] = useState<string>("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  
  // Add word category selection
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Custom folders state
  const [customFolders, setCustomFolders] = useState<Array<{key: string, label: string, icon: string, color: string}>>([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>("#A3E6A3");
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>("folder");

  const TILES_PER_PAGE = Platform.OS === 'web' ? 18 : 15; // Web: 3 rows × 6 columns, Mobile: 5 rows × 3 columns

  // Combined folders list (base + custom)
  const SUBJECT_FOLDERS = useMemo(() => [...BASE_FOLDERS, ...customFolders], [customFolders]);

  const sentenceText = useMemo(() => sentence.join(" "), [sentence]);
  
  // Get the current vocabulary to display
  const currentVocab = useMemo(() => {
    if (activeFolder === "home") {
      return coreVocab;
    }
    return categoryVocab[activeFolder] || coreVocab;
  }, [activeFolder, coreVocab, categoryVocab]);

  // Paginated vocabulary
  const paginatedVocab = useMemo(() => {
    const startIdx = currentPage * TILES_PER_PAGE;
    const endIdx = startIdx + TILES_PER_PAGE;
    return currentVocab.slice(startIdx, endIdx);
  }, [currentVocab, currentPage]);

  const totalPages = Math.ceil(currentVocab.length / TILES_PER_PAGE);

  // Reset to first page when changing folders
  useMemo(() => {
    setCurrentPage(0);
    setReorderMode(false);
    setDraggedTileIndex(-1);
  }, [activeFolder]);

  function numberToWords(num: number): string {
    if (num === 0) return "zero";
    
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

  async function speakText(text: string) {
    if (!text) return;

    // If it's a pure number, convert to words
    let textToSpeak = text;
    if (/^\d+$/.test(text)) {
      const num = parseInt(text, 10);
      if (!isNaN(num)) {
        textToSpeak = numberToWords(num);
      }
    }

    if (Platform.OS === "web") {
      const u = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return;
    }

    const Speech = await import("expo-speech");
    Speech.stop();
    Speech.speak(textToSpeak, { rate: 0.95 });
  }

  function isNumber(str: string): boolean {
    return /^\d+$/.test(str);
  }

  function handleTilePress(tile: VocabTile) {
    // Check if current tile is a number and last item in sentence is also a number
    if (isNumber(tile.label) && sentence.length > 0) {
      const lastItem = sentence[sentence.length - 1];
      if (isNumber(lastItem)) {
        // Concatenate numbers
        const newNumber = lastItem + tile.label;
        setSentence((prev) => [...prev.slice(0, -1), newNumber]);
        speakText(newNumber);
        return;
      }
    }
    
    // Normal behavior: add to sentence
    setSentence((prev) => [...prev, tile.label]);
    speakText(tile.say);
  }

  return (
    <View style={s.page}>
      {/* Top Bar - Home button and sentence display */}
      <View style={s.topBar}>
        <Pressable 
          style={s.homeBtn}
          onPress={() => setActiveFolder("home")}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </Pressable>
        <View style={s.sentenceDisplay}>
          <Text style={s.sentenceText} numberOfLines={1}>
            {sentenceText || ""}
          </Text>
        </View>
        <Pressable 
          style={s.settingsBtn}
          onPress={() => {
            setEditMode(!editMode);
            if (editMode) {
              // Exiting edit mode - also exit reorder mode
              setReorderMode(false);
              setDraggedTileIndex(-1);
            }
          }}
        >
          <Ionicons name={editMode ? "checkmark" : "settings"} size={24} color="#333" />
        </Pressable>
      </View>

      {/* Sentence Actions */}
      <View style={s.actionBar}>
        <Pressable 
          style={s.speakBtn} 
          onPress={() => speakText(sentenceText)}
        >
          <Ionicons name="volume-high" size={20} color="#fff" />
          <Text style={s.speakText}>Speak</Text>
        </Pressable>
        <Pressable 
          style={s.clearBtn}
          onPress={() => setSentence([])}
        >
          <Ionicons name="backspace" size={20} color="#666" />
          <Text style={s.clearText}>Clear</Text>
        </Pressable>
        
        {editMode && (
          <Pressable 
            style={s.addBtn}
            onPress={() => setShowAddWordModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#4CAF50" />
            <Text style={s.addText}>Add Word</Text>
          </Pressable>
        )}
        
        {editMode && activeFolder !== "home" && (
          <Pressable 
            style={[s.addBtn, reorderMode && s.reorderBtnActive]}
            onPress={() => setReorderMode(!reorderMode)}
          >
            <Ionicons name="swap-vertical" size={20} color={reorderMode ? "#2196F3" : "#FF9800"} />
            <Text style={[s.addText, reorderMode && s.reorderTextActive]}>Reorder</Text>
          </Pressable>
        )}
      </View>

      {/* Main vocabulary grid - NO SCROLLVIEW */}
      <View style={s.vocabContainer}>
        <View style={s.vocabGrid}>
          {paginatedVocab.map((tile, idx) => {
            const actualIndex = currentPage * TILES_PER_PAGE + idx;
            const isDragged = draggedTileIndex === actualIndex;
            // Create a stable unique key based on content and position in full array
            const tileKey = `${activeFolder}-${actualIndex}-${tile.label}-${tile.say}`;
            return (
            <Pressable
              key={tileKey}
              style={[s.vocabTile, { backgroundColor: tile.color }, isDragged && s.tileDragged]}
              onPress={() => {
                if (editMode && reorderMode && activeFolder !== "home") {
                  // Handle reordering
                  if (draggedTileIndex === -1) {
                    // Select tile to move
                    setDraggedTileIndex(actualIndex);
                  } else if (draggedTileIndex === actualIndex) {
                    // Deselect
                    setDraggedTileIndex(-1);
                  } else {
                    // Move tile to new position
                    const newVocab = activeFolder === "home" ? [...coreVocab] : [...(categoryVocab[activeFolder] || [])];
                    
                    // Remove the dragged tile
                    const [movedTile] = newVocab.splice(draggedTileIndex, 1);
                    
                    // Insert at new position
                    // If moving forward, the index shifts down by 1 after removal
                    const insertIndex = draggedTileIndex < actualIndex ? actualIndex - 1 : actualIndex;
                    newVocab.splice(insertIndex, 0, movedTile);
                    
                    if (activeFolder === "home") {
                      setCoreVocab(newVocab);
                    } else {
                      const newCategoryVocab = {...categoryVocab};
                      newCategoryVocab[activeFolder] = newVocab;
                      setCategoryVocab(newCategoryVocab);
                    }
                    setDraggedTileIndex(-1);
                  }
                } else if (editMode) {
                  setOriginalTile({...tile});
                  setEditingTile({...tile});
                  setEditingTileIndex(actualIndex);
                  setEditLabel(tile.label);
                  setEditSay(tile.say);
                  setEditImageUrl(tile.imageUrl || "");
                  setEditCategory(activeFolder);
                } else {
                  handleTilePress(tile);
                }
              }}
              onLongPress={() => {
                if (activeFolder !== "home" && editMode) {
                  setReorderMode(true);
                  setDraggedTileIndex(actualIndex);
                }
              }}
            >
              {tile.imageUrl ? (
                <Image 
                  source={{ uri: tile.imageUrl }} 
                  style={s.tileImage}
                  resizeMode="contain"
                />
              ) : tile.icon ? (
                <Ionicons 
                  name={tile.icon as any} 
                  size={Platform.OS === 'web' ? 32 : 28} 
                  color={tile.textColor || "#333"} 
                />
              ) : null}
              <Text style={[s.vocabLabel, tile.textColor && { color: tile.textColor }]}>
                {tile.label}
              </Text>
              {editMode && reorderMode && activeFolder !== "home" && (
                <View style={s.reorderIndicator}>
                  <Ionicons 
                    name={isDragged ? "checkmark-circle" : "move"}
                    size={20} 
                    color={isDragged ? "#4CAF50" : "#2196F3"}
                  />
                </View>
              )}
              {editMode && !reorderMode && (
                <>
                  <Ionicons 
                    name="create" 
                    size={16} 
                    color="#666" 
                    style={s.editIcon}
                  />
                  <Pressable
                    style={s.deleteBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      // Delete the tile
                      if (activeFolder === "home") {
                        const newVocab = coreVocab.filter((_, i) => i !== actualIndex);
                        setCoreVocab(newVocab);
                      } else {
                        const newCategoryVocab = {...categoryVocab};
                        const folderVocab = [...(newCategoryVocab[activeFolder] || [])];
                        folderVocab.splice(actualIndex, 1);
                        newCategoryVocab[activeFolder] = folderVocab;
                        setCategoryVocab(newCategoryVocab);
                      }
                    }}
                  >
                    <Ionicons 
                      name="trash" 
                      size={16} 
                      color="#ff4444" 
                    />
                  </Pressable>
                </>
              )}
            </Pressable>
          );
          })}
        </View>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <View style={s.paginationBar}>
            <Pressable 
              style={[s.pageBtn, currentPage === 0 && s.pageBtnDisabled]}
              onPress={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <Ionicons name="chevron-back" size={24} color={currentPage === 0 ? "#ccc" : "#333"} />
              <Text style={[s.pageBtnText, currentPage === 0 && s.pageBtnTextDisabled]}>Previous</Text>
            </Pressable>
            
            <Text style={s.pageIndicator}>
              Page {currentPage + 1} of {totalPages}
            </Text>
            
            <Pressable 
              style={[s.pageBtn, currentPage === totalPages - 1 && s.pageBtnDisabled]}
              onPress={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              <Text style={[s.pageBtnText, currentPage === totalPages - 1 && s.pageBtnTextDisabled]}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages - 1 ? "#ccc" : "#333"} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Bottom navigation - Subject folders */}
      <View style={s.bottomNav}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.folderRow}
        >
          {SUBJECT_FOLDERS.map((folder) => {
            const isActive = folder.key === activeFolder;
            return (
              <Pressable
                key={folder.key}
                style={[
                  s.folderBtn, 
                  { 
                    backgroundColor: folder.color,
                    opacity: isActive ? 1 : 0.7,
                    borderColor: isActive ? "#000" : "#333"
                  }
                ]}
                onPress={() => setActiveFolder(folder.key)}
              >
                <Ionicons name={folder.icon as any} size={20} color="#333" />
                <Text style={s.folderLabel}>{folder.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Edit Tile Modal */}
      {editingTile && (
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalScrollContent}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Edit Tile: {originalTile?.label || editingTile.label}</Text>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Label (displayed text):</Text>
                <TextInput
                  style={s.textInput}
                  value={editLabel}
                  onChangeText={setEditLabel}
                  placeholder="e.g., hello, teacher, happy"
                />
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Says (spoken text):</Text>
                <TextInput
                  style={s.textInput}
                  value={editSay}
                  onChangeText={setEditSay}
                  placeholder="e.g., hello, I am happy"
                />
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Color:</Text>
                <View style={s.colorPicker}>
                  {['#FFB366', '#FFB3E6', '#E6B3FF', '#A3E6A3', '#A3E6C6', '#99CCFF', '#FFE6B3', '#FFE0B3', '#FFF2CC', '#FFB3B3', '#FFFFFF', '#FFD699', '#E6B3D6'].map((color) => (
                    <Pressable
                      key={color}
                      style={[s.colorOption, { backgroundColor: color, borderColor: editingTile.color === color ? '#000' : '#ccc', borderWidth: editingTile.color === color ? 3 : 1 }]}
                      onPress={() => {
                        setEditingTile({...editingTile, color: color});
                      }}
                    />
                  ))}
                </View>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Category*:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
                  {SUBJECT_FOLDERS.map((folder) => (
                    <Pressable
                      key={folder.key}
                      style={[s.categoryOption, editCategory === folder.key && s.categoryOptionSelected]}
                      onPress={() => setEditCategory(folder.key)}
                    >
                      <Ionicons name={folder.icon as any} size={16} color="#333" />
                      <Text style={s.categoryOptionText}>{folder.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={s.helperText}>Select which folder this word belongs to</Text>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Icon (optional):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.iconScroll}>
                  <Pressable
                    style={[s.iconOption, !editingTile.icon && !editingTile.imageUrl && s.iconOptionSelected]}
                    onPress={() => {
                      setEditingTile({...editingTile, icon: undefined, imageUrl: undefined});
                    }}
                  >
                    <Text style={s.iconOptionText}>None</Text>
                  </Pressable>
                  {['person', 'people', 'male', 'female', 'hand-left', 'hand-right', 'heart', 'star', 'home', 'school', 'book', 'create', 'restaurant', 'cafe', 'water', 'sunny', 'moon', 'flash', 'leaf', 'flower', 'paw', 'car', 'airplane', 'basketball', 'football', 'game-controller', 'musical-notes', 'camera', 'phone-portrait', 'laptop', 'calculator', 'flask', 'eyeglasses', 'shirt', 'gift', 'balloon', 'happy', 'sad', 'alert-circle', 'checkmark-circle', 'help-circle', 'time', 'location'].map((iconName) => (
                    <Pressable
                      key={iconName}
                      style={[s.iconOption, editingTile.icon === iconName && s.iconOptionSelected]}
                      onPress={() => {
                        setEditingTile({...editingTile, icon: iconName, imageUrl: undefined});
                      }}
                    >
                      <Ionicons name={iconName as any} size={24} color="#333" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Or use Image URL:</Text>
                <TextInput
                  style={s.textInput}
                  value={editImageUrl}
                  onChangeText={(text) => {
                    setEditImageUrl(text);
                    if (text) {
                      setEditingTile({...editingTile, icon: undefined, imageUrl: text});
                    }
                  }}
                  placeholder="e.g., https://example.com/image.png"
                />
                <Text style={s.helperText}>Paste an image URL to use a custom image instead of an icon</Text>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Or upload from device:</Text>
                <View style={s.imagePickerButtons}>
                  <Pressable 
                    style={s.imagePickerBtn}
                    onPress={async () => {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                      });
                      if (!result.canceled && result.assets[0]) {
                        const uri = result.assets[0].uri;
                        setEditImageUrl(uri);
                        setEditingTile({...editingTile, icon: undefined, imageUrl: uri});
                      }
                    }}
                  >
                    <Ionicons name="images" size={20} color="#4CAF50" />
                    <Text style={s.imagePickerBtnText}>Gallery</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={s.imagePickerBtn}
                    onPress={async () => {
                      if (Platform.OS === 'web') {
                        // Request camera permissions first
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                          alert('Camera permission is required to take photos');
                          return;
                        }
                      }
                      const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                        cameraType: ImagePicker.CameraType.back,
                      });
                      if (!result.canceled && result.assets[0]) {
                        const uri = result.assets[0].uri;
                        setEditImageUrl(uri);
                        setEditingTile({...editingTile, icon: undefined, imageUrl: uri});
                      }
                    }}
                  >
                    <Ionicons name="camera" size={20} color="#4CAF50" />
                    <Text style={s.imagePickerBtnText}>Camera</Text>
                  </Pressable>
                </View>
                {editImageUrl && (
                  <Image 
                    source={{ uri: editImageUrl }} 
                    style={s.previewImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              
              <View style={s.modalButtons}>
                <Pressable 
                  style={s.modalBtn}
                  onPress={() => {
                    setEditingTile(null);
                    setOriginalTile(null);
                    setEditingTileIndex(-1);
                    setEditLabel("");
                    setEditSay("");
                    setEditImageUrl("");
                    setEditCategory("");
                  }}
                >
                  <Text style={s.modalBtnText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[s.modalBtn, s.modalBtnPrimary]}
                  onPress={() => {
                    if (!editingTile || !editCategory) {
                      alert('Please select a category');
                      return;
                    }
                    
                    // Create updated tile
                    const updatedTile: VocabTile = {
                      ...editingTile,
                      label: editLabel,
                      say: editSay,
                      imageUrl: editImageUrl || undefined,
                    };
                    
                    // If category changed, remove from old category and add to new
                    if (editCategory !== activeFolder) {
                      // Remove from current category
                      if (activeFolder === "home") {
                        const newVocab = coreVocab.filter((_, i) => i !== editingTileIndex);
                        setCoreVocab(newVocab);
                      } else {
                        const newCategoryVocab = {...categoryVocab};
                        const folderVocab = [...(newCategoryVocab[activeFolder] || [])];
                        folderVocab.splice(editingTileIndex, 1);
                        newCategoryVocab[activeFolder] = folderVocab;
                        setCategoryVocab(newCategoryVocab);
                      }
                      
                      // Add to new category
                      if (editCategory === "home") {
                        setCoreVocab([...coreVocab, updatedTile]);
                      } else {
                        const newCategoryVocab = {...categoryVocab};
                        const targetVocab = [...(newCategoryVocab[editCategory] || [])];
                        targetVocab.push(updatedTile);
                        newCategoryVocab[editCategory] = targetVocab;
                        setCategoryVocab(newCategoryVocab);
                      }
                    } else {
                      // Update in same category
                      if (activeFolder === "home") {
                        const newVocab = [...coreVocab];
                        newVocab[editingTileIndex] = updatedTile;
                        setCoreVocab(newVocab);
                      } else {
                        const newCategoryVocab = {...categoryVocab};
                        const folderVocab = [...(newCategoryVocab[activeFolder] || [])];
                        folderVocab[editingTileIndex] = updatedTile;
                        newCategoryVocab[activeFolder] = folderVocab;
                        setCategoryVocab(newCategoryVocab);
                      }
                    }
                    
                    // Close modal and reset
                    setEditingTile(null);
                    setOriginalTile(null);
                    setEditingTileIndex(-1);
                    setEditLabel("");
                    setEditSay("");
                    setEditImageUrl("");
                    setEditCategory("");
                  }}
                >
                  <Text style={[s.modalBtnText, s.modalBtnTextPrimary]}>Save Changes</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Add Word Modal */}
      {showAddWordModal && (
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalScrollContent}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Add New Word</Text>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Label (displayed text)*:</Text>
                <TextInput
                  style={s.textInput}
                  value={formLabel}
                  onChangeText={setFormLabel}
                  placeholder="e.g., hello, teacher, happy"
                />
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Says (spoken text)*:</Text>
                <TextInput
                  style={s.textInput}
                  value={formSay}
                  onChangeText={setFormSay}
                  placeholder="e.g., hello, I am happy"
                />
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Color*:</Text>
                <View style={s.colorPicker}>
                  {['#FFB366', '#FFB3E6', '#E6B3FF', '#A3E6A3', '#A3E6C6', '#99CCFF', '#FFE6B3', '#FFE0B3', '#FFF2CC', '#FFB3B3', '#FFFFFF', '#FFD699', '#E6B3D6'].map((color) => (
                    <Pressable
                      key={color}
                      style={[s.colorOption, { backgroundColor: color, borderColor: formColor === color ? '#000' : '#ccc', borderWidth: formColor === color ? 3 : 1 }]}
                      onPress={() => setFormColor(color)}
                    />
                  ))}
                </View>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Icon (optional):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.iconScroll}>
                  <Pressable
                    style={[s.iconOption, !formIcon && s.iconOptionSelected]}
                    onPress={() => setFormIcon("")}
                  >
                    <Text style={s.iconOptionText}>None</Text>
                  </Pressable>
                  {['person', 'people', 'male', 'female', 'hand-left', 'hand-right', 'heart', 'star', 'home', 'school', 'book', 'create', 'restaurant', 'cafe', 'water', 'sunny', 'moon', 'flash', 'leaf', 'flower', 'paw', 'car', 'airplane', 'basketball', 'football', 'game-controller', 'musical-notes', 'camera', 'phone-portrait', 'laptop', 'calculator', 'flask', 'eyeglasses', 'shirt', 'gift', 'balloon', 'happy', 'sad', 'alert-circle', 'checkmark-circle', 'help-circle', 'time', 'location'].map((iconName) => (
                    <Pressable
                      key={iconName}
                      style={[s.iconOption, formIcon === iconName && s.iconOptionSelected]}
                      onPress={() => setFormIcon(iconName)}
                    >
                      <Ionicons name={iconName as any} size={24} color="#333" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Or use Image URL:</Text>
                <TextInput
                  style={s.textInput}
                  value={formImageUrl}
                  onChangeText={(text) => {
                    setFormImageUrl(text);
                    if (text) {
                      setFormIcon("");
                    }
                  }}
                  placeholder="e.g., https://example.com/image.png"
                />
                <Text style={s.helperText}>Paste an image URL to use a custom image instead of an icon</Text>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Or upload from device:</Text>
                <View style={s.imagePickerButtons}>
                  <Pressable 
                    style={s.imagePickerBtn}
                    onPress={async () => {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                      });
                      if (!result.canceled && result.assets[0]) {
                        const uri = result.assets[0].uri;
                        setFormImageUrl(uri);
                        setFormIcon("");
                      }
                    }}
                  >
                    <Ionicons name="images" size={20} color="#4CAF50" />
                    <Text style={s.imagePickerBtnText}>Gallery</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={s.imagePickerBtn}
                    onPress={async () => {
                      if (Platform.OS === 'web') {
                        // Request camera permissions first
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                          alert('Camera permission is required to take photos');
                          return;
                        }
                      }
                      const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                        cameraType: ImagePicker.CameraType.back,
                      });
                      if (!result.canceled && result.assets[0]) {
                        const uri = result.assets[0].uri;
                        setFormImageUrl(uri);
                        setFormIcon("");
                      }
                    }}
                  >
                    <Ionicons name="camera" size={20} color="#4CAF50" />
                    <Text style={s.imagePickerBtnText}>Camera</Text>
                  </Pressable>
                </View>
                {formImageUrl && (
                  <Image 
                    source={{ uri: formImageUrl }} 
                    style={s.previewImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Category*:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
                  {SUBJECT_FOLDERS.map((folder) => (
                    <Pressable
                      key={folder.key}
                      style={[s.categoryOption, selectedCategory === folder.key && s.categoryOptionSelected]}
                      onPress={() => setSelectedCategory(folder.key)}
                    >
                      <Ionicons name={folder.icon as any} size={16} color="#333" />
                      <Text style={s.categoryOptionText}>{folder.label}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={[s.categoryOption, s.categoryOptionNew]}
                    onPress={() => setShowNewCategoryModal(true)}
                  >
                    <Ionicons name="add-circle" size={16} color="#4CAF50" />
                    <Text style={[s.categoryOptionText, {color: '#4CAF50'}]}>New Category</Text>
                  </Pressable>
                </ScrollView>
                <Text style={s.helperText}>
                  {selectedCategory ? `Will add to: ${SUBJECT_FOLDERS.find(f => f.key === selectedCategory)?.label || selectedCategory}` : 'Select a category or create a new one'}
                </Text>
              </View>
              
              <View style={s.modalButtons}>
                <Pressable 
                  style={s.modalBtn}
                  onPress={() => {
                    setShowAddWordModal(false);
                    setFormLabel("");
                    setFormSay("");
                    setFormColor("#FFB366");
                    setFormIcon("");
                    setFormImageUrl("");
                    setSelectedCategory("");
                  }}
                >
                  <Text style={s.modalBtnText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[s.modalBtn, s.modalBtnPrimary]}
                  onPress={() => {
                    if (!formLabel || !formSay || !selectedCategory) {
                      alert('Please fill in Label, Says, and select a Category');
                      return;
                    }
                    
                    const newWord: VocabTile = {
                      label: formLabel,
                      say: formSay,
                      color: formColor,
                      icon: formImageUrl ? undefined : (formIcon || undefined),
                      imageUrl: formImageUrl || undefined,
                    };
                    
                    // Add to selected category
                    if (selectedCategory === "home") {
                      setCoreVocab([...coreVocab, newWord]);
                    } else {
                      const newCategoryVocab = {...categoryVocab};
                      const folderVocab = newCategoryVocab[selectedCategory] || [];
                      newCategoryVocab[selectedCategory] = [...folderVocab, newWord];
                      setCategoryVocab(newCategoryVocab);
                    }
                    
                    // Close modal and reset
                    setShowAddWordModal(false);
                    setFormLabel("");
                    setFormSay("");
                    setFormColor("#FFB366");
                    setFormIcon("");
                    setFormImageUrl("");
                    setSelectedCategory("");
                  }}
                >
                  <Text style={[s.modalBtnText, s.modalBtnTextPrimary]}>Add Word</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalScrollContent}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Create New Category</Text>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Category Name*:</Text>
                <TextInput
                  style={s.textInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="e.g., Sports, Emotions, Hobbies"
                />
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Color*:</Text>
                <View style={s.colorPicker}>
                  {['#FFB366', '#FFB3E6', '#E6B3FF', '#A3E6A3', '#A3E6C6', '#99CCFF', '#FFE6B3', '#FFE0B3', '#FFF2CC', '#FFB3B3', '#FFFFFF', '#FFD699', '#E6B3D6'].map((color) => (
                    <Pressable
                      key={color}
                      style={[s.colorOption, { backgroundColor: color, borderColor: newCategoryColor === color ? '#000' : '#ccc', borderWidth: newCategoryColor === color ? 3 : 1 }]}
                      onPress={() => setNewCategoryColor(color)}
                    />
                  ))}
                </View>
              </View>
              
              <View style={s.formGroup}>
                <Text style={s.formLabel}>Icon*:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.iconScroll}>
                  {['folder', 'heart', 'star', 'trophy', 'rocket', 'music', 'camera', 'bicycle', 'umbrella', 'airplane', 'basketball', 'football', 'baseball', 'american-football', 'tennisball', 'color-palette', 'brush', 'diamond', 'gift', 'balloon', 'pizza', 'ice-cream', 'cafe', 'flower', 'leaf', 'paw', 'fish', 'bug', 'planet', 'sunny'].map((iconName) => (
                    <Pressable
                      key={iconName}
                      style={[s.iconOption, newCategoryIcon === iconName && s.iconOptionSelected]}
                      onPress={() => setNewCategoryIcon(iconName)}
                    >
                      <Ionicons name={iconName as any} size={24} color="#333" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              
              <View style={s.modalButtons}>
                <Pressable 
                  style={s.modalBtn}
                  onPress={() => {
                    setShowNewCategoryModal(false);
                    setNewCategoryName("");
                    setNewCategoryColor("#A3E6A3");
                    setNewCategoryIcon("folder");
                  }}
                >
                  <Text style={s.modalBtnText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[s.modalBtn, s.modalBtnPrimary]}
                  onPress={() => {
                    if (!newCategoryName) {
                      alert('Please enter a category name');
                      return;
                    }
                    
                    const newFolder = {
                      key: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
                      label: newCategoryName,
                      icon: newCategoryIcon,
                      color: newCategoryColor,
                    };
                    
                    setCustomFolders([...customFolders, newFolder]);
                    setSelectedCategory(newFolder.key);
                    setShowNewCategoryModal(false);
                    setNewCategoryName("");
                    setNewCategoryColor("#A3E6A3");
                    setNewCategoryIcon("folder");
                  }}
                >
                  <Text style={[s.modalBtnText, s.modalBtnTextPrimary]}>Create Category</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: "#000",
  },
  
  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  homeBtn: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  sentenceDisplay: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: "center",
  },
  sentenceText: {
    fontSize: 16,
    color: "#333",
  },
  settingsBtn: {
    padding: 8,
    marginLeft: 12,
  },

  // Action bar
  actionBar: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  speakBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  speakText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  clearText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 14,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addText: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 14,
  },
  reorderBtnActive: {
    backgroundColor: "#E3F2FD",
  },
  reorderTextActive: {
    color: "#2196F3",
  },

  // Vocabulary grid - NO SCROLL
  vocabContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  vocabGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignContent: "flex-start",
  },
  vocabTile: {
    width: Platform.OS === 'web' ? "15.5%" : "31%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    padding: Platform.OS === 'web' ? 8 : 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    position: "relative",
  },
  vocabLabel: {
    fontSize: Platform.OS === 'web' ? 13 : 11,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
    flexShrink: 1,
  },
  editIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  deleteBtn: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  tileDragged: {
    opacity: 0.5,
    borderColor: "#4CAF50",
    borderWidth: 3,
  },
  reorderIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
  },

  // Pagination
  paginationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderTopColor: "#000",
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    gap: 6,
  },
  pageBtnDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ccc",
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  pageBtnTextDisabled: {
    color: "#ccc",
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  // Bottom navigation
  bottomNav: {
    backgroundColor: "#000",
    paddingVertical: 4,
  },
  folderRow: {
    paddingHorizontal: 8,
    gap: 6,
  },
  folderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    gap: 6,
    minWidth: 100,
  },
  folderLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },

  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: Platform.OS === 'web' ? 24 : 16,
    width: "100%",
    maxWidth: Platform.OS === 'web' ? 500 : "95%",
    borderWidth: 2,
    borderColor: "#000",
  },
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: "800",
    marginBottom: Platform.OS === 'web' ? 16 : 12,
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  modalBtnPrimary: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  modalBtnTextPrimary: {
    color: "#fff",
  },
  
  // Form styles
  formGroup: {
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  formLabel: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: Platform.OS === 'web' ? 8 : 6,
  },
  input: {
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 12 : 10,
    fontSize: Platform.OS === 'web' ? 14 : 13,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputPlaceholder: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    padding: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  
  // Color picker
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Platform.OS === 'web' ? 8 : 6,
  },
  colorOption: {
    width: Platform.OS === 'web' ? 40 : 35,
    height: Platform.OS === 'web' ? 40 : 35,
    borderRadius: 8,
    borderWidth: 1,
  },
  
  // Icon selector
  iconScroll: {
    maxHeight: 80,
  },
  iconOption: {
    width: Platform.OS === 'web' ? 50 : 45,
    height: Platform.OS === 'web' ? 50 : 45,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Platform.OS === 'web' ? 8 : 6,
  },
  iconOptionSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
    borderWidth: 3,
  },
  iconOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  
  // Category selector
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Platform.OS === 'web' ? 6 : 4,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 10,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    marginRight: Platform.OS === 'web' ? 8 : 6,
  },
  categoryOptionSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
    borderWidth: 3,
  },
  categoryOptionNew: {
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  
  // Image styles
  tileImage: {
    width: Platform.OS === 'web' ? 40 : 36,
    height: Platform.OS === 'web' ? 40 : 36,
    marginBottom: 2,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignSelf: "center",
  },
  imagePickerButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  imagePickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Platform.OS === 'web' ? 8 : 6,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
  },
  imagePickerBtnText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: "700",
    color: "#4CAF50",
  },
});
