export type Locale = "en" | "de" | "id";

export interface Translations {
  nav: {
    home: string;
    journey: string;
    timeline: string;
    progress: string;
    compare: string;
    reflections: string;
    goals: string;
    habits: string;
    learning: string;
    finance: string;
    settings: string;
    addRecord: string;
  };
  common: {
    back: string;
    cancel: string;
    save: string;
    saving: string;
    delete: string;
    edit: string;
    done: string;
    markDone: string;
    active: string;
    completed: string;
    paused: string;
    cancelled: string;
    inProgress: string;
    deadline: string;
    progress: string;
    date: string;
    time: string;
    duration: string;
    minutes: string;
    note: string;
    category: string;
    amount: string;
    source: string;
    optional: string;
    all: string;
    income: string;
    expense: string;
    difference: string;
    actualBalance: string;
    calculatedBalance: string;
  };
  home: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    today: string;
    habitsCount: string;
    currentFocus: string;
    allGoals: string;
    recentLearning: string;
    viewLearning: string;
    financeSnapshot: string;
    viewFinance: string;
    weeklyReflection: string;
    reflectionPending: string;
    reflectThisWeek: string;
    noHabitsToday: string;
    noActiveGoals: string;
    noRecentLearning: string;
  };
  quickAdd: {
    title: string;
    subtitle: string;
    activityTitle: string;
    activityDesc: string;
    learningTitle: string;
    learningDesc: string;
    expenseTitle: string;
    expenseDesc: string;
    incomeTitle: string;
    incomeDesc: string;
    whatDidYouDo: string;
    activityPlaceholder: string;
    addContext: string;
    hideContext: string;
    whatDidYouLearn: string;
    topicPlaceholder: string;
    whatDidYouUnderstand: string;
    understoodPlaceholder: string;
    sourcePlaceholder: string;
    saveActivity: string;
    saveLearning: string;
    saveExpense: string;
    saveIncome: string;
  };
  goals: {
    title: string;
    subtitle: string;
    createGoal: string;
    whatToAchieve: string;
    description: string;
    goalType: string;
    milestones: string;
    relatedJourney: string;
    activities: string;
    learning: string;
    habits: string;
    reflections: string;
    noGoals: string;
    backToGoals: string;
    timeframe: string;
    timeframeDay: string;
    timeframeWeek: string;
    timeframeMonth: string;
    timeframeYear: string;
    timeframeCustom: string;
    allTimeframes: string;
    daysLeft: string;
    today: string;
    tomorrow: string;
    overdue: string;
    editDeadline: string;
    deleteGoal: string;
    deleteGoalConfirm: string;
    currentTime: string;
    liveCountdown: string;
    quickShortcuts: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  habits: {
    title: string;
    subtitle: string;
    today: string;
    thisWeek: string;
    thisWeekDays: string;
    evidence: string;
    createHabit: string;
    habitName: string;
    saveHabit: string;
    noEvidence: string;
    backToHabits: string;
    rhythm: string;
    noHabits: string;
  };
  learning: {
    title: string;
    subtitle: string;
    recent: string;
    addLearning: string;
    whatUnderstood: string;
    sourceContext: string;
    relatedActivity: string;
    relatedGoal: string;
    backToLearning: string;
    topic: string;
    noLearnings: string;
    folders: string;
    notes: string;
    newFolder: string;
    folderName: string;
    createFolder: string;
    folderPlaceholder: string;
    rootFolder: string;
    selectFolder: string;
    noFolder: string;
    emptyFolder: string;
    emptyFolderDesc: string;
    attachMedia: string;
    addPhoto: string;
    addVideo: string;
    photoUrlOrUpload: string;
    videoUrlOrUpload: string;
    mediaGallery: string;
    fileCount: string;
    deleteFolderConfirm: string;
    addFile: string;
    createFile: string;
    uploadFile: string;
    fileName: string;
    fileContent: string;
    filePlaceholder: string;
    attachedFiles: string;
    downloadFile: string;
  };
  finance: {
    title: string;
    subtitle: string;
    addTransaction: string;
    updateActual: string;
    updateBalanceTitle: string;
    actualDesc: string;
    calculatedDesc: string;
    updatedToday: string;
    netFlow: string;
    budgets: string;
    transactions: string;
    filterAll: string;
    noTransactions: string;
    noBudgets: string;
  };
  reflections: {
    title: string;
    subtitle: string;
    writeReflection: string;
    thisWeekContext: string;
    whatHappened: string;
    whatHappenedDesc: string;
    whatLearned: string;
    whatLearnedDesc: string;
    whatChanged: string;
    whatChangedDesc: string;
    additionalNotes: string;
    saveReflection: string;
    backToReflections: string;
    noReflections: string;
  };
  journey: {
    title: string;
    subtitle: string;
    comparePeriods: string;
    groundedInsights: string;
    objective: string;
    behavioral: string;
    subjective: string;
    lifeEvents: string;
    currentGoals: string;
    progressOverTime: string;
    reflectionExcerpts: string;
    backToTimeline: string;
    noTimeline: string;
    noProgress: string;
    noCompare: string;
  };
  settings: {
    title: string;
    subtitle: string;
    accountProfile: string;
    name: string;
    email: string;
    preferences: string;
    timezone: string;
    language: string;
    languageDesc: string;
    dataOwnership: string;
    dataOwnershipDesc: string;
    exportButton: string;
    exportedSuccess: string;
    logout: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: "Home",
      journey: "Journey",
      timeline: "Timeline",
      progress: "Progress",
      compare: "Compare",
      reflections: "Reflections",
      goals: "Goals",
      habits: "Habits",
      learning: "Learning",
      finance: "Finance",
      settings: "Settings",
      addRecord: "Add Record",
    },
    common: {
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      delete: "Delete",
      edit: "Edit",
      done: "Done",
      markDone: "Mark done",
      active: "Active",
      completed: "Completed",
      paused: "Paused",
      cancelled: "Cancelled",
      inProgress: "In Progress",
      deadline: "Deadline",
      progress: "Progress",
      date: "Date",
      time: "Time",
      duration: "Duration",
      minutes: "minutes",
      note: "Note",
      category: "Category",
      amount: "Amount",
      source: "Source",
      optional: "optional",
      all: "All",
      income: "Income",
      expense: "Expense",
      difference: "Difference",
      actualBalance: "Actual Balance",
      calculatedBalance: "Calculated Balance",
    },
    home: {
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      today: "Today",
      habitsCount: "habits",
      currentFocus: "Current Focus",
      allGoals: "All goals",
      recentLearning: "Recent Learning",
      viewLearning: "View learning",
      financeSnapshot: "Finance",
      viewFinance: "View finance",
      weeklyReflection: "Weekly Reflection",
      reflectionPending: "Reflection hasn't been completed yet. Take a moment to reflect on your week.",
      reflectThisWeek: "Reflect this week",
      noHabitsToday: "No habits tracked yet today. Start by creating a habit.",
      noActiveGoals: "No active goals in progress. Define a core focus to orient your journey.",
      noRecentLearning: "No learning insights recorded yet. Document what you understood today.",
    },
    quickAdd: {
      title: "Add Record",
      subtitle: "What do you want to record?",
      activityTitle: "Activity",
      activityDesc: "What I did",
      learningTitle: "Learning",
      learningDesc: "What I learned",
      expenseTitle: "Expense",
      expenseDesc: "Money I spent",
      incomeTitle: "Income",
      incomeDesc: "Money I received",
      whatDidYouDo: "What did you do? *",
      activityPlaceholder: "e.g. Practiced React components",
      addContext: "Add context +",
      hideContext: "Hide context",
      whatDidYouLearn: "What did you learn? (Topic) *",
      topicPlaceholder: "e.g. Array Methods",
      whatDidYouUnderstand: "What did you understand?",
      understoodPlaceholder: "e.g. map() transforms items, filter() selects items...",
      sourcePlaceholder: "e.g. Documentation, YouTube tutorial",
      saveActivity: "Save Activity",
      saveLearning: "Save Learning",
      saveExpense: "Save Expense",
      saveIncome: "Save Income",
    },
    goals: {
      title: "Goals",
      subtitle: "Set direction, break down milestones, and document honest progress.",
      createGoal: "Create Goal",
      whatToAchieve: "What do you want to achieve? *",
      description: "Description",
      goalType: "Goal Type *",
      milestones: "Milestones",
      relatedJourney: "Related Journey Context",
      activities: "Activities",
      learning: "Learning",
      habits: "Habits",
      reflections: "Reflections",
      noGoals: "No goals found in this view.",
      backToGoals: "Back to Goals",
      timeframe: "Timeframe Limit",
      timeframeDay: "Day",
      timeframeWeek: "Week",
      timeframeMonth: "Month",
      timeframeYear: "Year",
      timeframeCustom: "Custom",
      allTimeframes: "All Horizons",
      daysLeft: "{count} days left",
      today: "Today",
      tomorrow: "Tomorrow",
      overdue: "{count} days overdue",
      editDeadline: "Change Deadline",
      deleteGoal: "Delete Goal",
      deleteGoalConfirm: "Are you sure you want to delete this goal?",
      currentTime: "Current Time",
      liveCountdown: "Live Countdown",
      quickShortcuts: "Quick Adjust",
      days: "days",
      hours: "hrs",
      minutes: "mins",
      seconds: "secs",
    },
    habits: {
      title: "Habits",
      subtitle: "Daily patterns maintained through real actions. No streaks, no arbitrary score.",
      today: "Today",
      thisWeek: "This Week",
      thisWeekDays: "This week: {count} / 7 days",
      evidence: "Evidence (Linked Activities)",
      createHabit: "Create Habit",
      habitName: "Habit Name *",
      saveHabit: "Save Habit",
      noEvidence: "No activities linked yet as evidence.",
      backToHabits: "Back to Habits",
      rhythm: "This Week Rhythm",
      noHabits: "No habits created yet. Build consistent rhythms with verifiable evidence.",
    },
    learning: {
      title: "Learning",
      subtitle: "Separate from activity. Documents what you actually understood, not just what you did.",
      recent: "Recent",
      addLearning: "Add Learning",
      whatUnderstood: "What I Understood",
      sourceContext: "Source / Context",
      relatedActivity: "Related Activity",
      relatedGoal: "Related Goal",
      backToLearning: "Back to Learning",
      topic: "Topic",
      noLearnings: "No learnings recorded yet. Document key concepts, mental models, and takeaways.",
      folders: "Folders",
      notes: "Notes",
      newFolder: "New Folder",
      folderName: "Folder Name",
      createFolder: "Create Folder",
      folderPlaceholder: "e.g. React & Next.js, System Architecture",
      rootFolder: "All Notes (Root)",
      selectFolder: "Select Folder",
      noFolder: "No Folder (Root)",
      emptyFolder: "This folder is empty",
      emptyFolderDesc: "No notes or files created in this folder yet.",
      attachMedia: "Attach Photos & Videos",
      addPhoto: "Add Photo",
      addVideo: "Add Video",
      photoUrlOrUpload: "Upload image or enter image URL",
      videoUrlOrUpload: "Upload video clip or enter video URL",
      mediaGallery: "Attached Media (Photos & Videos)",
      fileCount: "files",
      deleteFolderConfirm: "Are you sure you want to delete this folder?",
      addFile: "Add File / Doc",
      createFile: "Create Document File",
      uploadFile: "Upload File",
      fileName: "File Name",
      fileContent: "File Content / Notes",
      filePlaceholder: "e.g. notes.md, architecture.txt, summary.pdf",
      attachedFiles: "Attached Files & Documents",
      downloadFile: "Download File",
    },
    finance: {
      title: "Finance",
      subtitle: "Honest financial tracking. Actual vs Calculated balances displayed side-by-side.",
      addTransaction: "Add Transaction",
      updateActual: "Update Actual Balance",
      updateBalanceTitle: "Update Actual Balance",
      actualDesc: "Physical cash & bank accounts you verified today.",
      calculatedDesc: "Starting balance + recorded Incomes - recorded Expenses.",
      updatedToday: "Updated today",
      netFlow: "Net Flow",
      budgets: "Budgets",
      transactions: "Transactions",
      filterAll: "All",
      noTransactions: "No transactions recorded yet.",
      noBudgets: "No budget allocations set for this month.",
    },
    reflections: {
      title: "Reflections",
      subtitle: "Weekly archives documenting what actually happened, what you learned, and how you changed.",
      writeReflection: "Write Reflection",
      thisWeekContext: "This Week Context",
      whatHappened: "What happened? *",
      whatHappenedDesc: "What did you actually do this week? Key events, progress, or setbacks.",
      whatLearned: "What did I learn? *",
      whatLearnedDesc: "Key insights, takeaways, skills, or realizations from your activities.",
      whatChanged: "What changed? *",
      whatChangedDesc: "How has your perspective, confidence, habit rhythm, or direction shifted?",
      additionalNotes: "Additional Notes (optional)",
      saveReflection: "Save Reflection",
      backToReflections: "Back to Reflections",
      noReflections: "No reflections archived yet.",
    },
    journey: {
      title: "Journey",
      subtitle: "Meaningful milestones across your life. Curated moments, not noisy database logs.",
      comparePeriods: "Compare Periods",
      groundedInsights: "What Changed? (Grounded Evidence)",
      objective: "Objective",
      behavioral: "Behavioral",
      subjective: "Subjective",
      lifeEvents: "Life Events",
      currentGoals: "Current Goals",
      progressOverTime: "Progress Over Time (2026)",
      reflectionExcerpts: "Reflection Excerpts",
      backToTimeline: "Back to Timeline",
      noTimeline: "No timeline events recorded yet.",
      noProgress: "No goals or milestones to track progress yet.",
      noCompare: "No comparison data yet. Need at least 2 recorded periods.",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your personal preferences, privacy, and full data archive ownership.",
      accountProfile: "Account Profile",
      name: "Name",
      email: "Email",
      preferences: "Preferences & Timezone",
      timezone: "Timezone",
      language: "Language / Sprache / Bahasa",
      languageDesc: "Choose your preferred language across the entire ORBIT experience.",
      dataOwnership: "Data Ownership & Long-Term Archive",
      dataOwnershipDesc: "ORBIT is built to preserve your life records for 5+ years. Export raw JSON data at any time.",
      exportButton: "Export Full Data (JSON)",
      exportedSuccess: "Archive Exported Successfully",
      logout: "Log out of ORBIT",
    },
  },

  de: {
    nav: {
      home: "Übersicht",
      journey: "Reise",
      timeline: "Zeitleiste",
      progress: "Fortschritt",
      compare: "Vergleich",
      reflections: "Reflexionen",
      goals: "Ziele",
      habits: "Gewohnheiten",
      learning: "Lernen",
      finance: "Finanzen",
      settings: "Einstellungen",
      addRecord: "Eintrag hinzufügen",
    },
    common: {
      back: "Zurück",
      cancel: "Abbrechen",
      save: "Speichern",
      saving: "Speichert...",
      delete: "Löschen",
      edit: "Bearbeiten",
      done: "Erledigt",
      markDone: "Als erledigt markieren",
      active: "Aktiv",
      completed: "Abgeschlossen",
      paused: "Pausiert",
      cancelled: "Abgebrochen",
      inProgress: "In Bearbeitung",
      deadline: "Frist",
      progress: "Fortschritt",
      date: "Datum",
      time: "Uhrzeit",
      duration: "Dauer",
      minutes: "Minuten",
      note: "Notiz",
      category: "Kategorie",
      amount: "Betrag",
      source: "Quelle",
      optional: "optional",
      all: "Alle",
      income: "Einnahmen",
      expense: "Ausgaben",
      difference: "Differenz",
      actualBalance: "Tatsächlicher Saldo",
      calculatedBalance: "Berechneter Saldo",
    },
    home: {
      greetingMorning: "Guten Morgen",
      greetingAfternoon: "Guten Tag",
      greetingEvening: "Guten Abend",
      today: "Heute",
      habitsCount: "Gewohnheiten",
      currentFocus: "Aktueller Fokus",
      allGoals: "Alle Ziele",
      recentLearning: "Kürzlich gelernt",
      viewLearning: "Lernen ansehen",
      financeSnapshot: "Finanzen",
      viewFinance: "Finanzen ansehen",
      weeklyReflection: "Wöchentliche Reflexion",
      reflectionPending: "Reflexion für diese Woche steht noch aus. Nimm dir einen Moment Zeit zum Innehalten.",
      reflectThisWeek: "Diese Woche reflektieren",
      noHabitsToday: "Heute noch keine Gewohnheiten erfasst. Erstelle deine erste Gewohnheit.",
      noActiveGoals: "Keine aktiven Ziele vorhanden. Definiere einen Fokus für deine Reise.",
      noRecentLearning: "Noch keine Lernerkenntnisse erfasst. Halte fest, was du heute verstanden hast.",
    },
    quickAdd: {
      title: "Eintrag hinzufügen",
      subtitle: "Was möchtest du festhalten?",
      activityTitle: "Aktivität",
      activityDesc: "Was ich getan habe",
      learningTitle: "Erkenntnis",
      learningDesc: "Was ich gelernt habe",
      expenseTitle: "Ausgabe",
      expenseDesc: "Geld, das ich ausgegeben habe",
      incomeTitle: "Einnahme",
      incomeDesc: "Geld, das ich erhalten habe",
      whatDidYouDo: "Was hast du getan? *",
      activityPlaceholder: "z.B. React Komponenten geübt",
      addContext: "Kontext hinzufügen +",
      hideContext: "Kontext verbergen",
      whatDidYouLearn: "Was hast du gelernt? (Thema) *",
      topicPlaceholder: "z.B. Array-Methoden",
      whatDidYouUnderstand: "Was hast du verstanden?",
      understoodPlaceholder: "z.B. map() transformiert Elemente, filter() wählt aus...",
      sourcePlaceholder: "z.B. Dokumentation, Tutorial",
      saveActivity: "Aktivität speichern",
      saveLearning: "Erkenntnis speichern",
      saveExpense: "Ausgabe speichern",
      saveIncome: "Einnahme speichern",
    },
    goals: {
      title: "Ziele",
      subtitle: "Richtung bestimmen, Meilensteine setzen und echten Fortschritt dokumentieren.",
      createGoal: "Ziel erstellen",
      whatToAchieve: "Was möchtest du erreichen? *",
      description: "Beschreibung",
      goalType: "Zieltyp *",
      milestones: "Meilensteine",
      relatedJourney: "Zugehöriger Reisekontext",
      activities: "Aktivitäten",
      learning: "Erkenntnisse",
      habits: "Gewohnheiten",
      reflections: "Reflexionen",
      noGoals: "Keine Ziele in dieser Ansicht gefunden.",
      backToGoals: "Zurück zu Zielen",
      timeframe: "Zeitrahmen-Begrenzung",
      timeframeDay: "Tag",
      timeframeWeek: "Woche",
      timeframeMonth: "Monat",
      timeframeYear: "Jahr",
      timeframeCustom: "Benutzerdefiniert",
      allTimeframes: "Alle Zeithorizonte",
      daysLeft: "Noch {count} Tage",
      today: "Heute",
      tomorrow: "Morgen",
      overdue: "Seit {count} Tagen überfällig",
      editDeadline: "Frist ändern",
      deleteGoal: "Ziel löschen",
      deleteGoalConfirm: "Möchtest du dieses Ziel wirklich löschen?",
      currentTime: "Aktuelle Zeit",
      liveCountdown: "Live-Countdown",
      quickShortcuts: "Schnellanpassung",
      days: "Tage",
      hours: "Std",
      minutes: "Min",
      seconds: "Sek",
    },
    habits: {
      title: "Gewohnheiten",
      subtitle: "Tägliche Rhythmen durch echte Taten. Keine Streaks, keine willkürlichen Scores.",
      today: "Heute",
      thisWeek: "Diese Woche",
      thisWeekDays: "Diese Woche: {count} / 7 Tage",
      evidence: "Beweise (Verknüpfte Aktivitäten)",
      createHabit: "Gewohnheit erstellen",
      habitName: "Name der Gewohnheit *",
      saveHabit: "Gewohnheit speichern",
      noEvidence: "Noch keine Aktivitäten als Beweis verknüpft.",
      backToHabits: "Zurück zu Gewohnheiten",
      rhythm: "Rhythmus dieser Woche",
      noHabits: "Noch keine Gewohnheiten erstellt. Baue nachhaltige Rhythmen mit echten Nachweisen auf.",
    },
    learning: {
      title: "Lernen",
      subtitle: "Getrennt von Aktivität. Dokumentiert das tatsächliche Verständnis, nicht nur die Beschäftigung.",
      recent: "Kürzlich",
      addLearning: "Erkenntnis hinzufügen",
      whatUnderstood: "Was ich verstanden habe",
      sourceContext: "Quelle / Kontext",
      relatedActivity: "Zugehörige Aktivität",
      relatedGoal: "Zugehöriges Ziel",
      backToLearning: "Zurück zu Lernen",
      topic: "Thema",
      noLearnings: "Noch keine Lernerkenntnisse erfasst. Halte Schlüsselkonzepte und Erkenntnisse fest.",
      folders: "Ordner",
      notes: "Notizen",
      newFolder: "Neuer Ordner",
      folderName: "Ordnername",
      createFolder: "Ordner erstellen",
      folderPlaceholder: "z.B. React & Next.js, Systemarchitektur",
      rootFolder: "Alle Notizen (Hauptverzeichnis)",
      selectFolder: "Ordner auswählen",
      noFolder: "Kein Ordner (Hauptverzeichnis)",
      emptyFolder: "Dieser Ordner ist leer",
      emptyFolderDesc: "In diesem Ordner wurden noch keine Notizen erstellt.",
      attachMedia: "Fotos & Videos anhängen",
      addPhoto: "Foto hinzufügen",
      addVideo: "Video hinzufügen",
      photoUrlOrUpload: "Bild hochladen oder Bild-URL eingeben",
      videoUrlOrUpload: "Videoclip hochladen oder Video-URL eingeben",
      mediaGallery: "Angehängte Medien (Fotos & Videos)",
      fileCount: "Dateien",
      deleteFolderConfirm: "Möchtest du diesen Ordner wirklich löschen?",
      addFile: "Datei / Dokument hinzufügen",
      createFile: "Dokumentendatei erstellen",
      uploadFile: "Datei hochladen",
      fileName: "Dateiname",
      fileContent: "Dateiinhalt / Notizen",
      filePlaceholder: "z.B. notizen.md, architektur.txt, zusammenfassung.pdf",
      attachedFiles: "Angehängte Dateien & Dokumente",
      downloadFile: "Datei herunterladen",
    },
    finance: {
      title: "Finanzen",
      subtitle: "Ehrliches Finanztracking. Tatsächlicher vs. berechneter Saldo nebeneinander.",
      addTransaction: "Transaktion hinzufügen",
      updateActual: "Tatsächlichen Saldo anpassen",
      updateBalanceTitle: "Tatsächlichen Saldo anpassen",
      actualDesc: "Bargeld und Kontostand, den du heute geprüft hast.",
      calculatedDesc: "Startsaldo + erfasste Einnahmen - erfasste Ausgaben.",
      updatedToday: "Heute aktualisiert",
      netFlow: "Nettofluss",
      budgets: "Budgets",
      transactions: "Transaktionen",
      filterAll: "Alle",
      noTransactions: "Noch keine Transaktionen erfasst.",
      noBudgets: "Keine Budgetzuweisungen für diesen Monat festgelegt.",
    },
    reflections: {
      title: "Reflexionen",
      subtitle: "Wöchentliches Archiv: Was wirklich geschah, was du gelernt hast und wie du dich verändert hast.",
      writeReflection: "Reflexion verfassen",
      thisWeekContext: "Kontext dieser Woche",
      whatHappened: "Was ist passiert? *",
      whatHappenedDesc: "Was hast du diese Woche tatsächlich getan? Meilensteine oder Hürden.",
      whatLearned: "Was habe ich gelernt? *",
      whatLearnedDesc: "Wichtige Erkenntnisse, Fähigkeiten oder Einsichten aus deinen Aktivitäten.",
      whatChanged: "Was hat sich verändert? *",
      whatChangedDesc: "Wie haben sich deine Haltung, dein Selbstvertrauen oder deine Richtung gewandelt?",
      additionalNotes: "Zusätzliche Notizen (optional)",
      saveReflection: "Reflexion speichern",
      backToReflections: "Zurück zu Reflexionen",
      noReflections: "Noch keine wöchentlichen Reflexionen archiviert.",
    },
    journey: {
      title: "Reise",
      subtitle: "Bedeutsame Meilensteine deines Lebens. Kuratierte Momente statt Datenmüll.",
      comparePeriods: "Perioden vergleichen",
      groundedInsights: "Was hat sich verändert? (Faktenbasierte Beweise)",
      objective: "Objektiv",
      behavioral: "Verhalten",
      subjective: "Subjektiv",
      lifeEvents: "Lebensereignisse",
      currentGoals: "Aktuelle Ziele",
      progressOverTime: "Fortschritt im Zeitverlauf (2026)",
      reflectionExcerpts: "Reflexionsauszüge",
      backToTimeline: "Zurück zur Zeitleiste",
      noTimeline: "Noch keine Ereignisse auf der Zeitleiste vorhanden.",
      noProgress: "Noch keine Ziele oder Meilensteine zur Fortschrittsverfolgung vorhanden.",
      noCompare: "Noch keine Vergleichsdaten vorhanden. Mindestens 2 Zeiträume erforderlich.",
    },
    settings: {
      title: "Einstellungen",
      subtitle: "Verwalte persönliche Einstellungen, Privatsphäre und den langfristigen Datenbesitz.",
      accountProfile: "Konto & Profil",
      name: "Name",
      email: "E-Mail",
      preferences: "Einstellungen & Zeitzone",
      timezone: "Zeitzone",
      language: "Sprache / Language / Bahasa",
      languageDesc: "Wähle deine bevorzugte Sprache für die gesamte ORBIT Erfahrung.",
      dataOwnership: "Datenbesitz & Langzeitarchiv",
      dataOwnershipDesc: "ORBIT bewahrt deine Aufzeichnungen über Jahre. Exportiere Rohdaten jederzeit als JSON.",
      exportButton: "Vollständige Daten exportieren (JSON)",
      exportedSuccess: "Archiv erfolgreich exportiert",
      logout: "Von ORBIT abmelden",
    },
  },

  id: {
    nav: {
      home: "Beranda",
      journey: "Perjalanan",
      timeline: "Linimasa",
      progress: "Perkembangan",
      compare: "Perbandingan",
      reflections: "Refleksi",
      goals: "Target",
      habits: "Kebiasaan",
      learning: "Pembelajaran",
      finance: "Keuangan",
      settings: "Pengaturan",
      addRecord: "Tambah Catatan",
    },
    common: {
      back: "Kembali",
      cancel: "Batal",
      save: "Simpan",
      saving: "Menyimpan...",
      delete: "Hapus",
      edit: "Ubah",
      done: "Selesai",
      markDone: "Tandai selesai",
      active: "Aktif",
      completed: "Tercapai",
      paused: "Dijeda",
      cancelled: "Dibatalkan",
      inProgress: "Sedang Berjalan",
      deadline: "Tenggat Waktu",
      progress: "Progres",
      date: "Tanggal",
      time: "Waktu",
      duration: "Durasi",
      minutes: "menit",
      note: "Catatan",
      category: "Kategori",
      amount: "Nominal",
      source: "Sumber",
      optional: "opsional",
      all: "Semua",
      income: "Pemasukan",
      expense: "Pengeluaran",
      difference: "Selisih",
      actualBalance: "Saldo Nyata (Fisik)",
      calculatedBalance: "Saldo Terhitung (Buku Kas)",
    },
    home: {
      greetingMorning: "Selamat pagi",
      greetingAfternoon: "Selamat siang",
      greetingEvening: "Selamat malam",
      today: "Hari Ini",
      habitsCount: "kebiasaan",
      currentFocus: "Fokus Saat Ini",
      allGoals: "Semua target",
      recentLearning: "Pembelajaran Terbaru",
      viewLearning: "Lihat pembelajaran",
      financeSnapshot: "Kondisi Keuangan",
      viewFinance: "Lihat keuangan",
      weeklyReflection: "Refleksi Mingguan",
      reflectionPending: "Refleksi minggu ini belum diisi. Luangkan waktu sejenak untuk mengevaluasi perjalananmu.",
      reflectThisWeek: "Refleksi minggu ini",
      noHabitsToday: "Belum ada kebiasaan yang dicatat hari ini. Mulai dengan membuat kebiasaan.",
      noActiveGoals: "Belum ada target aktif. Tentukan fokus utama untuk memandu perjalananmu.",
      noRecentLearning: "Belum ada catatan pemahaman. Tulis intisari yang kamu pahami hari ini.",
    },
    quickAdd: {
      title: "Tambah Catatan",
      subtitle: "Apa yang ingin kamu catat?",
      activityTitle: "Aktivitas",
      activityDesc: "Apa yang saya lakukan",
      learningTitle: "Pembelajaran",
      learningDesc: "Apa yang saya pahami",
      expenseTitle: "Pengeluaran",
      expenseDesc: "Uang yang saya belanjakan",
      incomeTitle: "Pemasukan",
      incomeDesc: "Uang yang saya terima",
      whatDidYouDo: "Apa yang kamu lakukan? *",
      activityPlaceholder: "misal: Belajar React components",
      addContext: "Tambah konteks +",
      hideContext: "Sembunyikan konteks",
      whatDidYouLearn: "Apa yang kamu pelajari? (Topik) *",
      topicPlaceholder: "misal: Array Methods",
      whatDidYouUnderstand: "Apa yang kamu pahami?",
      understoodPlaceholder: "misal: map() mengubah isi data, filter() menyaring...",
      sourcePlaceholder: "misal: Dokumentasi resmi, tutorial video",
      saveActivity: "Simpan Aktivitas",
      saveLearning: "Simpan Pembelajaran",
      saveExpense: "Simpan Pengeluaran",
      saveIncome: "Simpan Pemasukan",
    },
    goals: {
      title: "Target Hidup",
      subtitle: "Tentukan arah, bagi menjadi milestone, dan catat kemajuan yang jujur.",
      createGoal: "Buat Target",
      whatToAchieve: "Apa yang ingin kamu capai? *",
      description: "Deskripsi",
      goalType: "Tipe Target *",
      milestones: "Tahapan Milestone",
      relatedJourney: "Konteks Perjalanan Terkait",
      activities: "Aktivitas",
      learning: "Pembelajaran",
      habits: "Kebiasaan",
      reflections: "Refleksi",
      noGoals: "Belum ada target pada filter ini.",
      backToGoals: "Kembali ke Target",
      timeframe: "Batasan Waktu",
      timeframeDay: "Hari",
      timeframeWeek: "Minggu",
      timeframeMonth: "Bulan",
      timeframeYear: "Tahun",
      timeframeCustom: "Kustom",
      allTimeframes: "Semua Rentang",
      daysLeft: "Sisa {count} hari",
      today: "Hari Ini",
      tomorrow: "Besok",
      overdue: "Terlewat {count} hari",
      editDeadline: "Ubah Tenggat Waktu",
      deleteGoal: "Hapus Target",
      deleteGoalConfirm: "Apakah kamu yakin ingin menghapus target ini?",
      currentTime: "Waktu Saat Ini",
      liveCountdown: "Hitung Mundur Realtime",
      quickShortcuts: "Atur Cepat",
      days: "hari",
      hours: "jam",
      minutes: "menit",
      seconds: "detik",
    },
    habits: {
      title: "Kebiasaan",
      subtitle: "Pola harian yang dijaga melalui tindakan nyata. Tanpa streak semu atau skor arbitrer.",
      today: "Hari Ini",
      thisWeek: "Minggu Ini",
      thisWeekDays: "Minggu ini: {count} / 7 hari",
      evidence: "Bukti Nyata (Aktivitas Terhubung)",
      createHabit: "Buat Kebiasaan",
      habitName: "Nama Kebiasaan *",
      saveHabit: "Simpan Kebiasaan",
      noEvidence: "Belum ada aktivitas yang ditautkan sebagai bukti.",
      backToHabits: "Kembali ke Kebiasaan",
      rhythm: "Ritme Minggu Ini",
      noHabits: "Belum ada kebiasaan yang dibuat. Bangun ritme konsisten dengan bukti nyata.",
    },
    learning: {
      title: "Pembelajaran",
      subtitle: "Dipisahkan dari aktivitas. Mencatat apa yang benar-benar kamu pahami, bukan sekadar durasi belajar.",
      recent: "Terbaru",
      addLearning: "Tambah Pelajaran",
      whatUnderstood: "Intisari Pemahaman",
      sourceContext: "Sumber / Konteks",
      relatedActivity: "Aktivitas Terkait",
      relatedGoal: "Target Terkait",
      backToLearning: "Kembali ke Pembelajaran",
      topic: "Topik",
      noLearnings: "Belum ada catatan pembelajaran. Dokumentasikan konsep, pemahaman, dan intisari belajarmu.",
      folders: "Folder",
      notes: "Catatan",
      newFolder: "Folder Baru",
      folderName: "Nama Folder",
      createFolder: "Buat Folder",
      folderPlaceholder: "misal: Frontend, Backend, Arsitektur Sistem",
      rootFolder: "Semua Catatan (Utama)",
      selectFolder: "Pilih Folder",
      noFolder: "Tanpa Folder (Utama)",
      emptyFolder: "Folder ini masih kosong",
      emptyFolderDesc: "Belum ada catatan atau materi pembelajaran di dalam folder ini.",
      attachMedia: "Lampirkan Foto & Video",
      addPhoto: "Tambah Foto",
      addVideo: "Tambah Video",
      photoUrlOrUpload: "Unggah gambar atau masukkan URL gambar",
      videoUrlOrUpload: "Unggah klip video atau masukkan URL video",
      mediaGallery: "Media Terlampir (Foto & Video)",
      fileCount: "catatan",
      deleteFolderConfirm: "Apakah kamu yakin ingin menghapus folder ini?",
      addFile: "Tambah Berkas / File",
      createFile: "Buat File Dokumen",
      uploadFile: "Unggah Berkas",
      fileName: "Nama File",
      fileContent: "Isi File / Catatan Dokumen",
      filePlaceholder: "misal: catatan.md, arsitektur.txt, materi.pdf",
      attachedFiles: "Berkas & Dokumen Terlampir",
      downloadFile: "Unduh File",
    },
    finance: {
      title: "Keuangan",
      subtitle: "Pencatatan keuangan yang jujur. Saldo fisik riil dan buku kas disajikan berdampingan.",
      addTransaction: "Tambah Transaksi",
      updateActual: "Perbarui Saldo Nyata",
      updateBalanceTitle: "Perbarui Saldo Nyata",
      actualDesc: "Total uang tunai dan rekening bank yang kamu cek langsung hari ini.",
      calculatedDesc: "Saldo awal + seluruh pemasukan tercatat - seluruh pengeluaran tercatat.",
      updatedToday: "Diperbarui hari ini",
      netFlow: "Arus Bersih (Net Flow)",
      budgets: "Alokasi Anggaran (Budget)",
      transactions: "Riwayat Transaksi",
      filterAll: "Semua",
      noTransactions: "Belum ada transaksi yang dicatat.",
      noBudgets: "Belum ada alokasi anggaran untuk bulan ini.",
    },
    reflections: {
      title: "Refleksi Mingguan",
      subtitle: "Arsip mingguan mendokumentasikan apa yang terjadi, apa yang dipelajari, dan apa yang berubah.",
      writeReflection: "Tulis Refleksi",
      thisWeekContext: "Konteks Minggu Ini",
      whatHappened: "Apa yang terjadi? *",
      whatHappenedDesc: "Apa yang benar-benar kamu lakukan minggu ini? Peristiwa kunci, keberhasilan, atau hambatan.",
      whatLearned: "Apa yang saya pelajari? *",
      whatLearnedDesc: "Intisari pemahaman, wawasan baru, atau keterampilan yang didapat.",
      whatChanged: "Apa yang berubah? *",
      whatChangedDesc: "Bagaimana cara pandang, rasa percaya diri, atau arah hidupmu bergeser?",
      additionalNotes: "Catatan Tambahan (opsional)",
      saveReflection: "Simpan Refleksi",
      backToReflections: "Kembali ke Refleksi",
      noReflections: "Belum ada arsip refleksi mingguan.",
    },
    journey: {
      title: "Perjalanan Hidup",
      subtitle: "Peristiwa bermakna sepanjang hidupmu. Momen terpilih, bukan sampah log database.",
      comparePeriods: "Bandingkan Periode",
      groundedInsights: "Apa yang Berubah? (Bukti Nyata)",
      objective: "Objektif",
      behavioral: "Perilaku",
      subjective: "Subjektif",
      lifeEvents: "Peristiwa Hidup",
      currentGoals: "Target Berjalan",
      progressOverTime: "Kemajuan Seiring Waktu (2026)",
      reflectionExcerpts: "Kutipan Refleksi",
      backToTimeline: "Kembali ke Linimasa",
      noTimeline: "Garis waktu perjalanan masih kosong.",
      noProgress: "Belum ada target atau tahapan untuk melacak perkembangan.",
      noCompare: "Belum ada data pembanding. Butuh minimal 2 periode yang tercatat.",
    },
    settings: {
      title: "Pengaturan",
      subtitle: "Kelola preferensi akun, privasi data, dan arsip kepemilikan data jangka panjang.",
      accountProfile: "Profil Akun",
      name: "Nama",
      email: "Email",
      preferences: "Preferensi & Zona Waktu",
      timezone: "Zona Waktu",
      language: "Bahasa / Language / Sprache",
      languageDesc: "Pilih bahasa utama untuk seluruh tampilan antarmuka ORBIT.",
      dataOwnership: "Kepemilikan Data & Arsip Jangka Panjang",
      dataOwnershipDesc: "ORBIT dirancang untuk menyimpan jejak hidupmu selama bertahun-tahun. Ekspor seluruh data mentah JSON kapan saja.",
      exportButton: "Ekspor Seluruh Data (JSON)",
      exportedSuccess: "Arsip Berhasil Diekspor",
      logout: "Keluar dari Akun ORBIT",
    },
  },
};
