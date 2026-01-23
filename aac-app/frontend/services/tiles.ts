export type TileAction =
  | { type: "SPEAK"; text: string; addToSentence?: boolean }
  | { type: "OPEN_SPELL_KEYBOARD" }
  | { type: "OPEN_IMAGE_SEARCH"; query: string }
  | { type: "READ_ALOUD"; text?: string } // if you later integrate OCR/worksheet text
  | { type: "GRAMMAR_SUGGEST"; text: string }
  | { type: "OPEN_STORY_MAP" }
  | { type: "OPERATOR_SPEAK"; symbol: "+" | "-" | "×" | "÷" | "=" }
  | { type: "OPEN_NUMBER_LINE" }
  | { type: "TEACHER_NUDGE"; reason: string }
  | { type: "OPEN_UNITS_MENU" }
  | { type: "OPEN_FEELINGS_DIAL" }
  | { type: "SHOW_SIGN_GIF"; keyword: string }
  | { type: "JOKE_MODE" };

export type Tile = {
  id: string;
  label: string;
  sub?: string;              // small helper text like “Tap to speak + add”
  icon?: string;             // Ionicons name
  bg: string;                // pastel color like your sample
  action: TileAction;
};

export type BoardSection = {
  key: string;               // e.g. "Classroom Help"
  color: string;             // tab color
  icon?: string;
  tiles: Tile[];
};

export type SubjectKey = "english" | "math" | "science" | "social" | "interaction";

export const SUBJECT_LABEL: Record<SubjectKey, string> = {
  english: "English",
  math: "Mathematics",
  science: "Science",
  social: "Social Studies",
  interaction: "Social Interaction",
};

