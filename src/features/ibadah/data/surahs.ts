export interface QuranSurah {
  number: number;
  name: string;
  arabicName: string;
  totalAyahs: number;
  startJuz: number;
  meaning: string;
}

export const QURAN_SURAHS: QuranSurah[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", totalAyahs: 7, startJuz: 1, meaning: "Pembukaan" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", totalAyahs: 286, startJuz: 1, meaning: "Sapi Betina" },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", totalAyahs: 200, startJuz: 3, meaning: "Keluarga Imran" },
  { number: 4, name: "An-Nisa'", arabicName: "النساء", totalAyahs: 176, startJuz: 4, meaning: "Wanita" },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", totalAyahs: 120, startJuz: 6, meaning: "Hidangan" },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", totalAyahs: 165, startJuz: 7, meaning: "Binatang Ternak" },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", totalAyahs: 206, startJuz: 8, meaning: "Tempat Tertinggi" },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", totalAyahs: 75, startJuz: 9, meaning: "Harta Rampasan Perang" },
  { number: 9, name: "At-Taubah", arabicName: "التوبة", totalAyahs: 129, startJuz: 10, meaning: "Pengampunan" },
  { number: 10, name: "Yunus", arabicName: "يونس", totalAyahs: 109, startJuz: 11, meaning: "Nabi Yunus" },
  { number: 11, name: "Hud", arabicName: "هود", totalAyahs: 123, startJuz: 11, meaning: "Nabi Hud" },
  { number: 12, name: "Yusuf", arabicName: "يوسف", totalAyahs: 111, startJuz: 12, meaning: "Nabi Yusuf" },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", totalAyahs: 43, startJuz: 13, meaning: "Guruh" },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", totalAyahs: 52, startJuz: 13, meaning: "Nabi Ibrahim" },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", totalAyahs: 99, startJuz: 14, meaning: "Bukit Hijr" },
  { number: 16, name: "An-Nahl", arabicName: "النحل", totalAyahs: 128, startJuz: 14, meaning: "Lebah" },
  { number: 17, name: "Al-Isra'", arabicName: "الإسراء", totalAyahs: 111, startJuz: 15, meaning: "Memperjalankan Malam Hari" },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", totalAyahs: 110, startJuz: 15, meaning: "Gua" },
  { number: 19, name: "Maryam", arabicName: "مريم", totalAyahs: 98, startJuz: 16, meaning: "Maryam" },
  { number: 20, name: "Ta-Ha", arabicName: "طه", totalAyahs: 135, startJuz: 16, meaning: "Ta-Ha" },
  { number: 21, name: "Al-Anbiya'", arabicName: "الأنبياء", totalAyahs: 112, startJuz: 17, meaning: "Para Nabi" },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", totalAyahs: 78, startJuz: 17, meaning: "Haji" },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", totalAyahs: 118, startJuz: 18, meaning: "Orang-Orang Mukmin" },
  { number: 24, name: "An-Nur", arabicName: "النور", totalAyahs: 64, startJuz: 18, meaning: "Cahaya" },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", totalAyahs: 77, startJuz: 18, meaning: "Pembeda" },
  { number: 26, name: "Asy-Syu'ara'", arabicName: "الشعراء", totalAyahs: 227, startJuz: 19, meaning: "Penyair" },
  { number: 27, name: "An-Naml", arabicName: "النمل", totalAyahs: 93, startJuz: 19, meaning: "Semut" },
  { number: 28, name: "Al-Qashash", arabicName: "القصص", totalAyahs: 88, startJuz: 20, meaning: "Kisah-Kisah" },
  { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", totalAyahs: 69, startJuz: 20, meaning: "Laba-Laba" },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", totalAyahs: 60, startJuz: 21, meaning: "Bangsa Romawi" },
  { number: 31, name: "Luqman", arabicName: "لقمان", totalAyahs: 34, startJuz: 21, meaning: "Keluarga Luqman" },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", totalAyahs: 30, startJuz: 21, meaning: "Sajdah" },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", totalAyahs: 73, startJuz: 21, meaning: "Golongan yang Bersekutu" },
  { number: 34, name: "Saba'", arabicName: "سبإ", totalAyahs: 54, startJuz: 22, meaning: "Kaum Saba'" },
  { number: 35, name: "Fathir", arabicName: "فاطر", totalAyahs: 45, startJuz: 22, meaning: "Pencipta" },
  { number: 36, name: "Ya-Sin", arabicName: "يس", totalAyahs: 83, startJuz: 22, meaning: "Ya-Sin" },
  { number: 37, name: "Ash-Shaffat", arabicName: "الصافات", totalAyahs: 182, startJuz: 23, meaning: "Barisan-Barisan" },
  { number: 38, name: "Shad", arabicName: "ص", totalAyahs: 88, startJuz: 23, meaning: "Shad" },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", totalAyahs: 75, startJuz: 23, meaning: "Rombongan" },
  { number: 40, name: "Ghafir", arabicName: "غافر", totalAyahs: 85, startJuz: 24, meaning: "Maha Pengampun" },
  { number: 41, name: "Fushshilat", arabicName: "فصلت", totalAyahs: 54, startJuz: 24, meaning: "Yang Dijelaskan" },
  { number: 42, name: "Asy-Syura", arabicName: "الشورى", totalAyahs: 53, startJuz: 25, meaning: "Musyawarah" },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", totalAyahs: 89, startJuz: 25, meaning: "Perhiasan" },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", totalAyahs: 59, startJuz: 25, meaning: "Kabut Asap" },
  { number: 45, name: "Al-Jatsiyah", arabicName: "الجاثية", totalAyahs: 37, startJuz: 25, meaning: "Yang Berlutut" },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", totalAyahs: 35, startJuz: 26, meaning: "Bukit Pasir" },
  { number: 47, name: "Muhammad", arabicName: "محمد", totalAyahs: 38, startJuz: 26, meaning: "Nabi Muhammad" },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", totalAyahs: 29, startJuz: 26, meaning: "Kemenangan" },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", totalAyahs: 18, startJuz: 26, meaning: "Kamar-Kamar" },
  { number: 50, name: "Qaf", arabicName: "ق", totalAyahs: 45, startJuz: 26, meaning: "Qaf" },
  { number: 51, name: "Adz-Dzariyat", arabicName: "الذاريات", totalAyahs: 60, startJuz: 26, meaning: "Angin yang Menerbangkan" },
  { number: 52, name: "Ath-Thur", arabicName: "الطور", totalAyahs: 49, startJuz: 27, meaning: "Bukit Tursina" },
  { number: 53, name: "An-Najm", arabicName: "النجم", totalAyahs: 62, startJuz: 27, meaning: "Bintang" },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", totalAyahs: 55, startJuz: 27, meaning: "Bulan" },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", totalAyahs: 78, startJuz: 27, meaning: "Maha Pemurah" },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", totalAyahs: 96, startJuz: 27, meaning: "Hari Kiamat" },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", totalAyahs: 29, startJuz: 27, meaning: "Besi" },
  { number: 58, name: "Al-Mujadilah", arabicName: "المجادلة", totalAyahs: 22, startJuz: 28, meaning: "Gugatan" },
  { number: 59, name: "Al-Hasyr", arabicName: "الحشر", totalAyahs: 24, startJuz: 28, meaning: "Pengusiran" },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", totalAyahs: 13, startJuz: 28, meaning: "Wanita yang Diuji" },
  { number: 61, name: "Ash-Shaff", arabicName: "الصف", totalAyahs: 14, startJuz: 28, meaning: "Barisan" },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", totalAyahs: 11, startJuz: 28, meaning: "Hari Jumat" },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", totalAyahs: 11, startJuz: 28, meaning: "Orang-Orang Munafik" },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", totalAyahs: 18, startJuz: 28, meaning: "Hari Dinampakkannya Kesalahan" },
  { number: 65, name: "Ath-Thalaq", arabicName: "الطلاق", totalAyahs: 12, startJuz: 28, meaning: "Perceraian" },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", totalAyahs: 12, startJuz: 28, meaning: "Pengharaman" },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", totalAyahs: 30, startJuz: 29, meaning: "Kerajaan" },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", totalAyahs: 52, startJuz: 29, meaning: "Pena" },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", totalAyahs: 52, startJuz: 29, meaning: "Hari Kiamat yang Pasti" },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", totalAyahs: 44, startJuz: 29, meaning: "Tempat-Tempat Naik" },
  { number: 71, name: "Nuh", arabicName: "نوح", totalAyahs: 28, startJuz: 29, meaning: "Nabi Nuh" },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", totalAyahs: 28, startJuz: 29, meaning: "Jin" },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", totalAyahs: 20, startJuz: 29, meaning: "Orang yang Berselimut" },
  { number: 74, name: "Al-Muddatstsir", arabicName: "المدثر", totalAyahs: 56, startJuz: 29, meaning: "Orang yang Berkemul" },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", totalAyahs: 40, startJuz: 29, meaning: "Hari Kiamat" },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", totalAyahs: 31, startJuz: 29, meaning: "Manusia" },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", totalAyahs: 50, startJuz: 29, meaning: "Malaikat yang Diutus" },
  { number: 78, name: "An-Naba'", arabicName: "النبإ", totalAyahs: 40, startJuz: 30, meaning: "Berita Besar" },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", totalAyahs: 46, startJuz: 30, meaning: "Malaikat Pencabut" },
  { number: 80, name: "'Abasa", arabicName: "عبس", totalAyahs: 42, startJuz: 30, meaning: "Ia Bermuka Masam" },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", totalAyahs: 29, startJuz: 30, meaning: "Menggulung" },
  { number: 82, name: "Al-Infithar", arabicName: "الانفطار", totalAyahs: 19, startJuz: 30, meaning: "Terbelah" },
  { number: 83, name: "Al-Muthaffifin", arabicName: "المطففين", totalAyahs: 36, startJuz: 30, meaning: "Orang yang Curang" },
  { number: 84, name: "Al-Insyiqaq", arabicName: "الانشقاق", totalAyahs: 25, startJuz: 30, meaning: "Terbelah" },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", totalAyahs: 22, startJuz: 30, meaning: "Gugusan Bintang" },
  { number: 86, name: "Ath-Thariq", arabicName: "الطارق", totalAyahs: 17, startJuz: 30, meaning: "Yang Datang di Malam Hari" },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", totalAyahs: 19, startJuz: 30, meaning: "Maha Tinggi" },
  { number: 88, name: "Al-Ghasyiyah", arabicName: "الغاشية", totalAyahs: 26, startJuz: 30, meaning: "Hari Pembalasan" },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", totalAyahs: 30, startJuz: 30, meaning: "Fajar" },
  { number: 90, name: "Al-Balad", arabicName: "البلد", totalAyahs: 20, startJuz: 30, meaning: "Negeri" },
  { number: 91, name: "Asy-Syams", arabicName: "الشمس", totalAyahs: 15, startJuz: 30, meaning: "Matahari" },
  { number: 92, name: "Al-Lail", arabicName: "الليل", totalAyahs: 21, startJuz: 30, meaning: "Malam" },
  { number: 93, name: "Adh-Dhuha", arabicName: "الضحى", totalAyahs: 11, startJuz: 30, meaning: "Waktu Dhuha" },
  { number: 94, name: "Asy-Syarh", arabicName: "الشرح", totalAyahs: 8, startJuz: 30, meaning: "Kelapangan" },
  { number: 95, name: "At-Tin", arabicName: "التين", totalAyahs: 8, startJuz: 30, meaning: "Buah Tin" },
  { number: 96, name: "Al-'Alaq", arabicName: "العلق", totalAyahs: 19, startJuz: 30, meaning: "Segumpal Darah" },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", totalAyahs: 5, startJuz: 30, meaning: "Kemuliaan" },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", totalAyahs: 8, startJuz: 30, meaning: "Bukti Nyata" },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", totalAyahs: 8, startJuz: 30, meaning: "Keguncangan" },
  { number: 100, name: "Al-'Adiyat", arabicName: "العاديات", totalAyahs: 11, startJuz: 30, meaning: "Kuda Perang Berlari Cepat" },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", totalAyahs: 11, startJuz: 30, meaning: "Hari Kiamat yang Menggemparkan" },
  { number: 102, name: "At-Takatsur", arabicName: "التكاثر", totalAyahs: 8, startJuz: 30, meaning: "Bermegah-Megahan" },
  { number: 103, name: "Al-'Ashr", arabicName: "العصر", totalAyahs: 3, startJuz: 30, meaning: "Masa / Waktu" },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", totalAyahs: 9, startJuz: 30, meaning: "Pengumpat" },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", totalAyahs: 5, startJuz: 30, meaning: "Gajah" },
  { number: 106, name: "Quraisy", arabicName: "قريش", totalAyahs: 4, startJuz: 30, meaning: "Suku Quraisy" },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", totalAyahs: 7, startJuz: 30, meaning: "Barang yang Berguna" },
  { number: 108, name: "Al-Kautsar", arabicName: "الكوثر", totalAyahs: 3, startJuz: 30, meaning: "Nikmat yang Berlimpah" },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", totalAyahs: 6, startJuz: 30, meaning: "Orang-Orang Kafir" },
  { number: 110, name: "An-Nashr", arabicName: "النصر", totalAyahs: 3, startJuz: 30, meaning: "Pertolongan" },
  { number: 111, name: "Al-Lahab", arabicName: "اللهب", totalAyahs: 5, startJuz: 30, meaning: "Gejolak Api" },
  { number: 112, name: "Al-Ikhlash", arabicName: "الإخلاص", totalAyahs: 4, startJuz: 30, meaning: "Memurnikan Keesean Allah" },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", totalAyahs: 5, startJuz: 30, meaning: "Waktu Subuh" },
  { number: 114, name: "An-Nas", arabicName: "الناس", totalAyahs: 6, startJuz: 30, meaning: "Manusia" },
];

export function searchSurahs(query: string): QuranSurah[] {
  const q = query.trim().toLowerCase();
  if (!q) return QURAN_SURAHS;

  return QURAN_SURAHS.filter((s) => {
    return (
      s.number.toString() === q ||
      s.name.toLowerCase().includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      s.arabicName.includes(q)
    );
  });
}

export function getSurahByNumber(num: number): QuranSurah | undefined {
  return QURAN_SURAHS.find((s) => s.number === num);
}

export function getSurahByName(name: string): QuranSurah | undefined {
  return QURAN_SURAHS.find(
    (s) => s.name.toLowerCase() === name.toLowerCase() || s.number.toString() === name
  );
}
