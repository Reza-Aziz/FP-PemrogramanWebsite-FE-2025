# Find The Match - Module Documentation

Modul ini adalah implementasi dari mini-game "Find The Match", sebuah game edukasi interaktif pencocokan pasangan soal dan jawaban.

## 🎮 Panduan Bermain (How to Play)

### Gameplay Mechanics

Game ini menguji ketelitian kamu dalam mencocokkan soal dengan jawaban yang tepat.

- **Tujuan**: Cocokkan semua pertanyaan dengan jawaban yang benar.
- **Nyawa (Lives)**:
  - Kamu diberikan modal nyawa (standard: 10).
  - Setiap kesalahan akan mengurangi 1 nyawa.
- **Mekanisme Jawab**:
  1.  **Lihat Kartu Soal**: Kartu soal akan muncul satu per satu dengan animasi.
  2.  **Pilih Jawaban**: Klik salah satu tombol jawaban yang cocok.
  3.  **Benar**:
      - Muncul efek confetti dan feedback positif.
      - Soal selesai, lanjut ke soal berikutnya.
  4.  **Salah**:
      - Nyawa berkurang -1.
      - **Auto-Skip**: Soal akan otomatis bergeser (_slide out_) dan diganti soal baru. Ini mencegah pemain menebak-nebak di soal yang sama (brute force).
      - Muncul animasi getar (_shake_) dan feedback "Wrong".

- **Game Over**: Jika nyawa mencapai 0.
- **Win**: Jika semua pasangan berhasil ditemukan.

---

## 🛠️ Panduan Membuat Game (Untuk Developer/Creator)

Jika ingin menambahkan konten game baru bertipe "Find The Match":

### 1. Upload & Setup

- **Akses**: Masuk ke menu **Create Game**.
- **Template**: Pilih template "Find The Match".
- **Form Data**:
  - **Judul**: Beri nama game.
  - **Thumbnail**: Wajib upload. Gambar ini disimpan di `public/uploads` server dan dipanggil via `VITE_API_URL` di frontend.

### 2. Struktur Kode (Developer Info)

- **Directory**: `src/pages/FindTheMatch/`
- **Komponen Utama**:
  - `PlayFindTheMatch.tsx`: Core game logic (state, timer, score, lives).
  - `components/GameHeader.tsx`: Navbar atas & skor.
  - `components/Feedback.tsx`: Overlay animasi benar/salah.
  - `components/GameOverScreen.tsx`: Layar hasil akhir.
- **Styling**:
  - Menggunakan Tailwind CSS.
  - Tema warna: Dominan **Kuning/Orange** (`bg-gradient-to-br from-yellow-300`).
  - Font: Menggunakan shadcn/ui typography.

---

## 🚀 Fitur Teknis

- **Animations**:
  - `lucide-react` icons.
  - `canvas-confetti` untuk efek menang.
  - CSS Keyframes untuk animasi `sway` (header), `slide-in`, dan `shake`.
- **Sound**:
  - `pop.mp3`, `error.mp3`, `success.mp3` untuk feedback audio.
  - Toggle mute sound tersedia di pojok kanan atas.
