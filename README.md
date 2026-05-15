# 📍 Nongkrong.zip

Nongkrong.zip adalah website asisten AI estetik berbalut desain *brutalist* yang dirancang khusus untuk merekomendasikan tempat nongkrong di Jakarta. Aplikasi ini menggunakan teknologi RAG (Retrieval-Augmented Generation) melalui Gemini AI dan dataset lokal untuk menyajikan rekomendasi tempat "skena", *hidden gem*, *listening bar*, hingga *art space* secara akurat dan interaktif di atas Google Maps.

## ✨ Fitur Utama
- **AI Chat Assistant**: Ngobrol santai dengan bot bergaya Gen-Z untuk mencari tempat nongkrong yang sesuai dengan *mood* kamu (melow, deep talk, atau gigs).
- **Interactive Map**: Rekomendasi tempat langsung divisualisasikan dalam bentuk pin pada Google Maps.
- **RAG Architecture**: Mencari tempat berdasarkan *dataset* asli Jakarta secara lokal (offline database) yang membuat respon AI sangat akurat, tanpa halusinasi, dan hemat kuota API.
- **Save & Favorite**: Simpan riwayat obrolan (session) atau jadikan tempat favoritmu agar mudah diakses nanti.
- **Brutalist UI**: Desain antarmuka yang unik, tebal, estetik, dengan *dark mode* bawaan.

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion, shadcn/ui
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Maps**: Google Maps JavaScript API (`@vis.gl/react-google-maps`)
- **Database Lokal**: JSON Dataset terkompresi dari data CSV.

## 📦 Prasyarat Instalasi
Sebelum menjalankan project ini secara lokal, pastikan komputermu sudah ter-install:
- [Node.js](https://nodejs.org/en/) (Versi 18 atau 20+)
- Akun Google AI Studio (untuk Gemini API Key)
- Akun Google Cloud Console (untuk Google Maps Platform API Key)

## 🚀 Cara Menjalankan Project (Local Development)

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/USERNAME/Nongkrong.zip.git
   cd Nongkrong.zip
   ```

2. **Install semua dependencies:**
   ```bash
   npm install
   ```

3. **Setup Environment Variables:**
   Buat file baru bernama `.env` di direktori paling luar (sejajar dengan `package.json`), lalu salin format berikut dan isi dengan API Key kamu:
   ```env
   # Diperlukan untuk mengakses AI Gemini
   GEMINI_API_KEY="ISI_DENGAN_API_KEY_GEMINI_KAMU"

   # Diperlukan untuk merender visual peta pada aplikasi
   GOOGLE_MAPS_PLATFORM_KEY="ISI_DENGAN_API_KEY_GOOGLE_MAPS_KAMU"
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

5. **Buka di Browser:**
   Akses `http://localhost:3000/` pada browser favoritmu.

## 📂 Susunan Project (Folder Structure)
```
Nongkrong.zip/
├── public/                 # Aset statis publik
├── scripts/                
│   └── convert.py          # Script Python untuk konversi CSV ke JSON
├── src/
│   ├── components/         # Komponen UI React (Chat, Map, LandingPage)
│   ├── lib/                # Konfigurasi utilitas dan shadcn UI
│   ├── App.tsx             # File utama aplikasi (Entry Component)
│   ├── main.tsx            # DOM Entry
│   ├── PlaceContext.tsx    # State Management untuk Places & Favorites
│   ├── index.css           # Global Styling (Tailwind)
│   └── places.json         # Dataset lokal rekomendasi tempat (Hasil RAG)
├── .env.example            # Contoh template environment variables
├── Dockerfile              # Setup konfigurasi Docker (Production Ready)
└── package.json            # Daftar dependensi aplikasi
```

## 🎮 Contoh Penggunaan
1. Buka aplikasi, kamu akan disambut *Landing Page* estetik. Klik "Start".
2. Di kolom obrolan sebelah kiri, ketikkan *prompt* seperti:
   > *"Cariin listening bar yang asik buat dengerin vinyl daerah Jaksel bre."*
3. Bot AI akan membaca *database lokal* dan memberikan 5-7 rekomendasi lengkap dengan deskripsi gaulnya.
4. Pin merah akan otomatis muncul di peta Google Maps di layar bagian kanan.
5. Klik ikon ❤️ pada detail tempat di bawah peta untuk menyimpannya ke menu *"Terpilih"*.

## 🤝 Kontribusi
Kontribusi sangat terbuka! Jika kamu memiliki dataset tempat nongkrong baru, ingin memperbaiki *bug*, atau menambah fitur:
1. *Fork* repository ini.
2. Buat *branch* baru (`git checkout -b fitur-keren-kamu`).
3. *Commit* perubahanmu (`git commit -m 'Menambahkan fitur keren'`).
4. *Push* ke branch tersebut (`git push origin fitur-keren-kamu`).
5. Buat sebuah *Pull Request*.

## 📄 Lisensi
Distributed under the MIT License. See `LICENSE` for more information.
