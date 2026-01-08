// Array warna yang merepresentasikan grup.
// Digunakan untuk menentukan jumlah maksimal grup yang dapat dibuat.
const colors = [
    { name: "Merah", hex: "#ffadad" },
    { name: "Kuning", hex: "#fdffb6" },
    { name: "Hijau", hex: "#caffbf" },
    { name: "Biru", hex: "#a0c4ff" },
    { name: "Ungu", hex: "#bdb2ff" },
    { name: "Oranye", hex: "#ffd6a5" },
    { name: "Abu", hex: "#dcdcdc" },
    { name: "Pink", hex: "#ffc6ff" }
];

// Variabel untuk menghitung jumlah grup yang sedang aktif
let activeCircles = 0;

// Fungsi yang dijalankan ketika halaman web selesai dimuat
window.onload = () => {
    // Secara default, dua grup pertama langsung ditampilkan
    addNewCircle();
    addNewCircle();
};

// Fungsi untuk menambahkan input grup baru
function addNewCircle() {

    // Mengecek apakah jumlah grup sudah mencapai batas maksimum
    if (activeCircles >= colors.length) {
        alert("Maksimal " + colors.length + " grup");
        return;
    }

    // Mengambil data warna sesuai indeks grup yang aktif
    const color = colors[activeCircles];

    // Membuat elemen div sebagai wadah grup
    const div = document.createElement("div");
    div.className = "circle-card";

    // Mengisi konten grup, terdiri dari:
    // - Indikator warna
    // - Nama grup
    // - Textarea untuk input nama anggota
    div.innerHTML = `
        <div class="circle-header">
            <span class="color-dot" style="background:${color.hex}"></span>
            ${color.name}
        </div>
        <textarea id="input-${activeCircles}" placeholder="Nama dipisah koma / enter"></textarea>
    `;

    // Menambahkan elemen grup ke dalam container pada halaman
    document.getElementById("inputContainer").appendChild(div);

    // Menambah jumlah grup aktif
    activeCircles++;
}

// Fungsi untuk memvalidasi input angka agar hanya berisi digit
function preventInvalidNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    input.value = input.value.replace(/^0+(?=\d)/, '');

    if (input.value === '') {
        input.value = '0';
    }
}

// Fungsi utama untuk menghasilkan denah tempat duduk
function generateLayout() {

    // Mengambil jumlah baris dan kolom dari input pengguna
    // Operator + digunakan untuk mengonversi string menjadi number
    const rows = +document.getElementById("rows").value;
    const cols = +document.getElementById("cols").value;

    // Objek untuk menyimpan data siswa secara unik (menghindari duplikasi)
    let studentMap = {};

    // Membaca input nama siswa dari setiap grup
    for (let i = 0; i < activeCircles; i++) {

        const raw = document.getElementById(`input-${i}`).value;

        // Memisahkan nama berdasarkan koma atau baris baru
        const names = raw
            .split(/[\n,]+/)
            .map(x => x.trim())
            .filter(Boolean);

        names.forEach(name => {

            // Menggunakan lowercase sebagai key agar tidak terjadi duplikasi nama
            const key = name.toLowerCase();

            // Jika siswa belum terdaftar, buat entri baru
            if (!studentMap[key]) {
                studentMap[key] = {
                    displayName: name,
                    groups: [],
                    hexColors: []
                };
            }

            // Menambahkan grup dan warna jika belum tercatat
            if (!studentMap[key].groups.includes(colors[i].name)) {
                studentMap[key].groups.push(colors[i].name);
                studentMap[key].hexColors.push(colors[i].hex);
            }
        });
    }

    // Mengubah objek studentMap menjadi array agar dapat diproses lebih lanjut
    const students = Object.values(studentMap);

    // Mengurutkan siswa berdasarkan jumlah grup (prioritas lebih tinggi untuk siswa dengan banyak konflik)
    students.sort((a, b) => b.groups.length - a.groups.length);

    // Memanggil fungsi untuk menyusun denah tempat duduk
    renderGridSafe(students, rows, cols);
}

