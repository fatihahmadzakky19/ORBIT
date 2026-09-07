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
