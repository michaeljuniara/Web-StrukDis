// Daftar nama grup/warna
// Maksimal grup = jumlah warna
const colors = [
    { name: "Teal", hex: "#B2DFDB" },
    { name: "Kuning", hex: "#FFF9C4" },
    { name: "Hijau", hex: "#C8E6C9" },
    { name: "Biru", hex: "#BBDEFB" },
    { name: "Ungu", hex: "#E1BEE7" },
    { name: "Oranye", hex: "#FFE0B2" },
    { name: "Abu-abu", hex: "#ECEFF1" },
    { name: "Pink", hex: "#F8BBD0" },
    { name: "Lime", hex: "#F0F4C3"}
];

// Jumlah grup yang sedang aktif di halaman
let activeCircles = 0;

// Saat halaman pertama kali dibuka,
// otomatis tambahkan 2 grup input
window.onload = () => {
    addNewCircle();
    addNewCircle();
};

// Fungsi untuk menambah grup baru
function addNewCircle() {

    // Batasi jumlah grup di halaman sesuai jumlah warna
    if (activeCircles >= colors.length) {
        alert("Maksimal " + colors.length + " grup");
        return;
    }

    const color = colors[activeCircles];

    // Membuat elemen input grup baru
    const div = document.createElement("div");
    div.className = "circle-card";
    div.innerHTML = `
            <div class="circle-header">
                <span class="color-dot" style="background:${color.hex}"></span>
                ${color.name}
            </div>
            <textarea id="input-${activeCircles}" placeholder="Nama dipisah koma / enter"></textarea>
        `;
    document.getElementById("inputContainer").appendChild(div);
    activeCircles++;
}

// Membatasi input baris dan kolom hanya boleh oleh angka, tanpa huruf
function preventInvalidNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    input.value = input.value.replace(/^0+(?=\d)/, '');
    if (input.value === '') input.value = '0';
}

// Fungsi untuk generate tempat duduk
function generateLayout() {

    // Ambil jumlah baris dan kolom
    const rows = +document.getElementById("rows").value;
    const cols = +document.getElementById("cols").value;

    // Menyimpan data siswa unik
    // key = nama siswa (lower case)
    let studentMap = {};

    // Membaca input dari setiap grup
    for (let i = 0; i < activeCircles; i++) {
        const raw = document.getElementById(`input-${i}`).value;

        // Pisahkan nama berdasarkan koma atau enter
        const names = raw.split(/[\n,]+/).map(x => x.trim()).filter(Boolean);

        names.forEach(name => {

            const key = name.toLowerCase();

            // Jika siswa belum terdaftar, buat data beru
            if (!studentMap[key]) {
                studentMap[key] = {
                    displayName: name,
                    groups: [],
                    hexColors: []
                };
            }

            // Tambahkan grup jika belum ada
            if (!studentMap[key].groups.includes(colors[i].name)) {
                studentMap[key].groups.push(colors[i].name);
                studentMap[key].hexColors.push(colors[i].hex);
            }
        });
    }
    // Ubah map menjadi array siswa
    const students = Object.values(studentMap);

    // Urutkan siswa 
    students.sort((a, b) => b.groups.length - a.groups.length);

    renderGridSafe(students, rows, cols);
}

// Fungsi untuk render grid dan backtracking
function renderGridSafe(students, rows, cols) {
    const classroom = document.getElementById("classroom");
    classroom.innerHTML = "";

    // Cek apakah kursi cukup 
    if (rows * cols < students.length) {
        alert(`Jumlah kursi (${rows * cols}) kurang dari jumlah siswa (${students.length})!`);
        return;
    }

    classroom.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const total = rows * cols;
    let grid = Array(total).fill(null);

    // Fungsi untuk mengecek konflik antar siswa
    function hasConflict(studentA, studentB) {

        if (!studentA || !studentB) {
            return false;
        }

        const intersection = studentA.groups.filter(group => studentB.groups.includes(group));

        return intersection.length > 0;
    }

    // Cek apakah posisi valid
    function isValid(pos, studentToPlace) {
        const r = Math.floor(pos / cols);
        const c = pos % cols;

        const neighbors = [
            [r - 1, c], // Atas
            [r + 1, c], // Bawah
            [r, c - 1], // Kiri
            [r, c + 1]  // Kanan
        ];

        return neighbors.every(([nr, nc]) => {
            
            // Jika di luar grid, aman
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                return true;
            }

            const idx = nr * cols + nc;
            const neighbor = grid[idx];

            // Jika kosong, aman
            if (!neighbor) {
                return true;
            }

            // Tidak boleh ada konflik grup 
            return !hasConflict(studentToPlace, neighbor);
        });
    }
        // Funsi untuk backtrack
        function backtrack(index) {
            
            // Semua siswa berhasil di tempatkan
            if (index === students.length) {
                return true;
            }

            for (let pos = 0; pos < total; pos++) {
                if (!grid[pos] && isValid(pos, students[index])) {
                    grid[pos] = students[index];

                    if (backtrack(index + 1)) {
                        return true; 
                    }
                    
                    // Undo (Backtrack)
                    grid[pos] = null; 
                }
            }
            return false;
        }

    // Jika tidak ada solusi
    if (!backtrack(0)) {
        alert("❌ Tidak ada solusi valid! Coba perbesar ukuran kelas atau kurangi siswa dengan grup ganda.");
        return;
    }

    // Tampilkan hasil ke layar
    for (let i = 0; i < total; i++) {
        const desk = document.createElement("div");
        const data = grid[i];
        if (data) {
            desk.className = "desk";

            // Warna tunggal atau gradasi jika multi-grup
            if (data.hexColors.length === 1) {
                desk.style.backgroundColor = data.hexColors[0];
            } else {
                desk.style.background = `linear-gradient(135deg, ${data.hexColors.join(", ")})`;
            }

            const fullGroupLabel = data.groups.join(", ");
            desk.innerHTML = `
                <span class="student-name">${data.displayName}</span>
                <span class="circle-label clickable" title="Klik untuk lihat semua grup">
                    ${fullGroupLabel}
                </span>
            `;

            // Klik untuk detail siswa
            desk.querySelector(".circle-label").onclick = (e) => {
                e.stopPropagation();
                alert(`Nama: ${data.displayName}\nGrup: ${fullGroupLabel}`);
            };
        }

        else {
            // Kursi kosong
            desk.className = "desk empty-desk";
            desk.innerHTML = `<span style="font-size:12px">Kosong</span>`;
        }

        classroom.appendChild(desk);
    }
}
