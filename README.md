Pengatur Denah Tempat Duduk Anti Nyontek

Aplikasi web sederhana untuk mengatur tempat duduk siswa agar siswa dari grup yang sama tidak duduk bersebelahan.

Fitur
- Mengatur denah kelas berbasis baris dan kolom
- Setiap siswa hanya boleh duduk bersebelahan dengan siswa dari grup berbeda
- Pewarnaan kursi berdasarkan grup
- Validasi input (tidak boleh minus / simbol)
- Backtracking untuk mencari solusi tempat duduk yang valid

Memakai bahsa pemrograman
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Algorithm: Backtracking + Graph Coloring sederhana

Cara Menjalankan
1. Clone atau download repository ini
2. Buka file `index.html` menggunakan browser
3. Tidak membutuhkan server atau instalasi tambahan

Cara Menggunakan
1. Jika jumlah grup lebih dari 2, klik tombol **Tambah Grup** untuk menambah warna
   <img width="593" height="314" alt="image" src="https://github.com/user-attachments/assets/5ef74d69-e685-4ce6-adbc-349455fb2c9f" />

2. Masukkan nama siswa pada masing-masing grup
   (pisahkan dengan koma atau enter)
   <img width="2195" height="902" alt="image" src="https://github.com/user-attachments/assets/8873f3b1-a692-4701-9b9a-ed777c7ffe43" />

3. Tentukan jumlah baris dan kolom kelas
   <img width="1118" height="412" alt="image" src="https://github.com/user-attachments/assets/ef68a821-fa8b-4259-b8be-05b0fae8f210" />

4. Klik **Generate Denah**
   <img width="905" height="255" alt="image" src="https://github.com/user-attachments/assets/3ed8f9a4-7449-4e0d-87df-98abb0e20530" />
   
5. Sistem akan menampilkan susunan kursi yang valid
   <img width="1927" height="1310" alt="image" src="https://github.com/user-attachments/assets/3a7a57bc-a377-4cff-a067-8d6f739d22dc" />

Catatan
- Jika jumlah kursi lebih sedikit dari jumlah siswa, solusi tidak akan ditemukan
  <img width="927" height="287" alt="image" src="https://github.com/user-attachments/assets/ae2dfa20-016a-4e56-8d31-50ba91693ee7" />

- Satu siswa boleh berada dalam banyak grup
- Solusi yang dihasilkan adalah salah satu solusi valid, bukan semua kemungkinan
