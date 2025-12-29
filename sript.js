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

let activeCircles = 0;

window.onload = () => {
    addNewCircle();
    addNewCircle();
};

function addNewCircle() {
    if (activeCircles >= colors.length) {
        alert("Maksimal " + colors.length + " grup");
        return;
    }

    const color = colors[activeCircles];
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

function preventInvalidNumberInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    input.value = input.value.replace(/^0+(?=\d)/, '');
    if (input.value === '') input.value = '0';
}

function generateLayout() {
    const rows = +document.getElementById("rows").value;
    const cols = +document.getElementById("cols").value;

    let studentMap = {};

    for (let i = 0; i < activeCircles; i++) {
        const raw = document.getElementById(`input-${i}`).value;

        const names = raw.split(/[\n,]+/).map(x => x.trim()).filter(Boolean);

        names.forEach(name => {

            const key = name.toLowerCase();

            if (!studentMap[key]) {
                studentMap[key] = {
                    displayName: name,
                    groups: [],
                    hexColors: []
                };
            }

            if (!studentMap[key].groups.includes(colors[i].name)) {
                studentMap[key].groups.push(colors[i].name);
                studentMap[key].hexColors.push(colors[i].hex);
            }
        });
    }

    const students = Object.values(studentMap);

    students.sort((a, b) => b.groups.length - a.groups.length);

    renderGridSafe(students, rows, cols);
}

function renderGridSafe(students, rows, cols) {
    const classroom = document.getElementById("classroom");
    classroom.innerHTML = "";

    if (rows * cols < students.length) {
        alert(`Jumlah kursi (${rows * cols}) kurang dari jumlah siswa (${students.length})!`);
        return;
    }

    classroom.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const total = rows * cols;
    let grid = Array(total).fill(null);

    function hasConflict(studentA, studentB) {

        if (!studentA || !studentB) {
            return false;
        }

        const intersection = studentA.groups.filter(group => studentB.groups.includes(group));

        return intersection.length > 0;
    }

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
          
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                return true;
            }

            const idx = nr * cols + nc;
            const neighbor = grid[idx];

            if (!neighbor) {
                return true;
            }

            return !hasConflict(studentToPlace, neighbor);
        });
    }

    function backtrack(index) {
  
        if (index === students.length) {
            return true;
        }

        for (let pos = 0; pos < total; pos++) {
            if (!grid[pos] && isValid(pos, students[index])) {
                grid[pos] = students[index];

                if (backtrack(index + 1)) {
                    return true; 
                }

                grid[pos] = null; 
            }
        }
        return false;
    }

    if (!backtrack(0)) {
        alert("❌ Tidak ada solusi valid! Coba perbesar ukuran kelas atau kurangi siswa dengan grup ganda.");
        return;
    }

    for (let i = 0; i < total; i++) {
        const desk = document.createElement("div");
        const data = grid[i];

        if (data) {
            desk.className = "desk";

            if (data.hexColors.length === 1) {
                desk.style.backgroundColor = data.hexColors[0];
            } else {
                const gradientColors = data.hexColors.join(", ");
                desk.style.background = `linear-gradient(135deg, ${gradientColors})`;
            }

            const groupsLabel = data.groups.join(" & ");

            desk.innerHTML = `
                    <span class="student-name">${data.displayName}</span>
                    <span class="circle-label" title="${groupsLabel}">${groupsLabel}</span>
                `;
        }
        else {
            desk.className = "desk empty-desk";
            desk.innerHTML = `<span style="font-size:12px">Kosong</span>`;
        }

        classroom.appendChild(desk);
    }
}