export const BOARDS: Record<SubjectKey, BoardSection[]> = {
  english: [
    {
      key: "Literacy Tools",
      color: "#CFE8FF",
      icon: "book-outline",
      tiles: [
        { id: "spell", label: "Spell it out", sub: "Open big keyboard", icon: "key-outline", bg: "#E8F4FF", action: { type: "OPEN_SPELL_KEYBOARD" } },
        { id: "pic", label: "Show Picture", sub: "Explain a word", icon: "image-outline", bg: "#E8F4FF", action: { type: "OPEN_IMAGE_SEARCH", query: "meadow" } },
        { id: "read", label: "Read Aloud", sub: "Read text on screen", icon: "volume-high-outline", bg: "#E8F4FF", action: { type: "READ_ALOUD" } },
        { id: "grammar", label: "Grammar Check", sub: "Suggest tense", icon: "checkmark-done-outline", bg: "#E8F4FF", action: { type: "GRAMMAR_SUGGEST", text: "I go to school" } },
        { id: "story", label: "Story Map", sub: "Character / Setting / Problem", icon: "map-outline", bg: "#E8F4FF", action: { type: "OPEN_STORY_MAP" } },
      ],
    },
    {
      key: "Useful Phrases",
      color: "#BFE3FF",
      icon: "chatbubble-ellipses-outline",
      tiles: [
        { id: "repeat", label: "Can you repeat?", sub: "Tap to speak + add", icon: "refresh-outline", bg: "#F3FAFF", action: { type: "SPEAK", text: "Can you repeat?", addToSentence: true } },
        { id: "dont", label: "I don't understand", sub: "Tap to speak + add", icon: "help-outline", bg: "#F3FAFF", action: { type: "SPEAK", text: "I don't understand.", addToSentence: true } },
      ],
    },
  ],

  math: [
    {
      key: "Math Help",
      color: "#D6F5D6",
      icon: "calculator-outline",
      tiles: [
        { id: "step", label: "Repeat Step", sub: "Ask politely", icon: "repeat-outline", bg: "#ECFFEC", action: { type: "SPEAK", text: "Could you show me that step one more time?", addToSentence: true } },
        { id: "stuck", label: "I'm stuck", sub: "Nudge teacher", icon: "flag-outline", bg: "#ECFFEC", action: { type: "TEACHER_NUDGE", reason: "Needs help with math question" } },
        { id: "line", label: "Number Line", sub: "Open overlay", icon: "remove-outline", bg: "#ECFFEC", action: { type: "OPEN_NUMBER_LINE" } },
        { id: "units", label: "Units", sub: "cm, kg, L…", icon: "speedometer-outline", bg: "#ECFFEC", action: { type: "OPEN_UNITS_MENU" } },
      ],
    },
    {
      key: "Operators",
      color: "#BFF0BF",
      icon: "add-outline",
      tiles: [
        { id: "plus", label: "+", sub: "Speak: plus", icon: "add-outline", bg: "#F3FFF3", action: { type: "OPERATOR_SPEAK", symbol: "+" } },
        { id: "minus", label: "−", sub: "Speak: minus", icon: "remove-outline", bg: "#F3FFF3", action: { type: "OPERATOR_SPEAK", symbol: "-" } },
        { id: "times", label: "×", sub: "Speak: times", icon: "close-outline", bg: "#F3FFF3", action: { type: "OPERATOR_SPEAK", symbol: "×" } },
        { id: "divide", label: "÷", sub: "Speak: divide", icon: "git-compare-outline", bg: "#F3FFF3", action: { type: "OPERATOR_SPEAK", symbol: "÷" } },
      ],
    },
  ],

  science: [
    {
      key: "Experiment Talk",
      color: "#FFE2B8",
      icon: "flask-outline",
      tiles: [
        { id: "observe", label: "Observe", sub: "I see / smell / feel", icon: "eye-outline", bg: "#FFF2DE", action: { type: "SPEAK", text: "I observe that...", addToSentence: true } },
        { id: "predict", label: "Predict", sub: "I think… because…", icon: "sparkles-outline", bg: "#FFF2DE", action: { type: "SPEAK", text: "I think it will happen because...", addToSentence: true } },
        { id: "safety", label: "Lab Safety", sub: "Goggles / Gloves", icon: "shield-checkmark-outline", bg: "#FFF2DE", action: { type: "SPEAK", text: "I will wear my goggles.", addToSentence: true } },
      ],
    },
  ],

  social: [
    {
      key: "Singapore Context",
      color: "#E3D7FF",
      icon: "people-outline",
      tiles: [
        { id: "map", label: "Map View", sub: "Show location", icon: "map-outline", bg: "#F3EDFF", action: { type: "SPEAK", text: "Can you show me on the map?", addToSentence: true } },
        { id: "heritage", label: "Heritage", sub: "Racial Harmony Day", icon: "flag-outline", bg: "#F3EDFF", action: { type: "SPEAK", text: "This is about our cultures in Singapore.", addToSentence: true } },
        { id: "then", label: "Then vs. Now", sub: "Compare photos", icon: "swap-horizontal-outline", bg: "#F3EDFF", action: { type: "SPEAK", text: "This is the past compared to today.", addToSentence: true } },
      ],
    },
  ],

  interaction: [
    {
      key: "Friends",
      color: "#CFF5FF",
      icon: "happy-outline",
      tiles: [
        { id: "invite", label: "Invite", sub: "Join play", icon: "hand-left-outline", bg: "#E9FBFF", action: { type: "SPEAK", text: "Do you want to play with me?", addToSentence: false } },
        { id: "feel", label: "Feelings", sub: "How I feel", icon: "heart-outline", bg: "#E9FBFF", action: { type: "OPEN_FEELINGS_DIAL" } },
        { id: "quick", label: "Quick Chat", sub: "Casual phrases", icon: "chatbubble-outline", bg: "#E9FBFF", action: { type: "SPEAK", text: "Nice one!", addToSentence: false } },
        { id: "sign", label: "Sign Share", sub: "Show sign gif", icon: "videocam-outline", bg: "#E9FBFF", action: { type: "SHOW_SIGN_GIF", keyword: "hello" } },
        { id: "joke", label: "Joke Mode", sub: "Break the ice", icon: "sparkles-outline", bg: "#E9FBFF", action: { type: "JOKE_MODE" } },
      ],
    },
  ],
};