// Fungsi untuk menyusun dan menampilkan denah tempat duduk secara aman
function renderGridSafe(students, rows, cols) {

    const classroom = document.getElementById("classroom");

    // Mengosongkan tampilan kelas sebelum menghasilkan denah baru
    classroom.innerHTML = "";

    // Mengecek apakah jumlah kursi mencukupi
    if (rows * cols < students.length) {
        alert(`Jumlah kursi (${rows * cols}) kurang dari jumlah siswa (${students.length})!`);
        return;
    }

    // Mengatur jumlah kolom grid pada tampilan kelas
    classroom.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const total = rows * cols;

    // Array untuk merepresentasikan kursi (null berarti kosong)
    let grid = Array(total).fill(null);

    // Fungsi untuk mengecek konflik antar dua siswa
    // Konflik terjadi jika keduanya berada dalam grup yang sama
    function hasConflict(studentA, studentB) {
        if (!studentA || !studentB) return false;

        return studentA.groups.some(group =>
            studentB.groups.includes(group)
        );
    }

    // Fungsi untuk mengecek apakah suatu posisi kursi valid
    function isValid(pos, studentToPlace) {

        const r = Math.floor(pos / cols);
        const c = pos % cols;

        // Daftar posisi kursi yang bersebelahan
        const neighbors = [
            [r - 1, c], // atas
            [r + 1, c], // bawah
            [r, c - 1], // kiri
            [r, c + 1]  // kanan
        ];

        return neighbors.every(([nr, nc]) => {

            // Posisi di luar grid dianggap aman
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                return true;
            }

            const idx = nr * cols + nc;
            const neighbor = grid[idx];

            // Kursi kosong tidak menimbulkan konflik
            if (!neighbor) return true;

            // Kursi valid jika tidak terjadi konflik grup
            return !hasConflict(studentToPlace, neighbor);
        });
    }

    // Algoritma backtracking untuk mencari susunan tempat duduk yang valid
    function backtrack(index) {

        // Basis rekursi: semua siswa telah ditempatkan
        if (index === students.length) {
            return true;
        }

        for (let pos = 0; pos < total; pos++) {
            if (!grid[pos] && isValid(pos, students[index])) {

                // Menempatkan siswa pada posisi tertentu
                grid[pos] = students[index];

                // Rekursi untuk siswa berikutnya
                if (backtrack(index + 1)) {
                    return true;
                }

                // Jika gagal, batalkan penempatan (backtrack)
                grid[pos] = null;
            }
        }
        return false;
    }

    // Jika tidak ditemukan solusi
    if (!backtrack(0)) {
        alert("❌ Tidak ada solusi valid! Coba perbesar ukuran kelas atau kurangi siswa dengan grup ganda.");
        return;
    }

    // Menampilkan hasil denah ke halaman web
    for (let i = 0; i < total; i++) {

        const desk = document.createElement("div");
        const data = grid[i];

        if (data) {
            desk.className = "desk";

            // Satu grup menggunakan satu warna,
            // lebih dari satu grup ditampilkan dengan gradasi warna
            if (data.hexColors.length === 1) {
                desk.style.backgroundColor = data.hexColors[0];
            } else {
                desk.style.background = `linear-gradient(135deg, ${data.hexColors.join(", ")})`;
            }

            const groupsLabel = data.groups.join(" & ");

            desk.innerHTML = `
                <span class="student-name">${data.displayName}</span>
                <span class="circle-label" title="${groupsLabel}">${groupsLabel}</span>
            `;
        } else {
            // Tampilan kursi kosong
            desk.className = "desk empty-desk";
            desk.innerHTML = `<span style="font-size:12px">Kosong</span>`;
        }

        classroom.appendChild(desk);
    }
}
