let timList = []; // format: { tim: 'Tim A', player: 'Player A' }
let klasemen = {};
let pertandingan = [];
let namaLiga = "";

function setNamaLiga() {
  namaLiga = document.getElementById("namaLiga").value;
  if (!namaLiga) return;
  document.getElementById("judulTurnamen").innerText = namaLiga;
  document.getElementById("formNamaLiga").style.display = "none";
  document.getElementById("formJumlahTim").style.display = "block";
}

function generateInputTim() {
  const jumlah = parseInt(document.getElementById("jumlahTim").value);
  if (jumlah < 2) return;
  const container = document.getElementById("formInputTim");
  container.innerHTML = "<h2>Masukkan Nama Player dan Tim</h2>";
  for (let i = 0; i < jumlah; i++) {
    container.innerHTML += `Player ${i + 1}: <input type="text" id="player${i}" placeholder="Nama Player ${i + 1}" />` +
                           `&nbsp;&nbsp;Tim ${i + 1}: <input type="text" id="tim${i}" placeholder="Nama Tim ${i + 1}" /><br><br>`;
  }
  document.getElementById("formJumlahTim").style.display = "none";
  document.getElementById("btnSimpanTim").innerHTML = '<button onclick="simpanTim()" class="btn btn-primary">Simpan Tim</button>';
}

function simpanTim() {
  const jumlah = document.querySelectorAll("#formInputTim input").length / 2;
  timList = [];
  for (let i = 0; i < jumlah; i++) {
    const tim = document.getElementById("tim" + i).value;
    const player = document.getElementById("player" + i).value;
    if (!tim || !player) return alert("Semua nama tim dan player harus diisi.");
    timList.push({ tim, player });
  }
  klasemen = {};
  timList.forEach(({ tim }) => {
    klasemen[tim] = { main: 0, menang: 0, seri: 0, kalah: 0, gf: 0, ga: 0, poin: 0 };
  });
  document.getElementById("formInputTim").style.display = "none";
  document.getElementById("btnSimpanTim").style.display = "none";
  document.getElementById("formInputPertandingan").style.display = "block";
  populateSelectOptions();
  updateKlasemen();
}

function populateSelectOptions() {
  const timA = document.getElementById("timA");
  const timB = document.getElementById("timB");
  timA.innerHTML = "";
  timB.innerHTML = "";
  timList.forEach(({ tim }) => {
    const optionA = document.createElement("option");
    optionA.value = optionA.text = tim;
    timA.appendChild(optionA);

    const optionB = document.createElement("option");
    optionB.value = optionB.text = tim;
    timB.appendChild(optionB);
  });

  timA.onchange = () => {
    const val = timA.value;
    Array.from(timB.options).forEach(opt => opt.disabled = opt.value === val);
  };

  timB.onchange = () => {
    const val = timB.value;
    Array.from(timA.options).forEach(opt => opt.disabled = opt.value === val);
  };
}

function inputPertandingan() {
  const tA = timA.value, tB = timB.value;
  const sA = parseInt(document.getElementById("skorA").value);
  const sB = parseInt(document.getElementById("skorB").value);

  if (tA === tB) {
    alert("Tim tidak boleh melawan dirinya sendiri!");
    return;
  }

  if (isNaN(sA) || isNaN(sB)) {
    alert("Masukkan skor yang valid untuk kedua tim.");
    return;
  }

  pertandingan.push({ tA, tB, sA, sB });
  updateStatistik(tA, tB, sA, sB);
  updateKlasemen();
  updateTabelPertandingan();

  document.getElementById("skorA").value = "";
  document.getElementById("skorB").value = "";
}

function updateStatistik(tA, tB, sA, sB) {
  const a = klasemen[tA], b = klasemen[tB];
  a.main++; b.main++;
  a.gf += sA; a.ga += sB;
  b.gf += sB; b.ga += sA;
  if (sA > sB) { a.menang++; b.kalah++; a.poin += 3; }
  else if (sA < sB) { b.menang++; a.kalah++; b.poin += 3; }
  else { a.seri++; b.seri++; a.poin++; b.poin++; }
}

function updateKlasemen() {
  const tbody = document.getElementById("tabelKlasemen");
  const data = Object.entries(klasemen).map(([tim, stat]) => {
    return {
      tim,
      ...stat,
      gd: stat.gf - stat.ga
    };
  }).sort((a, b) => {
    if (b.poin !== a.poin) return b.poin - a.poin;
    if ((b.gf - b.ga) !== (a.gf - a.ga)) return (b.gf - b.ga) - (a.gf - a.ga);
    return b.gf - a.gf;
  });

  tbody.innerHTML = "";
  data.forEach((t, i) => {
    const player = timList.find(x => x.tim === t.tim)?.player || '-';
    tbody.innerHTML += `<tr><td>${i + 1}</td><td>${t.tim} (${player})</td><td>${t.main}</td><td>${t.menang}</td><td>${t.seri}</td><td>${t.kalah}</td><td>${t.gf}</td><td>${t.ga}</td><td>${t.gd}</td><td>${t.poin}</td></tr>`;
  });
}

function updateTabelPertandingan() {
  const tbody = document.getElementById("tabelPertandingan");
  tbody.innerHTML = "";
  pertandingan.forEach((p, i) => {
    const playerA = timList.find(x => x.tim === p.tA)?.player || '-';
    const playerB = timList.find(x => x.tim === p.tB)?.player || '-';
    tbody.innerHTML += `<tr><td>${i + 1}</td><td>${p.tA} (${playerA})</td><td>${p.sA} - ${p.sB}</td><td>${p.tB} (${playerB})</td></tr>`;
  });
}

function undoPertandingan() {
  const last = pertandingan.pop();
  if (!last) return;
  klasemen = {};
  timList.forEach(({ tim }) => {
    klasemen[tim] = { main: 0, menang: 0, seri: 0, kalah: 0, gf: 0, ga: 0, poin: 0 };
  });
  pertandingan.forEach(p => updateStatistik(p.tA, p.tB, p.sA, p.sB));
  updateKlasemen();
  updateTabelPertandingan();
}

function resetKlasemen() {
  if (!confirm("Apakah Anda yakin ingin mereset semua data?")) return;
  pertandingan = [];
  timList.forEach(({ tim }) => {
    klasemen[tim] = { main: 0, menang: 0, seri: 0, kalah: 0, gf: 0, ga: 0, poin: 0 };
  });
  updateKlasemen();
  updateTabelPertandingan();
}

function kembaliKeMenuAwal() {
  location.reload();
}
